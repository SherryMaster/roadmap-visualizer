/**
 * Public Roadmaps List Component
 * Displays community roadmaps that are marked as public
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useFirestore } from "../../context/FirestoreContext";
import Tooltip from "../tooltips/Tooltip";
import StandaloneRoadmapUpvoteButton from "../voting/StandaloneRoadmapUpvoteButton";

const PublicRoadmapsList = () => {
  const { publicRoadmaps, loading, error } = useFirestore();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  if (loading && publicRoadmaps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 mb-2">
            <svg
              className="h-8 w-8 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (publicRoadmaps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Public Roadmaps Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Be the first to share a roadmap with the community!
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Community Roadmaps
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Discover roadmaps shared by the community
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicRoadmaps.map((roadmap) => (
              <Link
                key={roadmap.id}
                to={`/roadmap/${roadmap.id}`}
                className="block group"
              >
                <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {roadmap.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(roadmap.updatedAt)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        {getProjectLevelBadge(roadmap.projectLevel)}
                      </div>
                    </div>

                    {/* Description */}
                    {roadmap.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {roadmap.description}
                      </p>
                    )}

                    {/* Creator Information */}
                    {roadmap.creatorDisplayName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                        <svg
                          className="w-3 h-3 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Created by {roadmap.creatorDisplayName}
                      </p>
                    )}

                    {/* Compact Stats and Actions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>{roadmap.totalPhases} phases</span>
                        <span>•</span>
                        <span>{roadmap.totalTasks} tasks</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Upvote Button */}
                        <StandaloneRoadmapUpvoteButton
                          roadmapId={roadmap.id}
                          size="xs"
                          variant="minimal"
                          showCount={true}
                        />

                        {/* Explore Button */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium">
                            <span>Explore</span>
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {publicRoadmaps.map((roadmap) => (
              <Link
                key={roadmap.id}
                to={`/roadmap/${roadmap.id}`}
                className="block group"
              >
                <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {roadmap.title}
                        </h3>
                        {getProjectLevelBadge(roadmap.projectLevel)}
                      </div>

                      {roadmap.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {roadmap.description}
                        </p>
                      )}

                      {/* Creator Information */}
                      {roadmap.creatorDisplayName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                          <svg
                            className="w-3 h-3 mr-1 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Created by {roadmap.creatorDisplayName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-6 text-xs text-gray-600 dark:text-gray-400">
                      <span>{roadmap.totalPhases} phases</span>
                      <span>•</span>
                      <span>{roadmap.totalTasks} tasks</span>
                      <span>•</span>
                      <span>{formatDate(roadmap.updatedAt)}</span>
                      <span>•</span>
                      <StandaloneRoadmapUpvoteButton
                        roadmapId={roadmap.id}
                        size="xs"
                        variant="minimal"
                        showCount={true}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRoadmapsList;
