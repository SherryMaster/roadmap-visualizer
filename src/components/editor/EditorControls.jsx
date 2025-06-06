import React from "react";
import Tooltip from "../tooltips/Tooltip";

const EditorControls = ({
  isModified,
  validationStatus,
  canUndo,
  canRedo,
  isSaving,
  onSave,
  onCancel,
  onReset,
  onPreview,
  onUndo,
  onRedo,
  showPreview,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Primary Actions */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3">
          <Tooltip
            content={
              !isModified
                ? "No changes to save"
                : !validationStatus.isValid
                ? "Fix validation errors before saving"
                : "Save all changes to the roadmap"
            }
            position="bottom"
            maxWidth="250px"
          >
            <button
              onClick={onSave}
              disabled={!isModified || !validationStatus.isValid || isSaving}
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px] shadow-sm hover:shadow-md"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </Tooltip>

          <Tooltip
            content={
              showPreview
                ? "Switch back to edit mode to make changes"
                : "Preview how the roadmap will look to users"
            }
            position="bottom"
            maxWidth="250px"
          >
            <button
              onClick={onPreview}
              className={`inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 min-h-[44px] shadow-sm hover:shadow-md ${
                showPreview
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
              }`}
            >
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{showPreview ? "Edit Mode" : "Preview"}</span>
            </button>
          </Tooltip>

          <Tooltip
            content="Cancel editing and return to roadmap view without saving changes"
            position="bottom"
            maxWidth="300px"
          >
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 min-h-[44px] shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Cancel</span>
            </button>
          </Tooltip>
        </div>

        {/* History Actions */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
          <Tooltip
            content={canUndo ? "Undo the last action" : "No actions to undo"}
            position="bottom"
            maxWidth="200px"
          >
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px] shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span>Undo</span>
            </button>
          </Tooltip>

          <Tooltip
            content={
              canRedo ? "Redo the last undone action" : "No actions to redo"
            }
            position="bottom"
            maxWidth="200px"
          >
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px] shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6"
                />
              </svg>
              <span>Redo</span>
            </button>
          </Tooltip>

          <Tooltip
            content={
              isModified
                ? "Reset all changes back to the last saved state"
                : "No changes to reset"
            }
            position="bottom"
            maxWidth="250px"
          >
            <button
              onClick={onReset}
              disabled={!isModified}
              className="inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px] shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 mr-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reset</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-4">
          {/* Modification Status */}
          <Tooltip
            content={
              isModified
                ? "The roadmap has unsaved changes"
                : "All changes have been saved"
            }
            position="top"
            maxWidth="200px"
          >
            <div className="flex items-center space-x-2 cursor-help">
              <div
                className={`w-2 h-2 rounded-full ${
                  isModified ? "bg-yellow-500" : "bg-green-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isModified ? "Modified" : "Saved"}
              </span>
            </div>
          </Tooltip>

          {/* Validation Status */}
          <Tooltip
            content={
              validationStatus.isValid
                ? "The roadmap structure is valid"
                : "There are validation errors that need to be fixed"
            }
            position="top"
            maxWidth="250px"
          >
            <div className="flex items-center space-x-2 cursor-help">
              <div
                className={`w-2 h-2 rounded-full ${
                  validationStatus.isValid ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {validationStatus.isValid ? "Valid" : "Invalid"}
              </span>
            </div>
          </Tooltip>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {!validationStatus.isValid && (
            <span className="text-red-600 dark:text-red-400">
              Fix validation errors before saving
            </span>
          )}
          {validationStatus.isValid && !isModified && (
            <span>No changes to save</span>
          )}
          {validationStatus.isValid && isModified && (
            <span>Ready to save changes</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorControls;
