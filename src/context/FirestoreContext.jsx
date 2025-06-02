/**
 * Firestore Context
 * Manages Firestore data operations and real-time subscriptions
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import FirestorePersistence from "../utils/FirestorePersistence";
import DataMigration from "../utils/DataMigration";

const FirestoreContext = createContext({});

export const useFirestore = () => {
  const context = useContext(FirestoreContext);
  if (!context) {
    throw new Error("useFirestore must be used within a FirestoreProvider");
  }
  return context;
};

export const FirestoreProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // State management
  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [publicRoadmaps, setPublicRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [migrationInProgress, setMigrationInProgress] = useState(false);

  // Clear error helper
  const clearError = useCallback(() => setError(null), []);

  // Migration disabled - localStorage no longer used
  const checkAndRunMigration = useCallback(async () => {
    if (!currentUser) return;

    // Skip migration entirely - mark as completed immediately
    setMigrationStatus({
      completed: true,
      result: {
        success: true,
        migratedCount: 0,
        message: "Migration disabled - localStorage no longer used",
      },
      timestamp: new Date().toISOString(),
    });
  }, [currentUser]);

  // Load user roadmaps
  const loadUserRoadmaps = useCallback(async () => {
    if (!currentUser) {
      setUserRoadmaps([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const roadmaps = await FirestorePersistence.getUserRoadmaps(
        currentUser.uid
      );
      setUserRoadmaps(roadmaps);
    } catch (error) {
      console.error("❌ Error loading user roadmaps:", error);
      setError("Failed to load your roadmaps: " + error.message);
      setUserRoadmaps([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load public roadmaps
  const loadPublicRoadmaps = useCallback(async () => {
    try {
      setError(null);

      const roadmaps = await FirestorePersistence.getPublicRoadmaps(20);
      setPublicRoadmaps(roadmaps);
    } catch (error) {
      console.error("❌ Error loading public roadmaps:", error);
      setError("Failed to load public roadmaps: " + error.message);
      setPublicRoadmaps([]);
    }
  }, []);

  // Save roadmap
  const saveRoadmap = useCallback(
    async (roadmapData) => {
      if (!currentUser) {
        throw new Error("User must be authenticated to save roadmaps");
      }

      try {
        setLoading(true);
        setError(null);

        const roadmapId = await FirestorePersistence.saveRoadmap(
          roadmapData,
          currentUser.uid
        );

        // Refresh user roadmaps
        await loadUserRoadmaps();

        return roadmapId;
      } catch (error) {
        console.error("❌ Error saving roadmap:", error);
        setError("Failed to save roadmap: " + error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadUserRoadmaps]
  );

  // Load specific roadmap
  const loadRoadmap = useCallback(
    async (roadmapId) => {
      try {
        setError(null);

        const roadmap = await FirestorePersistence.loadRoadmap(
          roadmapId,
          currentUser?.uid
        );

        return roadmap;
      } catch (error) {
        console.error("❌ Error loading roadmap:", error);
        setError("Failed to load roadmap: " + error.message);
        throw error;
      }
    },
    [currentUser]
  );

  // Update roadmap
  const updateRoadmap = useCallback(
    async (roadmapId, roadmapData) => {
      if (!currentUser) {
        throw new Error("User must be authenticated to update roadmaps");
      }

      try {
        setLoading(true);
        setError(null);

        await FirestorePersistence.updateRoadmap(
          roadmapId,
          roadmapData,
          currentUser.uid
        );

        // Refresh user roadmaps
        await loadUserRoadmaps();

        return true;
      } catch (error) {
        console.error("❌ Error updating roadmap:", error);
        setError("Failed to update roadmap: " + error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadUserRoadmaps]
  );

  // Delete roadmap
  const deleteRoadmap = useCallback(
    async (roadmapId) => {
      if (!currentUser) {
        throw new Error("User must be authenticated to delete roadmaps");
      }

      try {
        setLoading(true);
        setError(null);

        await FirestorePersistence.deleteRoadmap(roadmapId, currentUser.uid);

        // Refresh user roadmaps
        await loadUserRoadmaps();

        return true;
      } catch (error) {
        console.error("❌ Error deleting roadmap:", error);
        setError("Failed to delete roadmap: " + error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadUserRoadmaps]
  );

  // Update roadmap privacy
  const updateRoadmapPrivacy = useCallback(
    async (roadmapId, isPublic) => {
      if (!currentUser) {
        throw new Error("User must be authenticated");
      }

      try {
        setLoading(true);
        setError(null);

        await FirestorePersistence.updateRoadmapPrivacy(
          roadmapId,
          isPublic,
          currentUser.uid
        );

        // Refresh both user and public roadmaps
        await Promise.all([loadUserRoadmaps(), loadPublicRoadmaps()]);

        return true;
      } catch (error) {
        console.error("❌ Error updating roadmap privacy:", error);
        setError("Failed to update roadmap privacy: " + error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadUserRoadmaps, loadPublicRoadmaps]
  );

  // Update roadmap download permission
  const updateRoadmapDownloadPermission = useCallback(
    async (roadmapId, allowDownload) => {
      if (!currentUser) {
        throw new Error("User must be authenticated");
      }

      try {
        setLoading(true);
        setError(null);

        await FirestorePersistence.updateRoadmapDownloadPermission(
          roadmapId,
          allowDownload,
          currentUser.uid
        );

        // Refresh both user and public roadmaps
        await Promise.all([loadUserRoadmaps(), loadPublicRoadmaps()]);

        return true;
      } catch (error) {
        console.error("❌ Error updating roadmap download permission:", error);
        setError(
          "Failed to update roadmap download permission: " + error.message
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadUserRoadmaps, loadPublicRoadmaps]
  );

  // Combined effect for authentication, migration, and subscriptions
  useEffect(() => {
    if (!currentUser) {
      // Clear subscriptions when user logs out
      subscriptions.forEach((unsubscribe) => unsubscribe());
      setSubscriptions([]);
      setUserRoadmaps([]);
      setMigrationStatus(null);
      return;
    }

    // Run migration first, then set up subscriptions
    const initializeUserData = async () => {
      try {
        // Step 1: Handle migration if needed
        if (!migrationStatus) {
          await checkAndRunMigration();
        }

        // Step 2: Set up real-time subscriptions (these will handle data loading)
        const userRoadmapsUnsubscribe =
          FirestorePersistence.subscribeToUserRoadmaps(
            currentUser.uid,
            (roadmaps) => {
              setUserRoadmaps(roadmaps);
            }
          );

        const publicRoadmapsUnsubscribe =
          FirestorePersistence.subscribeToPublicRoadmaps((roadmaps) => {
            setPublicRoadmaps(roadmaps);
          });

        setSubscriptions([userRoadmapsUnsubscribe, publicRoadmapsUnsubscribe]);

        // Cleanup function
        return () => {
          userRoadmapsUnsubscribe();
          publicRoadmapsUnsubscribe();
        };
      } catch (error) {
        console.error("❌ Error initializing user data:", error);
      }
    };

    initializeUserData();

    // Cleanup subscriptions on unmount or user change
    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
      setSubscriptions([]);
    };
  }, [currentUser?.uid]); // Only depend on user ID to prevent multiple triggers

  // Load public roadmaps independently (doesn't require authentication)
  useEffect(() => {
    loadPublicRoadmaps();
  }, [loadPublicRoadmaps]);

  const value = {
    // Data
    userRoadmaps,
    publicRoadmaps,
    loading,
    error,
    migrationStatus,

    // Actions
    saveRoadmap,
    loadRoadmap,
    updateRoadmap,
    deleteRoadmap,
    updateRoadmapPrivacy,
    updateRoadmapDownloadPermission,
    loadUserRoadmaps,
    loadPublicRoadmaps,
    clearError,

    // Migration
    checkAndRunMigration,
  };

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
};
