import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFirestore } from "../../context/FirestoreContext";
import Tooltip from "../tooltips/Tooltip";

const PrivacyToggle = ({ roadmapId, isPublic, userId, onPrivacyChange }) => {
  const { currentUser } = useAuth();
  const { updateRoadmapPrivacy } = useFirestore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Only show to authenticated users who own the roadmap
  const canTogglePrivacy = currentUser && currentUser.uid === userId;

  if (!canTogglePrivacy) {
    return null;
  }

  const handleTogglePrivacy = async (newIsPublic) => {
    // Show confirmation dialog when making private roadmaps public
    if (!isPublic && newIsPublic) {
      setShowConfirmDialog(true);
      return;
    }

    await performPrivacyUpdate(newIsPublic);
  };

  const performPrivacyUpdate = async (newIsPublic) => {
    setIsUpdating(true);
    setShowConfirmDialog(false);

    try {
      await updateRoadmapPrivacy(roadmapId, newIsPublic);

      // Notify parent component of the change
      if (onPrivacyChange) {
        onPrivacyChange(newIsPublic);
      }

      // Show success notification
      console.log(`✅ Privacy updated: ${newIsPublic ? "Public" : "Private"}`);
    } catch (error) {
      console.error("❌ Failed to update privacy:", error);
      // Could add user-facing error notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmMakePublic = () => {
    performPrivacyUpdate(true);
  };

  const cancelMakePublic = () => {
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Privacy
            </span>
          </div>

          {/* Status indicator */}
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isPublic ? "bg-green-500" : "bg-gray-500"
              }`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isPublic ? "Public" : "Private"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Private Button */}
          <Tooltip
            content="Only you can view this roadmap. It won't appear in public listings."
            position="bottom"
            maxWidth="250px"
          >
            <button
              onClick={() => handleTogglePrivacy(false)}
              disabled={isUpdating}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 min-w-[80px] ${
                !isPublic
                  ? "bg-gray-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isUpdating && !isPublic ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Private"
              )}
            </button>
          </Tooltip>

          {/* Public Button */}
          <Tooltip
            content="Anyone can view this roadmap. It will appear in public listings and search results."
            position="bottom"
            maxWidth="250px"
          >
            <button
              onClick={() => handleTogglePrivacy(true)}
              disabled={isUpdating}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 min-w-[80px] ${
                isPublic
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isUpdating && isPublic ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Public"
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
                className="w-6 h-6 text-yellow-500"
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
                Make Roadmap Public?
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will make your roadmap visible to everyone and include it in
              public listings. Anyone will be able to view and download it.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={confirmMakePublic}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Make Public
              </button>
              <button
                onClick={cancelMakePublic}
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

export default PrivacyToggle;
