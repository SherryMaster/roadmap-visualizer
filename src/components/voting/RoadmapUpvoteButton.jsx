import { useState, useEffect, useContext } from "react";
import { useRoadmapVote } from "../../context/RoadmapVoteContext";
import { RoadmapVoteContext } from "../../context/RoadmapVoteContext";
import Tooltip from "../tooltips/Tooltip";

// Heart icon component (like social media)
const HeartIcon = ({ className = "w-4 h-4", filled = false }) => (
  <svg
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={filled ? 0 : 1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
    />
  </svg>
);

// Thumbs up icon component (alternative)
const ThumbsUpIcon = ({ className = "w-4 h-4", filled = false }) => (
  <svg
    className={className}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={filled ? 0 : 1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-.971A6.001 6.001 0 016.633 10.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 7.5A2.25 2.25 0 017.5 5.25v9a2.25 2.25 0 01-2.25 2.25h-.75a2.25 2.25 0 01-2.25-2.25v-9A2.25 2.25 0 014.5 5.25h.75z"
    />
  </svg>
);

const RoadmapUpvoteButton = ({
  size = "sm",
  showCount = true,
  className = "",
  disabled = false,
  variant = "default", // "default", "minimal", "compact"
  iconType = "heart", // "heart", "thumbs"
}) => {
  // Check if we're within the provider context
  const context = useContext(RoadmapVoteContext);

  // If no context, render a placeholder
  if (!context) {
    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 ${className}`}
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>-</span>
      </div>
    );
  }

  const { voteCount, hasVoted, toggleVote, isInitialized, userId } =
    useRoadmapVote();

  const [isLoading, setIsLoading] = useState(false);
  const [animateVote, setAnimateVote] = useState(false);

  // Size configurations
  const sizeConfig = {
    xs: {
      icon: "w-3 h-3",
      text: "text-xs",
      padding: "px-1.5 py-1",
      gap: "space-x-1",
    },
    sm: {
      icon: "w-4 h-4",
      text: "text-sm",
      padding: "px-2 py-1.5",
      gap: "space-x-1.5",
    },
    md: {
      icon: "w-5 h-5",
      text: "text-base",
      padding: "px-3 py-2",
      gap: "space-x-2",
    },
    lg: {
      icon: "w-6 h-6",
      text: "text-lg",
      padding: "px-4 py-2.5",
      gap: "space-x-2.5",
    },
  };

  const config = sizeConfig[size] || sizeConfig.sm;

  // Handle vote toggle
  const handleVoteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isLoading) return;

    setIsLoading(true);
    setAnimateVote(true);

    try {
      await toggleVote();

      // Reset animation after a short delay
      setTimeout(() => setAnimateVote(false), 300);
    } catch (error) {
      console.error("Error toggling vote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Variant-specific styling
  const getVariantStyles = () => {
    const baseStyles = `
      inline-flex items-center justify-center rounded-md font-medium
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-1
      ${config.padding} ${config.gap}
    `;

    const activeColor = iconType === "heart" ? "red" : "blue";
    const activeColorClasses =
      iconType === "heart"
        ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
        : "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";

    switch (variant) {
      case "minimal":
        return `${baseStyles} 
          ${
            hasVoted
              ? activeColorClasses
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }
          hover:bg-gray-50 dark:hover:bg-gray-800
          focus:ring-${activeColor}-500 dark:focus:ring-${activeColor}-400
        `;

      case "compact":
        return `${baseStyles}
          ${
            hasVoted
              ? `${activeColorClasses} border border-${activeColor}-200 dark:border-${activeColor}-800`
              : "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
          hover:bg-gray-50 dark:hover:bg-gray-800
          focus:ring-${activeColor}-500 dark:focus:ring-${activeColor}-400
        `;

      default:
        return `${baseStyles}
          ${
            hasVoted
              ? `text-white bg-${activeColor}-600 hover:bg-${activeColor}-700 dark:bg-${activeColor}-500 dark:hover:bg-${activeColor}-600 shadow-sm`
              : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm"
          }
          focus:ring-${activeColor}-500 dark:focus:ring-${activeColor}-400
        `;
    }
  };

  const tooltipContent = !userId
    ? "Sign in to like this roadmap"
    : hasVoted
    ? "Click to remove your like"
    : "Click to like this roadmap";

  const IconComponent = iconType === "heart" ? HeartIcon : ThumbsUpIcon;

  const buttonContent = (
    <>
      <IconComponent
        className={`${config.icon} ${animateVote ? "animate-pulse" : ""}`}
        filled={hasVoted}
      />
      {showCount && (
        <span className={`${config.text} font-medium`}>{voteCount}</span>
      )}
    </>
  );

  if (!isInitialized) {
    return (
      <div
        className={`${getVariantStyles()} opacity-50 cursor-not-allowed ${className}`}
      >
        <div
          className={`${config.icon} animate-pulse bg-gray-300 dark:bg-gray-600 rounded`}
        />
        {showCount && <span className={`${config.text} font-medium`}>-</span>}
      </div>
    );
  }

  return (
    <Tooltip content={tooltipContent} position="top">
      <button
        onClick={handleVoteToggle}
        disabled={disabled || isLoading || !userId}
        className={`
          ${getVariantStyles()}
          ${
            disabled || !userId
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }
          ${isLoading ? "opacity-75" : ""}
          ${className}
        `}
        aria-label={
          !userId
            ? "Sign in to like this roadmap"
            : `${hasVoted ? "Remove like" : "Like"} (${voteCount} likes)`
        }
        aria-pressed={hasVoted}
      >
        {isLoading ? (
          <div className={`${config.icon} animate-spin`}>
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : (
          buttonContent
        )}
      </button>
    </Tooltip>
  );
};

export default RoadmapUpvoteButton;
