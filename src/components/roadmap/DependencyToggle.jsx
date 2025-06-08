import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFirestore } from "../../context/FirestoreContext";
import Tooltip from "../tooltips/Tooltip";

const DependencyToggle = ({
  roadmapId,
  enableDependencies,
  userId,
  onDependencyModeChange,
  isCollectionRoadmap = false,
}) => {
  const { currentUser } = useAuth();
  const { updateUserDependencyMode } = useFirestore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Show to authenticated users who can track progress (personal setting for all)
  const canToggleDependencies = currentUser && currentUser.uid === userId;

  if (!canToggleDependencies) {
    return null;
  }

  const handleToggleDependencies = async (newEnableDependencies) => {
    // Show confirmation dialog when disabling dependencies
    if (enableDependencies && !newEnableDependencies) {
      setShowConfirmDialog(true);
      return;
    }

    await performDependencyUpdate(newEnableDependencies);
  };

  const performDependencyUpdate = async (newEnableDependencies) => {
    setIsUpdating(true);
    setShowConfirmDialog(false);

    try {
      // Use unified approach for all roadmaps - save to user preferences
      await updateUserDependencyMode(roadmapId, newEnableDependencies);

      // Notify parent component of the change
      if (onDependencyModeChange) {
        onDependencyModeChange(newEnableDependencies);
      }
    } catch (error) {
      console.error("❌ Failed to update dependency mode:", error);
      // Could add user-facing error notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDisableDependencies = () => {
    performDependencyUpdate(false);
  };

  const cancelDisableDependencies = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Task Dependencies
            </span>
          </div>

          {/* Status indicator */}
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                enableDependencies ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {enableDependencies ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Disabled Button */}
          <Tooltip
            content="Complete tasks in any order you want. All dependency-related UI elements will be hidden for a cleaner interface."
            position="bottom"
            maxWidth="300px"
          >
            <button
              onClick={() => handleToggleDependencies(false)}
              disabled={isUpdating}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 min-w-[80px] ${
                !enableDependencies
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isUpdating && !enableDependencies ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Disabled"
              )}
            </button>
          </Tooltip>

          {/* Enabled Button */}
          <Tooltip
            content="Follow the recommended task order. You cannot mark dependent tasks as complete until prerequisites are finished."
            position="bottom"
            maxWidth="300px"
          >
            <button
              onClick={() => handleToggleDependencies(true)}
              disabled={isUpdating}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 min-w-[80px] ${
                enableDependencies
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isUpdating && enableDependencies ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Enabled"
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Disable Task Dependencies?
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will allow you to complete tasks in any order and hide all
              dependency-related UI elements for a cleaner interface. This is a
              personal setting that only affects your experience with this
              roadmap.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={confirmDisableDependencies}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Disable Dependencies
              </button>
              <button
                onClick={cancelDisableDependencies}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DependencyToggle;
