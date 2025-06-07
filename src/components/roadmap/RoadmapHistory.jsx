import { useState } from "react";
import Tooltip from "../tooltips/Tooltip";
import { ErrorTooltip } from "../tooltips/EnhancedTooltip";
import RoadmapCard from "./RoadmapCard";

const RoadmapHistory = ({
  roadmaps,
  onSelectRoadmap,
  onDeleteRoadmap,
  onUpload,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const handleDelete = (roadmapId, event) => {
    event.stopPropagation();
    setShowDeleteConfirm(roadmapId);
  };

  const confirmDelete = (roadmapId) => {
    onDeleteRoadmap(roadmapId);
    setShowDeleteConfirm(null);
  };

  if (roadmaps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Roadmaps Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Upload a JSON roadmap file or use the Assembler to create your first
            roadmap.
          </p>
          {onUpload && (
            <button
              onClick={onUpload}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Roadmap
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              My Roadmaps
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {roadmaps.length} {roadmaps.length === 1 ? "roadmap" : "roadmaps"}{" "}
              • Click to continue learning
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip content="Grid view">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
            </Tooltip>

            <Tooltip content="List view">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "grid" ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {roadmaps.map((roadmap) => (
              <RoadmapCard
                key={roadmap.id}
                roadmap={roadmap}
                section="my-roadmaps"
                viewMode="grid"
                onSelect={onSelectRoadmap}
                onDelete={handleDelete}
                isDeleting={showDeleteConfirm === roadmap.id}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {roadmaps.map((roadmap) => (
              <RoadmapCard
                key={roadmap.id}
                roadmap={roadmap}
                section="my-roadmaps"
                viewMode="list"
                onSelect={onSelectRoadmap}
                onDelete={handleDelete}
                isDeleting={showDeleteConfirm === roadmap.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-8 animate-scale-in border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
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
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Delete Roadmap
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Are you sure you want to permanently delete this roadmap? All
              progress data, task completions, and learning history will be lost
              forever.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Tooltip
                content="Cancel deletion and keep the roadmap"
                position="top"
                maxWidth="250px"
              >
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-all duration-200 hover:scale-105 min-h-[44px] w-full sm:w-auto"
                >
                  Cancel
                </button>
              </Tooltip>
              <ErrorTooltip
                content="Permanently delete this roadmap and all progress data"
                position="top"
                maxWidth="300px"
              >
                <button
                  onClick={() => confirmDelete(showDeleteConfirm)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl min-h-[44px] w-full sm:w-auto"
                >
                  Delete Forever
                </button>
              </ErrorTooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapHistory;
