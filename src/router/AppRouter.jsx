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

// Route loader for roadmap data
const roadmapLoader = async ({ params }) => {
  const { roadmapId } = params;

  if (!roadmapId) {
    throw new Response("Roadmap ID is required", { status: 400 });
  }

  const allMetadata = RoadmapPersistence.getAllRoadmapMetadata();
  let roadmapInfo = RoadmapPersistence.loadRoadmap(roadmapId);

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
    throw new Response("Roadmap not found", { status: 404 });
  }

  return {
    roadmapData: roadmapInfo.data,
    roadmapId: roadmapId,
    metadata: RoadmapPersistence.getAllRoadmapMetadata().find(
      (m) => m.id === roadmapId
    ),
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
