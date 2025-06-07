/**
 * Vote Persistence Utility
 * Manages localStorage operations for roadmap voting data
 */

class RoadmapVotePersistence {
  static STORAGE_KEYS = {
    ROADMAP_VOTES: "roadmap-visualizer-roadmap-votes",
    USER_VOTES: "roadmap-visualizer-user-votes",
  };

  /**
   * Get all votes from localStorage
   */
  static getAllVotes() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.ROADMAP_VOTES);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error loading votes:", error);
      return {};
    }
  }

  /**
   * Get vote data for a specific roadmap
   */
  static getRoadmapVotes(roadmapId) {
    try {
      const allVotes = this.getAllVotes();
      return allVotes[roadmapId] || null;
    } catch (error) {
      console.error("Error getting roadmap votes:", error);
      return null;
    }
  }

  /**
   * Get vote count for a specific roadmap
   */
  static getRoadmapVoteCount(roadmapId) {
    try {
      const roadmapVotes = this.getRoadmapVotes(roadmapId);

      if (!roadmapVotes) return 0;

      // Count unique user votes
      return Object.keys(roadmapVotes.votes || {}).length;
    } catch (error) {
      console.error("Error getting roadmap vote count:", error);
      return 0;
    }
  }

  /**
   * Check if a user has voted for a specific roadmap
   */
  static hasUserVoted(roadmapId, userId) {
    try {
      const roadmapVotes = this.getRoadmapVotes(roadmapId);

      if (!roadmapVotes || !roadmapVotes.votes) return false;

      return !!roadmapVotes.votes[userId];
    } catch (error) {
      console.error("Error checking user vote:", error);
      return false;
    }
  }

  /**
   * Add or remove a user's vote for a roadmap
   */
  static toggleUserVote(roadmapId, userId) {
    try {
      const allVotes = this.getAllVotes();

      if (!allVotes[roadmapId]) {
        allVotes[roadmapId] = {
          votes: {},
          totalVotes: 0,
          lastUpdated: new Date().toISOString(),
        };
      }

      const roadmapVotes = allVotes[roadmapId];
      const hasVoted = !!roadmapVotes.votes[userId];

      if (hasVoted) {
        // Remove vote
        delete roadmapVotes.votes[userId];
      } else {
        // Add vote
        roadmapVotes.votes[userId] = new Date().toISOString();
      }

      // Update total count
      roadmapVotes.totalVotes = Object.keys(roadmapVotes.votes).length;
      roadmapVotes.lastUpdated = new Date().toISOString();

      // Save back to localStorage
      localStorage.setItem(
        this.STORAGE_KEYS.ROADMAP_VOTES,
        JSON.stringify(allVotes)
      );

      return !hasVoted; // Return new vote state
    } catch (error) {
      console.error("Error toggling user vote:", error);
      return false;
    }
  }

  /**
   * Get user's vote history
   */
  static getUserVoteHistory(userId) {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_VOTES);
      const userVotes = stored ? JSON.parse(stored) : {};
      return userVotes[userId] || {};
    } catch (error) {
      console.error("Error getting user vote history:", error);
      return {};
    }
  }

  /**
   * Update user's vote history
   */
  static updateUserVoteHistory(userId, roadmapId, voted) {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_VOTES);
      const userVotes = stored ? JSON.parse(stored) : {};

      if (!userVotes[userId]) {
        userVotes[userId] = {};
      }

      if (voted) {
        userVotes[userId][roadmapId] = new Date().toISOString();
      } else {
        delete userVotes[userId][roadmapId];
      }

      localStorage.setItem(
        this.STORAGE_KEYS.USER_VOTES,
        JSON.stringify(userVotes)
      );
    } catch (error) {
      console.error("Error updating user vote history:", error);
    }
  }

  /**
   * Clear all vote data (for testing/reset purposes)
   */
  static clearAllVotes() {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.ROADMAP_VOTES);
      localStorage.removeItem(this.STORAGE_KEYS.USER_VOTES);
    } catch (error) {
      console.error("Error clearing votes:", error);
    }
  }

  /**
   * Merge vote data from multiple sources (localStorage + Firestore)
   */
  static mergeVoteData(localVotes, firestoreVotes) {
    try {
      if (!localVotes && !firestoreVotes) return null;
      if (!localVotes) return firestoreVotes;
      if (!firestoreVotes) return localVotes;

      // Merge votes from both sources
      const mergedVotes = { ...localVotes.votes, ...firestoreVotes.votes };

      return {
        votes: mergedVotes,
        totalVotes: Object.keys(mergedVotes).length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error merging vote data:", error);
      return localVotes || firestoreVotes || null;
    }
  }

  /**
   * Update roadmap votes with merged data
   */
  static updateRoadmapVotes(roadmapId, mergedVotes) {
    try {
      const allVotes = this.getAllVotes();
      allVotes[roadmapId] = mergedVotes;
      localStorage.setItem(
        this.STORAGE_KEYS.ROADMAP_VOTES,
        JSON.stringify(allVotes)
      );
      return true;
    } catch (error) {
      console.error("Error updating roadmap votes:", error);
      return false;
    }
  }

  /**
   * Sort roadmaps by vote count
   */
  static sortRoadmapsByVotes(roadmaps, ascending = false) {
    try {
      return [...roadmaps].sort((a, b) => {
        const votesA = this.getRoadmapVoteCount(a.id);
        const votesB = this.getRoadmapVoteCount(b.id);

        return ascending ? votesA - votesB : votesB - votesA;
      });
    } catch (error) {
      console.error("Error sorting roadmaps by votes:", error);
      return roadmaps;
    }
  }
}

export default RoadmapVotePersistence;
