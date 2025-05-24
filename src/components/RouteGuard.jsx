import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoadmapPersistence from "../utils/RoadmapPersistence";

/**
 * Route guard component that validates roadmap access and redirects if necessary
 */
const RouteGuard = ({ children }) => {
  const navigate = useNavigate();
  const { roadmapId } = useParams();

  useEffect(() => {
    if (roadmapId) {
      // Check if the roadmap exists
      const roadmapInfo = RoadmapPersistence.loadRoadmap(roadmapId);
      
      if (!roadmapInfo) {
        // Roadmap doesn't exist, redirect to home with error state
        console.warn(`Roadmap with ID ${roadmapId} not found, redirecting to home`);
        navigate("/", { 
          replace: true,
          state: { 
            error: "Roadmap not found",
            message: "The roadmap you're looking for doesn't exist or may have been deleted."
          }
        });
        return;
      }

      // Update last accessed time
      RoadmapPersistence.updateLastAccessed(roadmapId);
    }
  }, [roadmapId, navigate]);

  return children;
};

export default RouteGuard;
