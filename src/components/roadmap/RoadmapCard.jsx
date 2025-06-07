/**
 * Unified Roadmap Card Component
 * Standardized card layout for My Roadmaps, My Collection, and Community sections
 * Uses My Roadmaps styling as the reference design
 */

import { Link } from "react-router-dom";
import Tooltip from "../tooltips/Tooltip";
import { ErrorTooltip } from "../tooltips/EnhancedTooltip";
import PrivacyIndicator from "./PrivacyIndicator";
import StandaloneRoadmapUpvoteButton from "../voting/StandaloneRoadmapUpvoteButton";

const RoadmapCard = ({
  roadmap,
  section, // 'my-roadmaps', 'my-collection', 'community'
  viewMode = "grid", // 'grid' or 'list'
  onSelect,
  onDelete,
  onRemoveFromCollection,
  isDeleting = false,
  isRemoving = false,
}) => {
  // Helper functions
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getProjectLevelBadge = (level) => {
    const colors = {
      beginner:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      intermediate:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      advanced:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      expert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          colors[level] || colors.beginner
        }`}
      >
        {level}
      </span>
    );
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 20) return "bg-orange-500";
    return "bg-gray-300 dark:bg-gray-600";
  };

  // Handle click events
  const handleCardClick = (e) => {
    if (section === "my-roadmaps" && onSelect) {
      e.preventDefault();
      onSelect(roadmap.id);
    }
    // For other sections, let the Link handle navigation
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(roadmap.id, e);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveFromCollection) {
      onRemoveFromCollection(roadmap.id, roadmap.title);
    }
  };

  // Determine navigation behavior
  const CardWrapper = ({ children, className }) => {
    if (section === "my-roadmaps") {
      return (
        <div onClick={handleCardClick} className={className}>
          {children}
        </div>
      );
    } else {
      return (
        <Link to={`/roadmap/${roadmap.id}`} className="block group">
          <div className={className}>{children}</div>
        </Link>
      );
    }
  };

  // Grid view card
  if (viewMode === "grid") {
    return (
      <div className="group relative">
        <CardWrapper className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {roadmap.title}
                  </h3>

                  {/* Section-specific badges */}
                  {section === "my-roadmaps" && (
                    <PrivacyIndicator isPublic={roadmap.isPublic} size="xs" />
                  )}
                  {section === "my-collection" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Collection
                    </span>
                  )}
                </div>

                {/* Date information */}
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {section === "my-roadmaps" && formatDate(roadmap.createdAt)}
                  {section === "community" && formatDate(roadmap.updatedAt)}
                  {section === "my-collection" &&
                    `Saved ${formatDate(roadmap.savedAt)}`}
                </p>
              </div>

              <div className="flex items-center space-x-1 ml-2">
                {getProjectLevelBadge(
                  roadmap.projectLevel || roadmap.project_level
                )}

                {/* Section-specific action buttons */}
                {section === "my-roadmaps" && (
                  <ErrorTooltip
                    content="Delete this roadmap permanently (cannot be undone)"
                    position="top"
                    maxWidth="250px"
                  >
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-1 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
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
                      )}
                    </button>
                  </ErrorTooltip>
                )}
              </div>
            </div>

            {/* Description */}
            {roadmap.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {roadmap.description}
              </p>
            )}

            {/* Creator Information (Community only) */}
            {section === "community" && roadmap.creatorDisplayName && (
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

            {/* Progress Section (My Roadmaps and My Collection) */}
            {(section === "my-roadmaps" || section === "my-collection") && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {section === "my-collection" ? "Your Progress" : "Progress"}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {Math.round(roadmap.progressPercentage || 0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                      roadmap.progressPercentage || 0
                    )}`}
                    style={{ width: `${roadmap.progressPercentage || 0}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Stats and Actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                <span>{roadmap.totalPhases} phases</span>
                <span>•</span>
                <span>{roadmap.totalTasks} tasks</span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Upvote Button (Community and Collection) */}
                {(section === "community" || section === "my-collection") && (
                  <StandaloneRoadmapUpvoteButton
                    roadmapId={roadmap.id}
                    size="xs"
                    variant="minimal"
                    showCount={true}
                  />
                )}

                {/* Continue/Explore Button */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium">
                    <span>
                      {section === "my-roadmaps"
                        ? "Continue"
                        : section === "my-collection"
                        ? "Continue"
                        : "Explore"}
                    </span>
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

            {/* Tags */}
            {roadmap.tags && roadmap.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {roadmap.tags.slice(0, 2).map((tag, index) => {
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
        </CardWrapper>

        {/* Remove from Collection Button (positioned absolutely) */}
        {section === "my-collection" && (
          <Tooltip content="Remove from collection" position="top">
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="absolute top-2 right-2 p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
              aria-label={`Remove ${roadmap.title} from collection`}
            >
              {isRemoving ? (
                <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </Tooltip>
        )}
      </div>
    );
  }

  // List view card (simplified for now, can be expanded later)
  return (
    <CardWrapper className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {roadmap.title}
            </h3>
            {section === "my-roadmaps" && (
              <PrivacyIndicator isPublic={roadmap.isPublic} size="xs" />
            )}
            {getProjectLevelBadge(
              roadmap.projectLevel || roadmap.project_level
            )}
          </div>

          {roadmap.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
              {roadmap.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mt-2">
            <span>{roadmap.totalPhases} phases</span>
            <span>•</span>
            <span>{roadmap.totalTasks} tasks</span>
            <span>•</span>
            <span>
              {section === "my-roadmaps" && formatDate(roadmap.createdAt)}
              {section === "community" && formatDate(roadmap.updatedAt)}
              {section === "my-collection" && formatDate(roadmap.savedAt)}
            </span>
            {(section === "my-roadmaps" || section === "my-collection") && (
              <>
                <span>•</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {Math.round(roadmap.progressPercentage || 0)}% complete
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {(section === "community" || section === "my-collection") && (
            <StandaloneRoadmapUpvoteButton
              roadmapId={roadmap.id}
              size="xs"
              variant="minimal"
              showCount={true}
            />
          )}

          {section === "my-roadmaps" && (
            <ErrorTooltip
              content="Delete this roadmap permanently (cannot be undone)"
              position="top"
              maxWidth="250px"
            >
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200 p-1 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
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
                )}
              </button>
            </ErrorTooltip>
          )}
        </div>
      </div>
    </CardWrapper>
  );
};

export default RoadmapCard;
