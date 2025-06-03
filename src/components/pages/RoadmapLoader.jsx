import {
  Outlet,
  useLoaderData,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import RoadmapVisualizer from "./RoadmapVisualizer";

const RoadmapLoader = () => {
  const loaderData = useLoaderData();
  const { roadmapData, roadmapId, metadata } = loaderData;
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  console.log("🔍 RoadmapLoader: Component loaded with data:", {
    hasLoaderData: !!loaderData,
    hasRoadmapData: !!roadmapData,
    hasMetadata: !!metadata,
    roadmapId,
    metadataTitle: metadata?.title,
    loaderDataKeys: loaderData ? Object.keys(loaderData) : null,
  });

  // Update page title based on roadmap
  useEffect(() => {
    if (metadata?.title) {
      document.title = `${metadata.title} - Roadmap Visualizer`;
    }

    return () => {
      document.title = "Roadmap Visualizer";
    };
  }, [metadata]);

  const handleReturnHome = () => {
    navigate("/");
  };

  const handlePhaseNavigation = (targetPhaseId) => {
    if (targetPhaseId) {
      navigate(`/roadmap/${roadmapId}/phase/${targetPhaseId}`);
    } else {
      navigate(`/roadmap/${roadmapId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <RoadmapVisualizer
      roadmapData={roadmapData}
      roadmapId={roadmapId}
      metadata={metadata}
      onReturnHome={handleReturnHome}
    />
  );
};

export default RoadmapLoader;
