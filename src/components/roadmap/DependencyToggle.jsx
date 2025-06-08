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
  const { updateRoadmapDependencyMode, updateCollectionRoadmapDependencyMode } =
    useFirestore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Show to authenticated users who own the roadmap OR for collection roadmaps (user's own copy)
  const canToggleDependencies =
    currentUser &&
    (currentUser.uid === userId || // Original roadmap owner
      isCollectionRoadmap); // Collection roadmap (user's own copy)

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
      if (isCollectionRoadmap) {
        // Update user-specific collection setting
        await updateCollectionRoadmapDependencyMode(
          roadmapId,
          newEnableDependencies
        );
      } else {
        // Update original roadmap setting
        await updateRoadmapDependencyMode(roadmapId, newEnableDependencies);
      }

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
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Task Dependencies:
        </span>

        <div className="flex items-center space-x-2">
          {/* Enabled Button */}
          <Tooltip
            content="Tasks must be completed in dependency order. Users cannot mark dependent tasks as complete until prerequisites are finished."
            position="bottom"
            maxWidth="300px"
          >
            <button
              onClick={() => handleToggleDependencies(true)}
              disabled={isUpdating}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                enableDependencies
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Enabled</span>
            </button>
          </Tooltip>

          {/* Disabled Button */}
          <Tooltip
            content="Users can complete tasks in any order they want, regardless of dependencies. Dependencies will still be shown for guidance."
            position="bottom"
            maxWidth="300px"
          >
            <button
              onClick={() => handleToggleDependencies(false)}
              disabled={isUpdating}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                !enableDependencies
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Disabled</span>
            </button>
          </Tooltip>
        </div>

        {/* Loading indicator */}
        {isUpdating && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        )}
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
              This will allow you to complete tasks in any order, regardless of
              dependencies. Dependencies will still be shown for guidance, but
              won't be enforced.{" "}
              {isCollectionRoadmap
                ? "This change only affects your personal copy of this roadmap."
                : "This change will apply to all users viewing this roadmap."}
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
