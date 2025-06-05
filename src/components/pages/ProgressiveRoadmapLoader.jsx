import { useEffect } from "react";
import { useLoaderData, useParams, useNavigate } from "react-router-dom";
import ProgressiveRoadmapVisualizer from "./ProgressiveRoadmapVisualizer";

const ProgressiveRoadmapLoader = () => {
  const loaderData = useLoaderData();
  const { roadmapMetadata, roadmapId } = loaderData;
  const { phaseId } = useParams();
  const navigate = useNavigate();

  // Update page title based on roadmap metadata
  useEffect(() => {
    if (roadmapMetadata?.data?.title) {
      document.title = `${roadmapMetadata.data.title} - Roadmap Visualizer`;
    }

    return () => {
      document.title = "Roadmap Visualizer";
    };
  }, [roadmapMetadata]);

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

  return (
    <ProgressiveRoadmapVisualizer
      roadmapMetadata={roadmapMetadata}
      roadmapId={roadmapId}
      onReturnHome={handleReturnHome}
      onPhaseNavigation={handlePhaseNavigation}
    />
  );
};

export default ProgressiveRoadmapLoader;
