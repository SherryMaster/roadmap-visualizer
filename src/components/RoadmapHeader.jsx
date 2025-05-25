import { useState } from "react";

const RoadmapHeader = ({ title, description, projectLevel, tags }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [areTagsExpanded, setAreTagsExpanded] = useState(false);

  // Truncate description for preview (approximately 150 characters)
  const truncateLength = 150;
  const shouldTruncate = description && description.length > truncateLength;
  const truncatedDescription = shouldTruncate
    ? description.substring(0, truncateLength).trim() + "..."
    : description;

  // Tag display configuration
  const maxVisibleTags = 4;
  const hasMoreTags = tags && tags.length > maxVisibleTags;
  const visibleTags = areTagsExpanded ? tags : tags?.slice(0, maxVisibleTags);
  const hiddenTagsCount = hasMoreTags ? tags.length - maxVisibleTags : 0;

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const toggleTags = () => {
    setAreTagsExpanded(!areTagsExpanded);
  };

  return (
    <div className="mb-10">
      {/* Title Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          {title}
        </h1>
        <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
      </div>

      {/* Description Section */}
      {description && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200">
            {/* Header with icon and metadata */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    About This Roadmap
                  </h2>
                  {projectLevel && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          projectLevel === "beginner"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : projectLevel === "intermediate"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : projectLevel === "advanced"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {projectLevel.charAt(0).toUpperCase() +
                          projectLevel.slice(1)}{" "}
                        Level
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {shouldTruncate && (
                <button
                  onClick={toggleDescription}
                  className="flex-shrink-0 inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-1"
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
                      Show Less
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-1"
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
                      Read More
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Description Text */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p
                className={`text-gray-700 dark:text-gray-300 leading-relaxed description-expand ${
                  isDescriptionExpanded ? "expanded" : ""
                }`}
              >
                {isDescriptionExpanded ? description : truncatedDescription}
              </p>
            </div>

            {/* Optimized Tags Section */}
            {tags && tags.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Tags
                  </span>
                  {hasMoreTags && (
                    <button
                      onClick={toggleTags}
                      className="inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      {areTagsExpanded ? (
                        <>
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
                          Show Less
                        </>
                      ) : (
                        <>
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
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          +{hiddenTagsCount} more
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 tags-container">
                  {visibleTags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 tag-item"
                    >
                      {tag}
                    </span>
                  ))}

                  {/* Show "+X more" indicator when collapsed and there are hidden tags */}
                  {!areTagsExpanded && hasMoreTags && (
                    <button
                      onClick={toggleTags}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                    >
                      +{hiddenTagsCount}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapHeader;
