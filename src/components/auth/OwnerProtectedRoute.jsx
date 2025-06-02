import { useLoaderData, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OwnerProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const { metadata } = useLoaderData();

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user owns the roadmap
  if (!metadata || currentUser.uid !== metadata.userId) {
    // Redirect to the roadmap view page instead of edit
    const roadmapId = metadata?.id || window.location.pathname.split("/")[2];
    return <Navigate to={`/roadmap/${roadmapId}`} replace />;
  }
  return children;
};

export default OwnerProtectedRoute;
