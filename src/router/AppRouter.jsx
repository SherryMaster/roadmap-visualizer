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
import OwnerProtectedRoute from "../components/auth/OwnerProtectedRoute";
import ProfilePage from "../components/pages/ProfilePage";
import SettingsPage from "../components/pages/SettingsPage";
import AccessControlDemo from "../components/test/AccessControlDemo";
import TaskDetailTest from "../components/test/TaskDetailTest";
import CollectionDependencyTest from "../components/test/CollectionDependencyTest";
import RoadmapVotingDemo from "../components/voting/RoadmapVotingDemo";
import ErrorTest from "../components/test/ErrorTest";
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

    // Try to resolve immediately if auth state seems determined
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    let resolved = false;
    let unsubscribe = null;
    let timeoutId = null;

    const resolveOnce = (user, reason) => {
      if (resolved) return;

      resolved = true;

      // Clean up
      if (unsubscribe) {
        unsubscribe();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      resolve(user);
    };

    unsubscribe = onAuthStateChanged(auth, (user) => {
      resolveOnce(user, "auth state change");
    });

    // Timeout to prevent infinite waiting
    timeoutId = setTimeout(() => {
      resolveOnce(auth.currentUser, "timeout");
    }, 1000); // Reduced timeout for better UX
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

  // Always try Firestore first (for both authenticated and unauthenticated users)
  // This allows access to public roadmaps even without authentication

  try {
    roadmapInfo = await FirestorePersistence.loadRoadmap(
      roadmapId,
      currentUser?.uid || null
    );

    if (roadmapInfo) {
      // Check if this roadmap is in the user's collection (if authenticated)
      let isCollection = false;
      if (currentUser) {
        try {
          isCollection = await FirestorePersistence.isRoadmapInCollection(
            currentUser.uid,
            roadmapId
          );
        } catch (error) {
          console.warn("Could not check collection status:", error);
        }
      }

      return {
        roadmapData: roadmapInfo.data,
        roadmapId: roadmapId,
        metadata: {
          id: roadmapInfo.id,
          title: roadmapInfo.data.title,
          description: roadmapInfo.data.description,
          project_level: roadmapInfo.data.project_level,
          tags: roadmapInfo.data.tags,
          isPublic: roadmapInfo.isPublic, // Use from roadmapInfo root, not data
          allowDownload: roadmapInfo.allowDownload, // Use from roadmapInfo root, not data
          userId: roadmapInfo.userId, // Use userId from the roadmap object, not data
          creatorDisplayName: roadmapInfo.creatorDisplayName, // Include creator information
          creatorEmail: roadmapInfo.creatorEmail, // Include creator email
          isCollection: isCollection, // Flag to indicate if this is a collection roadmap
        },
      };
    }
  } catch (error) {
    // If it's an access denied error and user is not authenticated,
    // suggest authentication
    if (error.message.includes("Access denied") && !currentUser) {
      const response = new Response(
        `This roadmap is private. Please sign in to access it.`,
        { status: 403, statusText: "Access Denied" }
      );
      response.debugInfo = {
        roadmapId,
        error: error.message,
        userAuthenticated: false,
        suggestion: "Sign in to access private roadmaps",
      };
      throw response;
    }

    // For other errors, continue to localStorage fallback
  }

  // No localStorage fallback - Firestore only
  const errorMessage = `Roadmap not found: ${roadmapId}. ${
    currentUser
      ? "This roadmap may not exist, may be private, or you may not have access to it."
      : "This roadmap may not exist, or it may be private. Please sign in if you have access to this roadmap."
  }`;

  const response = new Response(errorMessage, {
    status: 404,
    statusText: "Roadmap Not Found",
  });
  response.debugInfo = {
    roadmapId,
    userAuthenticated: !!currentUser,
    userId: currentUser?.uid,
    source: "Firestore only",
  };
  throw response;
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
    element: (
      <OwnerProtectedRoute>
        <PageTitleUpdater title="Edit Roadmap" />
        <RoadmapEditor />
      </OwnerProtectedRoute>
    ),
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
    path: "/demo/access-control",
    element: (
      <>
        <PageTitleUpdater title="Access Control Demo" />
        <AccessControlDemo />
      </>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/demo/task-detail-test",
    element: (
      <>
        <PageTitleUpdater title="Task Detail Test" />
        <TaskDetailTest />
      </>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/demo/voting",
    element: (
      <>
        <PageTitleUpdater title="Roadmap Voting Demo" />
        <RoadmapVotingDemo />
      </>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/test/error",
    element: (
      <>
        <PageTitleUpdater title="Error Boundary Test" />
        <ErrorTest />
      </>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/test/collection-dependency",
    element: (
      <>
        <PageTitleUpdater title="Collection Dependency Test" />
        <CollectionDependencyTest />
      </>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

const AppRouter = () => {
  return (
    <RouterProvider
      router={router}
      fallbackElement={
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
      hydrateFallback={
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
          </div>
        </div>
      }
    />
  );
};

export default AppRouter;
