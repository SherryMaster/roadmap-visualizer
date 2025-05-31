import { useState } from "react";
import Tooltip from "./Tooltip";
import { ErrorTooltip } from "./EnhancedTooltip";

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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[level] || colors.beginner
        }`}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Roadmaps
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {roadmaps.length} {roadmaps.length === 1 ? "roadmap" : "roadmaps"}{" "}
            in your collection
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Click any roadmap to continue learning
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map((roadmap) => (
          <div
            key={roadmap.id}
            onClick={() => onSelectRoadmap(roadmap.id)}
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 cursor-pointer hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            {/* Background Gradient on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {roadmap.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(roadmap.lastAccessed)}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-2">
                  {getProjectLevelBadge(roadmap.project_level)}
                  <ErrorTooltip
                    content="Delete this roadmap permanently (cannot be undone)"
                    position="left"
                    maxWidth="250px"
                  >
                    <button
                      onClick={(e) => handleDelete(roadmap.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-1"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </ErrorTooltip>
                </div>
              </div>

              {/* Description */}
              {roadmap.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {roadmap.description}
                </p>
              )}

              {/* Enhanced Progress Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Progress
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${getProgressColor(
                        roadmap.progressPercentage
                      )}`}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {roadmap.progressPercentage}%
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {roadmap.progressPercentage >= 80
                        ? "Almost done!"
                        : roadmap.progressPercentage >= 50
                        ? "Halfway there"
                        : roadmap.progressPercentage > 0
                        ? "Getting started"
                        : "Not started"}
                    </p>
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor(
                        roadmap.progressPercentage
                      )} relative overflow-hidden`}
                      style={{ width: `${roadmap.progressPercentage}%` }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>

                  {/* Progress milestones */}
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">0%</span>
                    <span className="text-xs text-gray-400">50%</span>
                    <span className="text-xs text-gray-400">100%</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {roadmap.totalPhases}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        phases
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <svg
                        className="w-4 h-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {roadmap.totalTasks}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        tasks
                      </p>
                    </div>
                  </div>
                </div>

                {/* Continue Learning Button */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                    <span>Continue</span>
                    <svg
                      className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
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

              {/* Enhanced Tags */}
              {roadmap.tags && roadmap.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {roadmap.tags.slice(0, 3).map((tag, index) => {
                    // Create unique key for tag
                    const uniqueKey = `roadmap-${roadmap.id}-tag-${index}-${tag}`;

                    return (
                      <span
                        key={uniqueKey}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/20 dark:group-hover:to-blue-800/20 transition-all duration-300"
                      >
                        {tag}
                      </span>
                    );
                  })}
                  {roadmap.tags.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300 border border-purple-200 dark:border-purple-600">
                      +{roadmap.tags.length - 3} more
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-gray-200 dark:border-gray-700">
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

            <div className="flex justify-end space-x-4">
              <Tooltip
                content="Cancel deletion and keep the roadmap"
                position="top"
                maxWidth="250px"
              >
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-all duration-200 hover:scale-105"
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
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
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
