import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import RoadmapVotePersistence from "../utils/RoadmapVotePersistence";
import FirestorePersistence from "../utils/FirestorePersistence";
import { useAuth } from "./AuthContext";

// Create context
const RoadmapVoteContext = createContext();

// Hook to use the vote context
export const useRoadmapVote = () => {
  const context = useContext(RoadmapVoteContext);
  if (!context) {
    throw new Error("useRoadmapVote must be used within a RoadmapVoteProvider");
  }
  return context;
};

// Provider component
export const RoadmapVoteProvider = ({ children, roadmapId }) => {
  const { currentUser } = useAuth();
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVoting, setIsVoting] = useState(false); // Flag to prevent refresh during voting

  // Generate a unique user ID for anonymous users
  // Only authenticated users can vote
  const getUserId = useCallback(() => {
    return currentUser?.uid || null;
  }, [currentUser]);

  // Load votes from storage on initial render
  useEffect(() => {
    if (!roadmapId) return;

    const loadVotes = async () => {
      try {
        // Load votes from Firestore (single source of truth)
        const firestoreVotes = await FirestorePersistence.getRoadmapVotes(
          roadmapId
        );
        console.log("🔥 Loaded votes from Firestore:", firestoreVotes);

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
        console.error("❌ Error loading votes from Firestore:", error);
        setVoteCount(0);
        setHasVoted(false);
        setIsInitialized(true);
      }
    };

    loadVotes();
  }, [roadmapId, currentUser, getUserId]);

  // Real-time updates: Periodically refresh vote counts from Firestore
  useEffect(() => {
    if (!roadmapId || !isInitialized || isVoting) return; // Skip refresh during voting

    const refreshVotes = async () => {
      if (isVoting) return; // Double-check to avoid race conditions

      try {
        // Check Firestore for latest vote data (single source of truth)
        const firestoreVotes = await FirestorePersistence.getRoadmapVotes(
          roadmapId
        );

        if (firestoreVotes) {
          const newVoteCount = firestoreVotes.totalVotes || 0;

          // Always update vote count (visible to all users)
          if (newVoteCount !== voteCount) {
            setVoteCount(newVoteCount);
          }

          // Update user's vote state if authenticated and changed
          const userId = getUserId();
          if (userId) {
            const userHasVoted = !!firestoreVotes.votes[userId];
            if (userHasVoted !== hasVoted) {
              setHasVoted(userHasVoted);
            }
          }
        }
      } catch (error) {
        console.warn("❌ Error refreshing votes:", error);
      }
    };

    // Refresh every 5 seconds for real-time updates (faster for testing)
    const interval = setInterval(refreshVotes, 5000);

    return () => clearInterval(interval);
  }, [
    roadmapId,
    isInitialized,
    currentUser,
    voteCount,
    hasVoted,
    getUserId,
    isVoting,
  ]);

  // Get vote count for the roadmap
  const getRoadmapVoteCount = useCallback(() => {
    return voteCount;
  }, [voteCount]);

  // Check if current user has voted for the roadmap
  const hasUserVotedForRoadmap = useCallback(() => {
    return hasVoted;
  }, [hasVoted]);

  // Toggle user's vote for the roadmap (authenticated users only)
  const toggleVote = useCallback(async () => {
    if (!roadmapId) return false;

    const userId = getUserId();
    if (!userId) {
      console.warn("❌ Anonymous users cannot vote");
      return false;
    }

    try {
      setIsVoting(true); // Prevent refresh during voting

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

      console.log("✅ Vote toggled successfully:", newVoteStateFromFirestore);
      return newVoteStateFromFirestore;
    } catch (error) {
      console.error("❌ Error toggling vote:", error);
      // Revert optimistic updates on error
      setHasVoted(currentlyVoted); // Revert to original state
      setVoteCount((prev) => (currentlyVoted ? prev + 1 : prev - 1)); // Revert count change
      return false;
    } finally {
      setIsVoting(false); // Re-enable refresh after voting
    }
  }, [roadmapId, hasVoted, voteCount, getUserId]);

  const value = {
    // State
    voteCount,
    hasVoted,
    isInitialized,

    // Actions
    toggleVote,
    getRoadmapVoteCount,
    hasUserVotedForRoadmap,

    // Utilities
    roadmapId,
    userId: getUserId(),
  };

  return (
    <RoadmapVoteContext.Provider value={value}>
      {children}
    </RoadmapVoteContext.Provider>
  );
};

export default RoadmapVoteContext;
