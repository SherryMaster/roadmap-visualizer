import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import RoadmapVotePersistence from "../../utils/RoadmapVotePersistence";
import FirestorePersistence from "../../utils/FirestorePersistence";
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

const StandaloneRoadmapUpvoteButton = ({
  roadmapId,
  size = "sm",
  showCount = true,
  className = "",
  disabled = false,
  variant = "minimal", // "default", "minimal", "compact"
  iconType = "heart", // "heart", "thumbs"
}) => {
  const { currentUser } = useAuth();
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateVote, setAnimateVote] = useState(false);

  // Generate a unique user ID for anonymous users
  // Only authenticated users can vote
  const getUserId = useCallback(() => {
    return currentUser?.uid || null;
  }, [currentUser]);

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

  // Load votes on mount
  useEffect(() => {
    if (!roadmapId) return;

    const loadVotes = async () => {
      try {
        // Load votes from Firestore (single source of truth)
        const firestoreVotes = await FirestorePersistence.getRoadmapVotes(
          roadmapId
        );
        console.log(
          "🔥 Standalone: Loaded votes from Firestore:",
          firestoreVotes
        );

        if (firestoreVotes) {
          // Set vote count from Firestore (visible to all users)
          setVoteCount(firestoreVotes.totalVotes || 0);

          // Check if current user has voted (only if authenticated)
          const userId = getUserId();
          if (userId) {
            setHasVoted(!!firestoreVotes.votes[userId]);
          } else {
            setHasVoted(false); // Anonymous users can't vote
          }
        } else {
          // No votes found in Firestore
          setVoteCount(0);
          setHasVoted(false);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading votes:", error);
        setVoteCount(0);
        setHasVoted(false);
        setIsInitialized(true);
      }
    };

    loadVotes();
  }, [roadmapId, currentUser, getUserId]);

  // Handle vote toggle
  const handleVoteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isLoading || !roadmapId) return;

    const userId = getUserId();
    if (!userId) {
      console.warn("❌ Anonymous users cannot vote");
      return;
    }

    setIsLoading(true);
    setAnimateVote(true);

    try {
      const currentlyVoted = hasVoted;

      // Update local state immediately for responsive UI
      const newVoteState = !currentlyVoted;
      setHasVoted(newVoteState);
      setVoteCount((prev) => (newVoteState ? prev + 1 : prev - 1));

      // Update Firestore (single source of truth)
      const newVoteStateFromFirestore =
        await FirestorePersistence.toggleRoadmapVote(roadmapId, userId);

      // Get the updated vote data from Firestore to ensure accuracy
      const updatedVotes = await FirestorePersistence.getRoadmapVotes(
        roadmapId
      );
      if (updatedVotes) {
        // Update state with accurate data from Firestore
        setVoteCount(updatedVotes.totalVotes || 0);
        setHasVoted(!!updatedVotes.votes[userId]);
      }

      console.log(
        "✅ Standalone: Vote toggled in Firestore:",
        newVoteStateFromFirestore
      );

      // Reset animation after a short delay
      setTimeout(() => setAnimateVote(false), 300);
    } catch (error) {
      console.error("Error toggling vote:", error);
      // Revert optimistic updates on error
      setHasVoted(!hasVoted);
      setVoteCount((prev) => (hasVoted ? prev + 1 : prev - 1));
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
        ? "text-red-600 dark:text-red-400"
        : "text-blue-600 dark:text-blue-400";

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
              ? `${activeColorClasses} bg-${activeColor}-50 dark:bg-${activeColor}-900/20 border border-${activeColor}-200 dark:border-${activeColor}-800`
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

  const userId = getUserId();
  const tooltipContent = !userId
    ? "Sign in to like this roadmap"
    : hasVoted
    ? "Click to remove your like"
    : "Click to like this roadmap";

  const buttonContent = (
    <>
      <HeartIcon
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

export default StandaloneRoadmapUpvoteButton;
