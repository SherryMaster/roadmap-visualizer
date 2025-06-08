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
  const [collectionRoadmaps, setCollectionRoadmaps] = useState([]);
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

  // Load user collection roadmaps
  const loadCollectionRoadmaps = useCallback(async () => {
    if (!currentUser) {
      setCollectionRoadmaps([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const roadmaps = await FirestorePersistence.getUserCollection(
        currentUser.uid
      );
      setCollectionRoadmaps(roadmaps);
    } catch (error) {
      console.error("❌ Error loading collection roadmaps:", error);

      // Handle permissions error gracefully
      if (error.message.includes("Missing or insufficient permissions")) {
        console.warn(
          "⚠️ Collection feature requires Firestore security rules update"
        );
        setCollectionRoadmaps([]);
        // Don't set error state for permissions issue - just log warning
      } else {
        setError("Failed to load your collection: " + error.message);
        setCollectionRoadmaps([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

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

        // Refresh user roadmaps (public roadmaps will update automatically via real-time listener)
        await loadUserRoadmaps();

        return true;
      } catch (error) {
        console.error("❌ Error updating roadmap privacy:", error);
        setError("Failed to update roadmap privacy: " + error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadUserRoadmaps]
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

        // Refresh user roadmaps (public roadmaps will update automatically via real-time listener)
        await loadUserRoadmaps();

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
    [currentUser, loadUserRoadmaps]
  );

  // Update roadmap dependency mode
  const updateRoadmapDependencyMode = useCallback(
    async (roadmapId, enableDependencies) => {
      if (!currentUser) {
        throw new Error("User must be authenticated");
      }

      try {
        setLoading(true);
        setError(null);

        await FirestorePersistence.updateRoadmapDependencyMode(
          roadmapId,
          enableDependencies,
          currentUser.uid
        );

        // Refresh user roadmaps (public roadmaps will update automatically via real-time listener)
        await loadUserRoadmaps();

        return true;
      } catch (error) {
        console.error("❌ Error updating roadmap dependency mode:", error);
        setError("Failed to update roadmap dependency mode: " + error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadUserRoadmaps]
  );

  // Update collection roadmap dependency mode (user-specific)
  const updateCollectionRoadmapDependencyMode = useCallback(
    async (roadmapId, enableDependencies) => {
      if (!currentUser) {
        throw new Error("User must be authenticated");
      }

      try {
        setLoading(true);
        setError(null);

        await FirestorePersistence.updateCollectionRoadmapDependencyMode(
          currentUser.uid,
          roadmapId,
          enableDependencies
        );

        // Refresh collection roadmaps to reflect the change
        await loadCollectionRoadmaps();

        return true;
      } catch (error) {
        console.error("❌ Error updating collection dependency mode:", error);
        setError(
          "Failed to update collection dependency mode: " + error.message
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadCollectionRoadmaps]
  );

  // Get collection roadmap dependency mode (user-specific)
  const getCollectionRoadmapDependencyMode = useCallback(
    async (roadmapId) => {
      if (!currentUser) {
        return null;
      }

      try {
        return await FirestorePersistence.getCollectionRoadmapDependencyMode(
          currentUser.uid,
          roadmapId
        );
      } catch (error) {
        console.error("❌ Error getting collection dependency mode:", error);
        return null;
      }
    },
    [currentUser]
  );

  // Save roadmap to collection
  const saveRoadmapToCollection = useCallback(
    async (roadmapId) => {
      if (!currentUser) {
        throw new Error(
          "User must be authenticated to save roadmaps to collection"
        );
      }

      try {
        setError(null);

        await FirestorePersistence.saveRoadmapToCollection(
          currentUser.uid,
          roadmapId
        );

        // Collection roadmaps will update automatically via real-time listener

        return true;
      } catch (error) {
        console.error("❌ Error saving roadmap to collection:", error);
        setError("Failed to save roadmap to collection: " + error.message);
        throw error;
      }
    },
    [currentUser]
  );

  // Remove roadmap from collection
  const removeRoadmapFromCollection = useCallback(
    async (roadmapId) => {
      if (!currentUser) {
        throw new Error("User must be authenticated");
      }

      try {
        setError(null);

        await FirestorePersistence.removeRoadmapFromCollection(
          currentUser.uid,
          roadmapId
        );

        // Collection roadmaps will update automatically via real-time listener

        return true;
      } catch (error) {
        console.error("❌ Error removing roadmap from collection:", error);
        setError("Failed to remove roadmap from collection: " + error.message);
        throw error;
      }
    },
    [currentUser]
  );

  // Check if roadmap is in collection
  const isRoadmapInCollection = useCallback(
    async (roadmapId) => {
      if (!currentUser) {
        return false;
      }

      try {
        return await FirestorePersistence.isRoadmapInCollection(
          currentUser.uid,
          roadmapId
        );
      } catch (error) {
        console.error("❌ Error checking collection status:", error);
        return false;
      }
    },
    [currentUser]
  );

  // Combined effect for authentication, migration, and subscriptions
  useEffect(() => {
    if (!currentUser) {
      // Clear subscriptions when user logs out
      subscriptions.forEach((unsubscribe) => unsubscribe());
      setSubscriptions([]);
      setUserRoadmaps([]);
      setCollectionRoadmaps([]);
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

        // Step 2: Set up real-time subscriptions for user-specific data only
        const userRoadmapsUnsubscribe =
          FirestorePersistence.subscribeToUserRoadmaps(
            currentUser.uid,
            (roadmaps) => {
              setUserRoadmaps(roadmaps);
            }
          );

        // Step 3: Set up real-time subscription for collection roadmaps
        let collectionUnsubscribe = null;
        try {
          console.log(
            "🔄 Setting up real-time listener for collection roadmaps..."
          );

          collectionUnsubscribe =
            await FirestorePersistence.subscribeToUserCollection(
              currentUser.uid,
              (roadmaps) => {
                console.log(
                  `📡 Real-time collection update: ${roadmaps.length} roadmaps received`
                );
                setCollectionRoadmaps(roadmaps);
              },
              (error) => {
                console.error(
                  "❌ Error in collection roadmaps listener:",
                  error
                );
                if (
                  error.message.includes("Missing or insufficient permissions")
                ) {
                  console.warn(
                    "⚠️ Collection feature requires Firestore security rules update. See firestore-security-rules-update.txt"
                  );
                  setCollectionRoadmaps([]); // Set empty array to prevent loading errors
                } else {
                  setError(
                    "Failed to load collection roadmaps: " + error.message
                  );
                  setCollectionRoadmaps([]);
                }
              }
            );
        } catch (error) {
          console.error("❌ Error setting up collection listener:", error);
          if (error.message.includes("Missing or insufficient permissions")) {
            console.warn(
              "⚠️ Collection feature requires Firestore security rules update. See firestore-security-rules-update.txt"
            );
            setCollectionRoadmaps([]); // Set empty array to prevent loading errors
          } else {
            // Fallback to manual loading
            try {
              await loadCollectionRoadmaps();
            } catch (fallbackError) {
              console.error(
                "❌ Fallback collection loading also failed:",
                fallbackError
              );
              setCollectionRoadmaps([]);
            }
          }
        }

        // Note: Public roadmaps are handled by the independent effect below
        // to ensure consistent behavior for both authenticated and anonymous users

        // Store all subscriptions for cleanup
        const allSubscriptions = [userRoadmapsUnsubscribe];
        if (collectionUnsubscribe) {
          allSubscriptions.push(collectionUnsubscribe);
        }
        setSubscriptions(allSubscriptions);

        // Cleanup function
        return () => {
          allSubscriptions.forEach((unsubscribe) => {
            if (unsubscribe) unsubscribe();
          });
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

  // Set up real-time listener for public roadmaps
  useEffect(() => {
    let unsubscribe = null;

    const setupPublicRoadmapsListener = async () => {
      try {
        console.log("🔄 Setting up real-time listener for public roadmaps...");

        // Set up real-time listener using FirestorePersistence
        unsubscribe = await FirestorePersistence.subscribeToPublicRoadmaps(
          (roadmaps) => {
            console.log(
              `📡 Real-time update: ${roadmaps.length} public roadmaps received`
            );
            setPublicRoadmaps(roadmaps);
            setError(null);
          },
          (error) => {
            console.error("❌ Error in public roadmaps listener:", error);
            setError("Failed to load public roadmaps: " + error.message);
            setPublicRoadmaps([]);
          }
        );
      } catch (error) {
        console.error("❌ Error setting up public roadmaps listener:", error);
        setError("Failed to set up real-time updates: " + error.message);
        // Fallback to manual loading
        loadPublicRoadmaps();
      }
    };

    setupPublicRoadmapsListener();

    // Cleanup listener on unmount or dependency change
    return () => {
      if (unsubscribe) {
        console.log("🔄 Cleaning up public roadmaps listener");
        unsubscribe();
      }
    };
  }, [currentUser?.uid]); // Re-setup when user changes for creator display

  const value = {
    // Data
    userRoadmaps,
    publicRoadmaps,
    collectionRoadmaps,
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
    updateRoadmapDependencyMode,
    updateCollectionRoadmapDependencyMode,
    getCollectionRoadmapDependencyMode,
    loadUserRoadmaps,
    loadPublicRoadmaps,
    loadCollectionRoadmaps,
    saveRoadmapToCollection,
    removeRoadmapFromCollection,
    isRoadmapInCollection,
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
