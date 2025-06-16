import { useState } from "react";
import Tooltip from "../tooltips/Tooltip";

const TagsList = ({
  tags,
  maxDisplay = 4,
  clickable = false,
  colorCoded = true,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tags || tags.length === 0) {
    return null;
  }

  // Define a set of colors to cycle through for tags
  const tagColors = [
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  ];

  const hasOverflow = tags.length > maxDisplay;
  const visibleTags = isExpanded ? tags : tags.slice(0, maxDisplay);
  const hiddenCount = tags.length - maxDisplay;
  const hiddenTags = tags.slice(maxDisplay);

  const getTagColor = (index) => {
    if (!colorCoded) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
    return tagColors[index % tagColors.length];
  };

  const tagSizeClasses = compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs";

  const renderTag = (tag, index) => {
    const uniqueKey = `tag-${index}-${tag}`;
    const tagElement = (
      <span
        key={uniqueKey}
        className={`inline-flex items-center ${tagSizeClasses} rounded-lg font-medium transition-all duration-200 ${
          clickable
            ? "hover:opacity-80 cursor-pointer hover:scale-105"
            : "hover:opacity-90"
        } ${getTagColor(index)} border border-opacity-20`}
        onClick={
          clickable ? () => console.log(`Tag clicked: ${tag}`) : undefined
        }
      >
        <svg
          className={`${compact ? "w-2.5 h-2.5 mr-1" : "w-3 h-3 mr-1.5"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="truncate max-w-24">{tag}</span>
      </span>
    );

    // Add tooltip for long tag names
    if (tag.length > 15) {
      return (
        <Tooltip key={uniqueKey} content={tag} position="top">
          {tagElement}
        </Tooltip>
      );
    }

    return tagElement;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {visibleTags.map((tag, index) => renderTag(tag, index))}

      {hasOverflow && !isExpanded && (
        <Tooltip
          content={
            <div className="space-y-1">
              <div className="font-medium">Hidden tags:</div>
              {hiddenTags.map((tag, index) => (
                <div key={index} className="text-sm">
                  {tag}
                </div>
              ))}
            </div>
          }
          position="top"
          maxWidth="200px"
        >
          <button
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-300 dark:border-gray-600"
          >
            +{hiddenCount} more
          </button>
        </Tooltip>
      )}

      {isExpanded && hasOverflow && (
        <button
          onClick={() => setIsExpanded(false)}
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 border border-gray-300 dark:border-gray-600"
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
          Less
        </button>
      )}
    </div>
  );
};

export default TagsList;
