import { useState } from "react";
import Tooltip from "../tooltips/Tooltip";

const RoadmapHeader = ({ title, description, projectLevel, tags }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [areTagsExpanded, setAreTagsExpanded] = useState(false);

  // Truncate description for preview (approximately 200 characters for better readability)
  const truncateLength = 200;
  const shouldTruncate = description && description.length > truncateLength;
  const truncatedDescription = shouldTruncate
    ? description.substring(0, truncateLength).trim() + "..."
    : description;

  // Tag display configuration
  const maxVisibleTags = 5;
  const hasMoreTags = tags && tags.length > maxVisibleTags;
  const visibleTags = areTagsExpanded ? tags : tags?.slice(0, maxVisibleTags);
  const hiddenTagsCount = hasMoreTags ? tags.length - maxVisibleTags : 0;

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const toggleTags = () => {
    setAreTagsExpanded(!areTagsExpanded);
  };

  // Project level styling configuration
  const getLevelStyling = (level) => {
    const styles = {
      beginner:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      intermediate:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      advanced:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
      expert:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
    };
    return styles[level] || styles.intermediate;
  };

  return (
    <div className="mb-8">
      {/* Professional Header Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Main Header Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          {/* Title Row with Level Badge */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h1>
                {projectLevel && (
                  <Tooltip
                    content={`This roadmap is designed for ${projectLevel} level learners`}
                    position="bottom"
                    maxWidth="250px"
                  >
                    <span
                      className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getLevelStyling(
                        projectLevel
                      )}`}
                    >
                      {projectLevel.charAt(0).toUpperCase() +
                        projectLevel.slice(1)}
                    </span>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Expand/Collapse Button */}
            {shouldTruncate && (
              <Tooltip
                content={
                  isDescriptionExpanded
                    ? "Collapse description to show summary"
                    : "Expand to read full description"
                }
                position="left"
                maxWidth="200px"
              >
                <button
                  onClick={toggleDescription}
                  className="flex-shrink-0 inline-flex items-center px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-150 border border-blue-200 dark:border-blue-800 min-h-[44px] sm:min-h-auto"
                  aria-label={
                    isDescriptionExpanded
                      ? "Collapse description"
                      : "Expand description"
                  }
                >
                  <svg
                    className={`w-4 h-4 mr-1.5 transition-transform duration-150 ${
                      isDescriptionExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {isDescriptionExpanded ? "Less" : "More"}
                </button>
              </Tooltip>
            )}
          </div>

          {/* Description */}
          {description && (
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                {isDescriptionExpanded ? description : truncatedDescription}
              </p>
            </div>
          )}

          {/* Tags Section */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">
                Tags:
              </span>
              {visibleTags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150"
                >
                  {tag}
                </span>
              ))}

              {/* Tags overflow handling */}
              {!areTagsExpanded && hasMoreTags && (
                <button
                  onClick={toggleTags}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-150 border border-blue-200 dark:border-blue-800"
                >
                  +{hiddenTagsCount} more
                </button>
              )}

              {areTagsExpanded && hasMoreTags && (
                <button
                  onClick={toggleTags}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-150"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapHeader;
