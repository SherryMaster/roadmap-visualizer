import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoadmapPersistence from "../utils/RoadmapPersistence";
import DataTransformer from "../utils/DataTransformer";

const AssemblerResults = ({
  mergedRoadmap,
  mergeStats,
  validationResults,
  onReset,
  onDownload,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const dataStr = JSON.stringify(mergedRoadmap, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${mergedRoadmap.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_roadmap.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveAndView = async () => {
    setIsSaving(true);
    try {
      console.log("Saving roadmap:", mergedRoadmap); // Debug log

      // Transform the merged roadmap to UI format (same as normal upload workflow)
      const transformedData = DataTransformer.transformToUI(mergedRoadmap);

      if (!transformedData) {
        throw new Error("Failed to transform roadmap data to UI format");
      }

      console.log("Transformed roadmap data:", transformedData); // Debug log

      // Save to localStorage using RoadmapPersistence
      // Pass original merged roadmap as originalData, transformed as main data
      const roadmapId = RoadmapPersistence.saveRoadmap(
        transformedData,
        mergedRoadmap
      );

      console.log("Generated roadmap ID:", roadmapId); // Debug log

      // Navigate to the roadmap visualizer
      navigate(`/roadmap/${roadmapId}`);
    } catch (error) {
      console.error("Error saving roadmap:", error);
      // Show error to user
      alert("Failed to save roadmap. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getValidationStatusIcon = (isValid) => {
    if (isValid) {
      return (
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.062 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="text-green-600 dark:text-green-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
          Roadmap Successfully Assembled!
        </h2>
        <p className="text-green-700 dark:text-green-300">
          Your roadmap has been merged and validated. You can now download it or
          view it in the visualizer.
        </p>
      </div>

      {/* Roadmap Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Roadmap Preview
        </h3>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Title:
            </span>
            <span className="ml-2 text-gray-900 dark:text-gray-100">
              {mergedRoadmap.title}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Description:
            </span>
            <span className="ml-2 text-gray-900 dark:text-gray-100">
              {mergedRoadmap.description || "No description"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Project Level:
            </span>
            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-sm">
              {mergedRoadmap.project_level}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Tags:
            </span>
            <div className="ml-2 inline-flex flex-wrap gap-1">
              {mergedRoadmap.tags.map((tag, index) => {
                // Create unique key for tag
                const uniqueKey = `assembler-tag-${index}-${tag}`;

                return (
                  <span
                    key={uniqueKey}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Merge Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Merge Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {mergeStats.totalPhases}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Phases
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {mergeStats.totalTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tasks
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {mergeStats.taskFiles}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Task Files
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {mergeStats.mergedTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Merged Tasks
            </div>
          </div>
        </div>
      </div>

      {/* Validation Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Validation Results
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            {getValidationStatusIcon(validationResults.skeleton?.isValid)}
            <span className="font-medium">Skeleton File:</span>
            <span
              className={
                validationResults.skeleton?.isValid
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {validationResults.skeleton?.isValid ? "Valid" : "Invalid"}
            </span>
          </div>

          {validationResults.tasks?.map((taskResult, index) => (
            <div key={index} className="flex items-center space-x-2">
              {getValidationStatusIcon(taskResult.isValid)}
              <span className="font-medium">Task File {index + 1}:</span>
              <span
                className={
                  taskResult.isValid
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {taskResult.isValid ? "Valid" : "Invalid"}
              </span>
            </div>
          ))}

          <div className="flex items-center space-x-2">
            {getValidationStatusIcon(validationResults.overall?.isValid)}
            <span className="font-medium">Overall:</span>
            <span
              className={
                validationResults.overall?.isValid
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {validationResults.overall?.isValid
                ? "All validations passed"
                : "Some validations failed"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Download Roadmap</span>
            </>
          )}
        </button>

        <button
          onClick={handleSaveAndView}
          disabled={isSaving}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>Save & View</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Start Over</span>
        </button>
      </div>
    </div>
  );
};

export default AssemblerResults;
