import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFirestore } from "../../context/FirestoreContext";

const DownloadToggle = ({
  roadmapId,
  allowDownload,
  userId,
  onDownloadPermissionChange,
}) => {
  const { currentUser } = useAuth();
  const { updateRoadmapDownloadPermission } = useFirestore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Only show to authenticated users who own the roadmap
  const canToggleDownload = currentUser && currentUser.uid === userId;

  if (!canToggleDownload) {
    return null;
  }

  const handleToggleDownload = async (newAllowDownload) => {
    // Show confirmation dialog when disabling downloads for public roadmaps
    if (allowDownload && !newAllowDownload) {
      setShowConfirmDialog(true);
      return;
    }

    await performDownloadUpdate(newAllowDownload);
  };

  const performDownloadUpdate = async (newAllowDownload) => {
    setIsUpdating(true);
    setShowConfirmDialog(false);

    try {
      await updateRoadmapDownloadPermission(roadmapId, newAllowDownload);

      // Notify parent component of the change
      if (onDownloadPermissionChange) {
        onDownloadPermissionChange(newAllowDownload);
      }

      // Show success notification
      console.log(
        `✅ Download permission updated: ${
          newAllowDownload ? "Enabled" : "Disabled"
        }`
      );
    } catch (error) {
      console.error("❌ Failed to update download permission:", error);
      // Could add user-facing error notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDisableDownload = () => {
    performDownloadUpdate(false);
  };

  const cancelDisableDownload = () => {
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Collection Saving
            </span>
          </div>

          {/* Status indicator */}
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                allowDownload ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {allowDownload ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Disable Collection Saving Button */}
          <button
            onClick={() => handleToggleDownload(false)}
            disabled={isUpdating}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 min-w-[80px] ${
              !allowDownload
                ? "bg-red-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Disable collection saving"
          >
            {isUpdating && !allowDownload ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              "Disabled"
            )}
          </button>

          {/* Enable Collection Saving Button */}
          <button
            onClick={() => handleToggleDownload(true)}
            disabled={isUpdating}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 min-w-[80px] ${
              allowDownload
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Enable collection saving"
          >
            {isUpdating && allowDownload ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              "Enabled"
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-amber-600"
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
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Disable Collection Saving?
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will prevent other users from saving your roadmap to their
              collections. You can re-enable collection saving at any time.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={confirmDisableDownload}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Disable Collection Saving
              </button>
              <button
                onClick={cancelDisableDownload}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
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

export default DownloadToggle;
