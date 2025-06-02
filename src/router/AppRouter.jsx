import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import HomePage from "../components/pages/HomePage";
import RoadmapVisualizer from "../components/pages/RoadmapVisualizer";
import NotFoundPage from "../components/pages/NotFoundPage";
import RoadmapLoader from "../components/pages/RoadmapLoader";
import RoadmapAssembler from "../components/assembler/RoadmapAssembler";
import RoadmapEditor from "../components/editor/RoadmapEditor";
import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";
import ForgotPassword from "../components/auth/ForgotPassword";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import ProfilePage from "../components/pages/ProfilePage";
import SettingsPage from "../components/pages/SettingsPage";
import RoadmapPersistence from "../utils/RoadmapPersistence";
import FirestorePersistence from "../utils/FirestorePersistence";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Helper function to wait for auth state in router loader
const waitForAuthInLoader = () => {
  return new Promise((resolve) => {
    // Check if we already have a definitive auth state
    // Note: auth.currentUser can be null (not authenticated) or User object (authenticated)
    // We need to distinguish between "not determined yet" vs "determined as null"

    console.log("🔐 Router: Checking auth state...", {
      currentUser: auth.currentUser,
      hasCurrentUser: !!auth.currentUser,
    });

    // Try to resolve immediately if auth state seems determined
    if (auth.currentUser) {
      console.log(
        "🔐 Router: User already authenticated, proceeding immediately"
      );
      resolve(auth.currentUser);
      return;
    }

    console.log("⏳ Router: Waiting for auth state determination...");
    let resolved = false;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (resolved) return; // Prevent multiple resolutions

      resolved = true;
      console.log("🔐 Router: Auth state determined:", {
        user: user ? `${user.displayName || user.email} (${user.uid})` : "null",
        isAuthenticated: !!user,
      });
      unsubscribe();
      resolve(user);
    });

    // Timeout to prevent infinite waiting
    const timeoutId = setTimeout(() => {
      if (resolved) return; // Already resolved

      resolved = true;
      console.log("⚠️ Router: Auth timeout, proceeding with current state");
      unsubscribe();
      resolve(auth.currentUser);
    }, 2000); // Reduced timeout for better UX

    // Clean up timeout if auth resolves first
    const originalUnsubscribe = unsubscribe;
    unsubscribe = () => {
      clearTimeout(timeoutId);
      originalUnsubscribe();
    };
  });
};

// Route loader for roadmap data
const roadmapLoader = async ({ params }) => {
  const { roadmapId } = params;

  if (!roadmapId) {
    throw new Response("Roadmap ID is required", { status: 400 });
  }

  let roadmapInfo = null;
  let allMetadata = [];

  // Wait for auth state to be determined (especially important for direct URL access)
  const currentUser = await waitForAuthInLoader();

  if (currentUser) {
    try {
      console.log(
        "🔍 Loading roadmap from Firestore:",
        roadmapId,
        "User:",
        currentUser.uid
      );
      roadmapInfo = await FirestorePersistence.loadRoadmap(
        roadmapId,
        currentUser.uid
      );

      if (roadmapInfo) {
        console.log("✅ Roadmap loaded from Firestore");
        return {
          roadmapData: roadmapInfo.data,
          roadmapId: roadmapId,
          metadata: {
            id: roadmapInfo.id,
            title: roadmapInfo.data.title,
            description: roadmapInfo.data.description,
            project_level: roadmapInfo.data.project_level,
            tags: roadmapInfo.data.tags,
          },
        };
      }
    } catch (error) {
      console.log(
        "⚠️ Firestore load failed, trying localStorage:",
        error.message
      );
    }
  } else {
    console.log("👤 No authenticated user, using localStorage only");
  }

  // Fallback to localStorage
  console.log("🔍 Loading roadmap from localStorage:", roadmapId);
  allMetadata = RoadmapPersistence.getAllRoadmapMetadata();
  roadmapInfo = RoadmapPersistence.loadRoadmap(roadmapId);

  // If roadmap not found, try to find it by title or other means
  if (!roadmapInfo) {
    // Try to find roadmap by checking if the ID exists in metadata but with different casing or format
    const matchingMetadata = allMetadata.find(
      (m) =>
        m.id === roadmapId ||
        m.id.toLowerCase() === roadmapId.toLowerCase() ||
        m.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() ===
          roadmapId.toLowerCase()
    );

    if (matchingMetadata) {
      roadmapInfo = RoadmapPersistence.loadRoadmap(matchingMetadata.id);
    }
  }

  if (!roadmapInfo) {
    const debugInfo = {
      roadmapId,
      userAuthenticated: !!currentUser,
      userId: currentUser?.uid,
      timestamp: new Date().toISOString(),
      authState: {
        currentUser: !!auth.currentUser,
        userEmail: currentUser?.email,
      },
      searchAttempts: {
        firestore: !!currentUser,
        localStorage: true,
        metadataCount: allMetadata.length,
      },
    };

    console.log(
      "❌ Roadmap not found in either Firestore or localStorage:",
      debugInfo
    );

    const errorMessage = `Roadmap not found: ${roadmapId}. ${
      currentUser
        ? "This roadmap may not exist or you may not have access to it."
        : "Please sign in to access your roadmaps."
    }`;

    // Create a Response with additional data for debugging
    const response = new Response(errorMessage, {
      status: 404,
      statusText: "Roadmap Not Found",
    });

    // Add debug info to the response for development
    response.debugInfo = debugInfo;
    response.roadmapId = roadmapId;
    response.userAuthenticated = !!currentUser;

    throw response;
  }

  // Successfully found roadmap
  const metadata = RoadmapPersistence.getAllRoadmapMetadata().find(
    (m) => m.id === roadmapId
  );

  console.log("✅ Roadmap loaded successfully:", {
    roadmapId,
    source: currentUser ? "Firestore" : "localStorage",
    hasData: !!roadmapInfo.data,
    hasMetadata: !!metadata,
    dataStructure: {
      title: roadmapInfo.data?.title,
      hasRoadmap: !!roadmapInfo.data?.roadmap,
      roadmapType: Array.isArray(roadmapInfo.data?.roadmap)
        ? "array"
        : typeof roadmapInfo.data?.roadmap,
    },
  });

  return {
    roadmapData: roadmapInfo.data,
    roadmapId: roadmapId,
    metadata: metadata,
  };
};

// Component to handle page titles
const PageTitleUpdater = ({ title }) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title
      ? `${title} - Roadmap Visualizer`
      : "Roadmap Visualizer";

    return () => {
      document.title = originalTitle;
    };
  }, [title]);

  return null;
};

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <PageTitleUpdater title="" />
        <HomePage />
      </>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/roadmap/:roadmapId",
    element: <RoadmapLoader />,
    loader: roadmapLoader,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <RoadmapVisualizer />,
      },
      {
        path: "phase/:phaseId",
        element: <RoadmapVisualizer />,
      },
    ],
  },
  {
    path: "/roadmap/:roadmapId/edit",
    element: <RoadmapEditor />,
    loader: roadmapLoader,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/assembler",
    element: (
      <ProtectedRoute>
        <PageTitleUpdater title="Roadmap Assembler" />
        <RoadmapAssembler />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/login",
    element: (
      <>
        <PageTitleUpdater title="Sign In" />
        <Login />
      </>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/signup",
    element: (
      <>
        <PageTitleUpdater title="Sign Up" />
        <Signup />
      </>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/forgot-password",
    element: (
      <>
        <PageTitleUpdater title="Reset Password" />
        <ForgotPassword />
      </>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <PageTitleUpdater title="Profile" />
        <ProfilePage />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <PageTitleUpdater title="Settings" />
        <SettingsPage />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/my-roadmaps",
    element: (
      <ProtectedRoute>
        <PageTitleUpdater title="My Roadmaps" />
        <HomePage />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/roadmaps",
    element: <Navigate to="/" replace />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
