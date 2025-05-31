import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import HomePage from "../components/HomePage";
import RoadmapVisualizer from "../components/RoadmapVisualizer";
import NotFoundPage from "../components/NotFoundPage";
import RoadmapLoader from "../components/RoadmapLoader";
import RoadmapAssembler from "../components/RoadmapAssembler";
import RoadmapEditor from "../components/RoadmapEditor";
import RoadmapPersistence from "../utils/RoadmapPersistence";

// Route loader for roadmap data
const roadmapLoader = async ({ params }) => {
  const { roadmapId } = params;

  if (!roadmapId) {
    throw new Response("Roadmap ID is required", { status: 400 });
  }

  const roadmapInfo = RoadmapPersistence.loadRoadmap(roadmapId);

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
      <>
        <PageTitleUpdater title="Roadmap Assembler" />
        <RoadmapAssembler />
      </>
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
