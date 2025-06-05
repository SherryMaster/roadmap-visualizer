import { useState } from "react";
import Tooltip from "../tooltips/Tooltip";
import { ErrorTooltip } from "../tooltips/EnhancedTooltip";

const RoadmapHistory = ({ roadmaps, onSelectRoadmap, onDeleteRoadmap }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const getProjectLevelBadge = (level) => {
    // Handle undefined or null level
    if (!level) {
      level = "beginner"; // Default fallback
    }

    const colors = {
      beginner:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      intermediate:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      advanced:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      expert: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };

    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
          colors[level] || colors.beginner
        }`}
      >
        {level.charAt(0).toUpperCase()}
      </span>
    );
  };

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
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No roadmaps yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your first roadmap to get started on your learning journey.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            My Roadmaps
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {roadmaps.length} {roadmaps.length === 1 ? "roadmap" : "roadmaps"}
          </p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Click to continue learning
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {roadmaps.map((roadmap) => (
          <div
            key={roadmap.id}
            onClick={() => onSelectRoadmap(roadmap.id)}
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
          >
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {roadmap.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(roadmap.createdAt)}
                  </p>
                </div>

                <div className="flex items-center space-x-1 ml-2">
                  {getProjectLevelBadge(roadmap.project_level)}
                  <ErrorTooltip
                    content="Delete this roadmap permanently (cannot be undone)"
                    position="top"
                    maxWidth="250px"
                  >
                    <button
                      onClick={(e) => handleDelete(roadmap.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </ErrorTooltip>
                </div>
              </div>

              {/* Description */}
              {roadmap.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {roadmap.description}
                </p>
              )}

              {/* Compact Progress Section */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {roadmap.progressPercentage}%
                  </span>
                </div>

                {/* Compact Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                      roadmap.progressPercentage
                    )}`}
                    style={{ width: `${roadmap.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Compact Stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>{roadmap.totalPhases} phases</span>
                  <span>•</span>
                  <span>{roadmap.totalTasks} tasks</span>
                </div>

                {/* Continue Learning Button */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium">
                    <span>Continue</span>
                    <svg
                      className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Compact Tags */}
              {roadmap.tags && roadmap.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {roadmap.tags.slice(0, 2).map((tag, index) => {
                    // Create unique key for tag
                    const uniqueKey = `roadmap-${roadmap.id}-tag-${index}-${tag}`;

                    return (
                      <span
                        key={uniqueKey}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    );
                  })}
                  {roadmap.tags.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      +{roadmap.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
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
