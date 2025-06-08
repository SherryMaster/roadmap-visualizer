/**
 * Firestore Persistence Utility
 * Manages user-scoped roadmap data storage with Firebase Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";

class FirestorePersistence {
  /**
   * Generate a unique ID for a roadmap
   */
  static generateRoadmapId(title, userId) {
    const timestamp = Date.now();
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const userPrefix = userId.substring(0, 8);
    return `${userPrefix}-${cleanTitle}-${timestamp}`;
  }

  /**
   * Save a roadmap with user ownership - Split into multiple documents to avoid size limits
   */
  static async saveRoadmap(roadmapData, userId) {
    if (!userId) {
      throw new Error("User must be authenticated to save roadmaps");
    }

    try {
      const roadmapId = this.generateRoadmapId(roadmapData.title, userId);
      const timestamp = serverTimestamp();

      // Split roadmap data into outline and tasks
      const { outline, phaseTasks } = this.splitRoadmapData(roadmapData);

      // Prepare roadmap outline document (without task details)
      const roadmapDoc = {
        id: roadmapId,
        userId: userId,
        outline: outline,
        // Note: originalData removed to avoid size limits - can be reconstructed from split documents
        isPublic: false, // Default to private
        allowDownload: true, // Default to allow downloads
        enableDependencies: true, // Default to enable dependencies for backward compatibility
        createdAt: timestamp,
        updatedAt: timestamp,
        lastAccessed: timestamp,
        version: 1,
        tags: roadmapData.tags || [],
        projectLevel: roadmapData.project_level || "beginner",
      };

      // Prepare metadata document for efficient querying
      const totalPhases = this.calculateTotalPhases(roadmapData);
      const totalTasks = this.calculateTotalTasks(roadmapData);

      const metadataDoc = {
        id: roadmapId,
        userId: userId,
        title: roadmapData.title,
        description: roadmapData.description || "",
        projectLevel: roadmapData.project_level || "beginner",
        tags: roadmapData.tags || [],
        isPublic: false,
        allowDownload: true, // Default to allow downloads
        enableDependencies: true, // Default to enable dependencies for backward compatibility
        createdAt: timestamp,
        updatedAt: timestamp,
        lastAccessed: timestamp,
        totalPhases: totalPhases,
        totalTasks: totalTasks,
        progressPercentage: 0,
        viewCount: 0,
        likeCount: 0,
      };

      // Use batch write for consistency
      const batch = writeBatch(db);

      // Save roadmap outline document
      const roadmapRef = doc(db, "roadmaps", roadmapId);
      batch.set(roadmapRef, roadmapDoc);

      // Save metadata document
      const metadataRef = doc(db, "roadmapMetadata", roadmapId);
      batch.set(metadataRef, metadataDoc);

      // Save phase tasks as separate documents
      phaseTasks.forEach((phaseData, index) => {
        const phaseTasksRef = doc(
          db,
          "phaseTasks",
          `${roadmapId}_phase_${index + 1}`
        );
        const phaseTasksDoc = {
          roadmapId: roadmapId,
          phaseId: phaseData.phase_id,
          phaseNumber: index + 1,
          tasks: phaseData.phase_tasks,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        console.log(`💾 Saving phase tasks document ${index + 1}:`, {
          docId: `${roadmapId}_phase_${index + 1}`,
          phaseId: phaseData.phase_id,
          tasksCount: phaseData.phase_tasks.length,
          sampleTask: phaseData.phase_tasks[0]
            ? {
                task_id: phaseData.phase_tasks[0].task_id,
                task_title: phaseData.phase_tasks[0].task_title,
              }
            : null,
          fullTasksData: phaseData.phase_tasks,
        });

        batch.set(phaseTasksRef, phaseTasksDoc);
      });

      await batch.commit();

      console.log("✅ Roadmap saved to Firestore (split format):", roadmapId);
      return roadmapId;
    } catch (error) {
      console.error("❌ Error saving roadmap to Firestore:", error);
      throw new Error("Failed to save roadmap: " + error.message);
    }
  }

  /**
   * Load a specific roadmap - Reconstruct from split documents
   */
  static async loadRoadmap(roadmapId, userId = null) {
    try {
      const roadmapRef = doc(db, "roadmaps", roadmapId);
      const roadmapSnap = await getDoc(roadmapRef);

      if (!roadmapSnap.exists()) {
        return null;
      }

      const roadmapData = roadmapSnap.data();

      // Check access permissions
      if (!roadmapData.isPublic && (!userId || roadmapData.userId !== userId)) {
        throw new Error("Access denied: This roadmap is private");
      }

      // Load phase tasks documents
      const phaseTasksQuery = query(
        collection(db, "phaseTasks"),
        where("roadmapId", "==", roadmapId)
      );
      const phaseTasksSnap = await getDocs(phaseTasksQuery);

      // Reconstruct full roadmap data
      const fullRoadmapData = this.reconstructRoadmapData(
        roadmapData,
        phaseTasksSnap
      );

      // Get creator information (display name and email)
      const creatorInfo = await this.getUserInfo(roadmapData.userId);

      // Update last accessed time if user owns the roadmap
      if (userId && roadmapData.userId === userId) {
        await this.updateLastAccessed(roadmapId);
      }

      // Return roadmap data with creator information
      return {
        ...fullRoadmapData,
        creatorDisplayName: creatorInfo.displayName,
        creatorEmail: creatorInfo.email,
      };
    } catch (error) {
      console.error("❌ Error loading roadmap from Firestore:", {
        roadmapId,
        userId,
        error: error.message,
        errorCode: error.code,
        errorType: error.constructor.name,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get all roadmaps for a specific user
   */
  static async getUserRoadmaps(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const metadataRef = collection(db, "roadmapMetadata");
      const q = query(
        metadataRef,
        where("userId", "==", userId),
        orderBy("lastAccessed", "desc")
      );

      const querySnapshot = await getDocs(q);
      const roadmaps = [];

      querySnapshot.forEach((doc) => {
        roadmaps.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return roadmaps;
    } catch (error) {
      console.error("❌ Error getting user roadmaps:", error);
      throw new Error("Failed to load user roadmaps: " + error.message);
    }
  }

  /**
   * Get user display name from user ID
   */
  static async getUserDisplayName(userId) {
    if (!userId) return "Unknown User";

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.displayName || userData.email || "Unknown User";
      }

      return "Unknown User";
    } catch (error) {
      console.error("❌ Error fetching user display name:", error);
      return "Unknown User";
    }
  }

  /**
   * Get complete user information from user ID
   */
  static async getUserInfo(userId) {
    if (!userId) return { displayName: "Unknown User", email: null };

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          displayName: userData.displayName || userData.email || "Unknown User",
          email: userData.email || null,
        };
      }

      return { displayName: "Unknown User", email: null };
    } catch (error) {
      console.error("❌ Error fetching user info:", error);
      return { displayName: "Unknown User", email: null };
    }
  }

  /**
   * Batch fetch user display names for multiple user IDs
   */
  static async batchGetUserDisplayNames(userIds) {
    if (!userIds || userIds.length === 0) return {};

    const uniqueUserIds = [...new Set(userIds)];
    const userDisplayNames = {};

    try {
      // Batch fetch user profiles
      const userPromises = uniqueUserIds.map(async (userId) => {
        const displayName = await this.getUserDisplayName(userId);
        return { userId, displayName };
      });

      const userResults = await Promise.all(userPromises);

      userResults.forEach(({ userId, displayName }) => {
        userDisplayNames[userId] = displayName;
      });

      return userDisplayNames;
    } catch (error) {
      console.error("❌ Error batch fetching user display names:", error);
      return {};
    }
  }

  /**
   * Get public roadmaps for community section with creator information
   */
  static async getPublicRoadmaps(limitCount = 20) {
    try {
      const metadataRef = collection(db, "roadmapMetadata");

      // Try optimized query first, fall back to simple query if index not ready
      let q;
      try {
        q = query(
          metadataRef,
          where("isPublic", "==", true),
          orderBy("updatedAt", "desc"),
          limit(limitCount)
        );
      } catch (indexError) {
        console.log("📊 Using fallback query (index not ready)");
        q = query(
          metadataRef,
          where("isPublic", "==", true),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const roadmaps = [];

      querySnapshot.forEach((doc) => {
        roadmaps.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Sort in memory if we used the fallback query
      if (!q._query.orderBy || q._query.orderBy.length === 0) {
        roadmaps.sort((a, b) => {
          const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
          const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
          return bTime - aTime;
        });
      }

      // Batch fetch creator display names
      const userIds = roadmaps.map((roadmap) => roadmap.userId).filter(Boolean);
      const userDisplayNames = await this.batchGetUserDisplayNames(userIds);

      // Add creator information to roadmaps
      const roadmapsWithCreators = roadmaps.map((roadmap) => ({
        ...roadmap,
        creatorDisplayName: userDisplayNames[roadmap.userId] || "Unknown User",
      }));

      return roadmapsWithCreators;
    } catch (error) {
      console.error("❌ Error getting public roadmaps:", error);
      throw new Error("Failed to load public roadmaps: " + error.message);
    }
  }

  /**
   * Subscribe to real-time updates for public roadmaps
   */
  static async subscribeToPublicRoadmaps(onUpdate, onError) {
    try {
      const metadataRef = collection(db, "roadmapMetadata");

      // Set up query for public roadmaps
      let q;
      try {
        q = query(
          metadataRef,
          where("isPublic", "==", true),
          orderBy("updatedAt", "desc"),
          limit(20)
        );
      } catch (indexError) {
        console.log(
          "📊 Using fallback query for real-time listener (index not ready)"
        );
        q = query(metadataRef, where("isPublic", "==", true), limit(20));
      }

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        async (querySnapshot) => {
          try {
            const roadmaps = [];

            querySnapshot.forEach((doc) => {
              roadmaps.push({
                id: doc.id,
                ...doc.data(),
              });
            });

            // Sort in memory if we used the fallback query
            if (!q._query.orderBy || q._query.orderBy.length === 0) {
              roadmaps.sort((a, b) => {
                const aTime =
                  a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
                const bTime =
                  b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
                return bTime - aTime;
              });
            }

            // Batch fetch creator display names
            const userIds = roadmaps
              .map((roadmap) => roadmap.userId)
              .filter(Boolean);
            const userDisplayNames = await this.batchGetUserDisplayNames(
              userIds
            );

            // Add creator information to roadmaps
            const roadmapsWithCreators = roadmaps.map((roadmap) => ({
              ...roadmap,
              creatorDisplayName:
                userDisplayNames[roadmap.userId] || "Unknown User",
            }));

            // Call the update callback
            onUpdate(roadmapsWithCreators);
          } catch (error) {
            console.error(
              "❌ Error processing real-time public roadmaps update:",
              error
            );
            onError(error);
          }
        },
        (error) => {
          console.error(
            "❌ Real-time listener error for public roadmaps:",
            error
          );
          onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("❌ Error setting up public roadmaps listener:", error);
      throw new Error("Failed to set up real-time listener: " + error.message);
    }
  }

  /**
   * Update roadmap privacy setting
   */
  static async updateRoadmapPrivacy(roadmapId, isPublic, userId) {
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    try {
      const batch = writeBatch(db);

      // Update roadmap document
      const roadmapRef = doc(db, "roadmaps", roadmapId);
      batch.update(roadmapRef, {
        isPublic: isPublic,
        updatedAt: serverTimestamp(),
      });

      // Update metadata document
      const metadataRef = doc(db, "roadmapMetadata", roadmapId);
      batch.update(metadataRef, {
        isPublic: isPublic,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      console.log(
        `✅ Roadmap privacy updated: ${roadmapId} -> ${
          isPublic ? "public" : "private"
        }`
      );
      return true;
    } catch (error) {
      console.error("❌ Error updating roadmap privacy:", error);
      throw new Error("Failed to update roadmap privacy: " + error.message);
    }
  }

  /**
   * Update roadmap download permission setting
   */
  static async updateRoadmapDownloadPermission(
    roadmapId,
    allowDownload,
    userId
  ) {
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    try {
      const batch = writeBatch(db);

      // Update roadmap document
      const roadmapRef = doc(db, "roadmaps", roadmapId);
      batch.update(roadmapRef, {
        allowDownload: allowDownload,
        updatedAt: serverTimestamp(),
      });

      // Update metadata document
      const metadataRef = doc(db, "roadmapMetadata", roadmapId);
      batch.update(metadataRef, {
        allowDownload: allowDownload,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      console.log(
        `✅ Roadmap download permission updated: ${roadmapId} -> ${
          allowDownload ? "downloads allowed" : "downloads disabled"
        }`
      );
      return true;
    } catch (error) {
      console.error("❌ Error updating roadmap download permission:", error);
      throw new Error(
        "Failed to update roadmap download permission: " + error.message
      );
    }
  }

  /**
   * Update user's personal dependency mode setting for any roadmap
   * This is now unified for both owner and collection roadmaps
   */
  static async updateUserDependencyMode(userId, roadmapId, enableDependencies) {
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    try {
      const progressRef = doc(
        db,
        "userPreferences",
        userId,
        "roadmaps",
        roadmapId
      );

      await setDoc(
        progressRef,
        {
          enableDependencies: enableDependencies,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(
        `✅ User dependency mode updated: ${userId}/${roadmapId} -> ${
          enableDependencies ? "dependencies enabled" : "dependencies disabled"
        }`
      );
      return true;
    } catch (error) {
      console.error("❌ Error updating user dependency mode:", error);
      throw new Error(
        "Failed to update user dependency mode: " + error.message
      );
    }
  }

  /**
   * Update collection roadmap dependency mode setting (user-specific)
   */
  static async updateCollectionRoadmapDependencyMode(
    userId,
    roadmapId,
    enableDependencies
  ) {
    try {
      const progressRef = doc(
        db,
        "collectionProgress",
        userId,
        "roadmaps",
        roadmapId
      );

      await setDoc(
        progressRef,
        {
          enableDependencies: enableDependencies,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      console.error("❌ Error updating collection dependency mode:", error);
      throw new Error(
        "Failed to update collection dependency mode: " + error.message
      );
    }
  }

  /**
   * Get user's personal dependency mode setting for any roadmap
   * This is now unified for both owner and collection roadmaps
   */
  static async getUserDependencyMode(userId, roadmapId) {
    if (!userId) {
      return null;
    }

    try {
      const progressRef = doc(
        db,
        "userPreferences",
        userId,
        "roadmaps",
        roadmapId
      );

      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        const data = progressSnap.data();
        // Return the user's preference, or null if not set (will inherit from roadmap default)
        return data.enableDependencies !== undefined
          ? data.enableDependencies
          : null;
      }
      return null; // No preference set, will inherit from roadmap default
    } catch (error) {
      console.error("❌ Error getting user dependency mode:", error);
      return null; // Fallback to inherit from roadmap default
    }
  }

  /**
   * Get collection roadmap dependency mode setting (user-specific)
   * @deprecated Use getUserDependencyMode instead for unified approach
   */
  static async getCollectionRoadmapDependencyMode(userId, roadmapId) {
    try {
      const progressRef = doc(
        db,
        "collectionProgress",
        userId,
        "roadmaps",
        roadmapId
      );

      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        const data = progressSnap.data();
        // Return the user's preference, or null if not set (will inherit from original)
        return data.enableDependencies !== undefined
          ? data.enableDependencies
          : null;
      }
      return null; // No preference set, will inherit from original roadmap
    } catch (error) {
      console.error("❌ Error getting collection dependency mode:", error);
      return null; // Fallback to inherit from original roadmap
    }
  }

  /**
   * Update roadmap data - Handle split document structure
   */
  static async updateRoadmap(roadmapId, roadmapData, userId) {
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    try {
      console.log("🔄 Starting roadmap update:", {
        roadmapId,
        userId,
        roadmapTitle: roadmapData.title,
        hasRoadmapData: !!roadmapData.roadmap,
      });

      // First, verify the roadmap exists and user owns it
      const roadmapRef = doc(db, "roadmaps", roadmapId);
      const roadmapSnap = await getDoc(roadmapRef);

      if (!roadmapSnap.exists()) {
        throw new Error(`Roadmap ${roadmapId} not found`);
      }

      const existingRoadmapData = roadmapSnap.data();
      if (existingRoadmapData.userId !== userId) {
        throw new Error(
          `Access denied: User ${userId} does not own roadmap ${roadmapId} (owned by ${existingRoadmapData.userId})`
        );
      }

      console.log("✅ Ownership verified:", {
        roadmapId,
        owner: existingRoadmapData.userId,
        requestingUser: userId,
        isPublic: existingRoadmapData.isPublic,
      });

      // Split roadmap data into outline and tasks
      const { outline, phaseTasks } = this.splitRoadmapData(roadmapData);

      const batch = writeBatch(db);

      console.log("📝 Preparing batch updates:", {
        outlinePhases: outline.roadmap?.phases?.length || 0,
        phaseTasksCount: phaseTasks.length,
      });

      // Update roadmap outline document (reuse existing roadmapRef)
      const roadmapUpdateData = {
        outline: outline,
        updatedAt: serverTimestamp(),
        lastAccessed: serverTimestamp(),
        version: increment(1),
      };

      console.log("📄 Updating roadmap document:", {
        roadmapId,
        updateFields: Object.keys(roadmapUpdateData),
        outlineStructure: {
          title: outline.title,
          hasRoadmap: !!outline.roadmap,
          phasesCount: outline.roadmap?.phases?.length || 0,
        },
      });

      batch.update(roadmapRef, roadmapUpdateData);

      // Update metadata document
      const metadataRef = doc(db, "roadmapMetadata", roadmapId);
      const metadataUpdateData = {
        title: roadmapData.title,
        description: roadmapData.description || "",
        projectLevel: roadmapData.project_level || "beginner",
        tags: roadmapData.tags || [],
        updatedAt: serverTimestamp(),
        lastAccessed: serverTimestamp(),
        totalPhases: this.calculateTotalPhases(roadmapData),
        totalTasks: this.calculateTotalTasks(roadmapData),
      };

      console.log("📊 Updating metadata document:", {
        roadmapId,
        updateFields: Object.keys(metadataUpdateData),
        title: metadataUpdateData.title,
        projectLevel: metadataUpdateData.projectLevel,
        totalPhases: metadataUpdateData.totalPhases,
        totalTasks: metadataUpdateData.totalTasks,
      });

      batch.update(metadataRef, metadataUpdateData);

      // Delete existing phase tasks documents
      const existingPhaseTasksQuery = query(
        collection(db, "phaseTasks"),
        where("roadmapId", "==", roadmapId)
      );
      const existingPhaseTasksSnap = await getDocs(existingPhaseTasksQuery);

      console.log("🗑️ Deleting existing phase tasks:", {
        roadmapId,
        existingDocsCount: existingPhaseTasksSnap.size,
        existingDocs: existingPhaseTasksSnap.docs.map((doc) => ({
          id: doc.id,
          phaseId: doc.data().phaseId,
        })),
      });

      existingPhaseTasksSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add updated phase tasks documents
      console.log("📝 Creating new phase tasks documents:", {
        roadmapId,
        newPhaseTasksCount: phaseTasks.length,
        phases: phaseTasks.map((pt, index) => ({
          index: index + 1,
          phaseId: pt.phase_id,
          tasksCount: pt.phase_tasks.length,
        })),
      });

      phaseTasks.forEach((phaseData, index) => {
        const phaseTasksRef = doc(
          db,
          "phaseTasks",
          `${roadmapId}_phase_${index + 1}`
        );
        batch.set(phaseTasksRef, {
          roadmapId: roadmapId,
          phaseId: phaseData.phase_id,
          phaseNumber: index + 1,
          tasks: phaseData.phase_tasks,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      console.log("✅ Roadmap updated in Firestore (split format):", roadmapId);
      return true;
    } catch (error) {
      console.error("❌ Error updating roadmap:", error);
      throw new Error("Failed to update roadmap: " + error.message);
    }
  }

  /**
   * Delete a roadmap - Handle split document structure
   */
  static async deleteRoadmap(roadmapId, userId) {
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    try {
      // First, verify the roadmap exists and user owns it
      const roadmapRef = doc(db, "roadmaps", roadmapId);
      const roadmapSnap = await getDoc(roadmapRef);

      if (!roadmapSnap.exists()) {
        console.log("⚠️ Roadmap not found, may already be deleted");
        return true; // Consider it successful if already deleted
      }

      const roadmapData = roadmapSnap.data();
      if (roadmapData.userId !== userId) {
        throw new Error("Access denied: You don't own this roadmap");
      }

      // Find all phase tasks documents to delete
      const phaseTasksQuery = query(
        collection(db, "phaseTasks"),
        where("roadmapId", "==", roadmapId)
      );
      const phaseTasksSnap = await getDocs(phaseTasksQuery);

      // Use batch write for atomic deletion
      const batch = writeBatch(db);

      // Delete roadmap document
      batch.delete(roadmapRef);

      // Delete metadata document
      const metadataRef = doc(db, "roadmapMetadata", roadmapId);
      batch.delete(metadataRef);

      // Delete all phase tasks documents
      phaseTasksSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete task completions (if they exist)
      const completionRef = doc(
        db,
        "taskCompletions",
        userId,
        "roadmaps",
        roadmapId
      );
      batch.delete(completionRef);

      // Execute all deletions atomically
      await batch.commit();

      console.log("✅ Roadmap deleted successfully:", roadmapId);

      return true;
    } catch (error) {
      console.error("❌ Error deleting roadmap:", {
        roadmapId,
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to delete roadmap: " + error.message);
    }
  }

  /**
   * Update last accessed time
   */
  static async updateLastAccessed(roadmapId) {
    try {
      const metadataRef = doc(db, "roadmapMetadata", roadmapId);
      await updateDoc(metadataRef, {
        lastAccessed: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ Error updating last accessed:", error);
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Update progress percentage for a roadmap
   */
  static async updateRoadmapProgress(roadmapId, progressPercentage) {
    try {
      const metadataRef = doc(db, "roadmapMetadata", roadmapId);
      await updateDoc(metadataRef, {
        progressPercentage: progressPercentage,
        lastAccessed: serverTimestamp(),
      });

      console.log(
        `✅ Progress updated for roadmap ${roadmapId}: ${progressPercentage}%`
      );
    } catch (error) {
      console.error("❌ Error updating roadmap progress:", error);
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Save a roadmap to user's collection (reference-based, not content duplication)
   */
  static async saveRoadmapToCollection(userId, roadmapId) {
    try {
      // First verify the roadmap exists and is public
      const roadmapRef = doc(db, "roadmaps", roadmapId);
      const roadmapSnap = await getDoc(roadmapRef);

      if (!roadmapSnap.exists()) {
        throw new Error("Roadmap not found");
      }

      const roadmapData = roadmapSnap.data();
      if (!roadmapData.isPublic) {
        throw new Error("Cannot save private roadmaps to collection");
      }

      // Check if already in collection
      const collectionRef = doc(
        db,
        "userCollections",
        userId,
        "savedRoadmaps",
        roadmapId
      );
      const existingSnap = await getDoc(collectionRef);

      if (existingSnap.exists()) {
        throw new Error("Roadmap already in your collection");
      }

      // Save reference to user's collection
      const timestamp = serverTimestamp();
      await setDoc(collectionRef, {
        roadmapId: roadmapId,
        originalOwnerId: roadmapData.userId,
        savedAt: timestamp,
        lastAccessed: timestamp,
        // Store minimal metadata for quick access
        title: roadmapData.outline?.title || "Untitled Roadmap",
        description: roadmapData.outline?.description || "",
        projectLevel: roadmapData.outline?.project_level || "beginner",
        tags: roadmapData.outline?.tags || [],
      });

      console.log(
        `✅ Roadmap ${roadmapId} saved to user ${userId}'s collection`
      );
      return true;
    } catch (error) {
      console.error("❌ Error saving roadmap to collection:", error);
      throw new Error("Failed to save roadmap to collection: " + error.message);
    }
  }

  /**
   * Remove a roadmap from user's collection
   */
  static async removeRoadmapFromCollection(userId, roadmapId) {
    try {
      const collectionRef = doc(
        db,
        "userCollections",
        userId,
        "savedRoadmaps",
        roadmapId
      );
      await deleteDoc(collectionRef);

      // Also remove any progress data for this collection roadmap
      const progressRef = doc(
        db,
        "collectionProgress",
        userId,
        "roadmaps",
        roadmapId
      );
      await deleteDoc(progressRef);

      console.log(
        `✅ Roadmap ${roadmapId} removed from user ${userId}'s collection`
      );
      return true;
    } catch (error) {
      console.error("❌ Error removing roadmap from collection:", error);
      throw new Error(
        "Failed to remove roadmap from collection: " + error.message
      );
    }
  }

  /**
   * Get user's collection roadmaps
   */
  static async getUserCollection(userId) {
    try {
      const collectionQuery = query(
        collection(db, "userCollections", userId, "savedRoadmaps"),
        orderBy("savedAt", "desc")
      );

      const querySnapshot = await getDocs(collectionQuery);
      const collectionRoadmaps = [];

      for (const docSnap of querySnapshot.docs) {
        const collectionData = docSnap.data();

        // Get the original roadmap metadata for current info
        try {
          const metadataRef = doc(
            db,
            "roadmapMetadata",
            collectionData.roadmapId
          );
          const metadataSnap = await getDoc(metadataRef);

          if (metadataSnap.exists()) {
            const metadata = metadataSnap.data();

            // Get user's progress for this collection roadmap
            const progressRef = doc(
              db,
              "collectionProgress",
              userId,
              "roadmaps",
              collectionData.roadmapId
            );
            const progressSnap = await getDoc(progressRef);
            const progressData = progressSnap.exists()
              ? progressSnap.data()
              : { progressPercentage: 0 };

            // Debug: Check progress data
            if (progressData.progressPercentage > 0) {
              console.log(
                `📊 Collection progress for roadmap ${collectionData.roadmapId}: ${progressData.progressPercentage}%`
              );
            }

            collectionRoadmaps.push({
              id: collectionData.roadmapId,
              title: metadata.title,
              description: metadata.description,
              projectLevel: metadata.projectLevel,
              tags: metadata.tags,
              totalPhases: metadata.totalPhases,
              totalTasks: metadata.totalTasks,
              likeCount: metadata.likeCount,
              viewCount: metadata.viewCount,
              originalOwnerId: collectionData.originalOwnerId,
              savedAt: collectionData.savedAt,
              lastAccessed: collectionData.lastAccessed,
              progressPercentage: progressData.progressPercentage || 0,
              isCollection: true, // Flag to identify collection roadmaps
              isDeleted: false, // Roadmap still exists
              // Keep original metadata for credibility
              createdAt: metadata.createdAt,
              updatedAt: metadata.updatedAt,
            });
          } else {
            // Roadmap has been deleted by owner - include it with deleted flag
            console.warn(
              `⚠️ Roadmap ${collectionData.roadmapId} no longer exists (deleted by owner)`
            );

            // Get user's progress for this collection roadmap (if any)
            const progressRef = doc(
              db,
              "collectionProgress",
              userId,
              "roadmaps",
              collectionData.roadmapId
            );
            const progressSnap = await getDoc(progressRef);
            const progressData = progressSnap.exists()
              ? progressSnap.data()
              : { progressPercentage: 0 };

            collectionRoadmaps.push({
              id: collectionData.roadmapId,
              title: collectionData.title || "Deleted Roadmap",
              description:
                collectionData.description ||
                "This roadmap has been deleted by its owner.",
              projectLevel: collectionData.projectLevel || "beginner",
              tags: collectionData.tags || [],
              totalPhases: 0,
              totalTasks: 0,
              likeCount: 0,
              viewCount: 0,
              originalOwnerId: collectionData.originalOwnerId,
              savedAt: collectionData.savedAt,
              lastAccessed: collectionData.lastAccessed,
              progressPercentage: progressData.progressPercentage || 0,
              isCollection: true,
              isDeleted: true, // Flag to indicate roadmap was deleted
              // Use saved timestamps if available
              createdAt: collectionData.createdAt || collectionData.savedAt,
              updatedAt: collectionData.savedAt,
            });
          }
        } catch (metadataError) {
          console.warn(
            `⚠️ Could not load metadata for roadmap ${collectionData.roadmapId}:`,
            metadataError
          );
          // Include basic info even if metadata fails - treat as potentially deleted
          collectionRoadmaps.push({
            id: collectionData.roadmapId,
            title: collectionData.title || "Deleted Roadmap",
            description:
              collectionData.description ||
              "This roadmap may have been deleted by its owner.",
            projectLevel: collectionData.projectLevel || "beginner",
            tags: collectionData.tags || [],
            originalOwnerId: collectionData.originalOwnerId,
            savedAt: collectionData.savedAt,
            lastAccessed: collectionData.lastAccessed,
            progressPercentage: 0,
            isCollection: true,
            isDeleted: true, // Treat metadata errors as potentially deleted
            totalPhases: 0,
            totalTasks: 0,
            likeCount: 0,
            viewCount: 0,
            createdAt: collectionData.createdAt || collectionData.savedAt,
            updatedAt: collectionData.savedAt,
          });
        }
      }

      console.log(
        `✅ Loaded ${collectionRoadmaps.length} roadmaps from user ${userId}'s collection`
      );
      return collectionRoadmaps;
    } catch (error) {
      console.error("❌ Error loading user collection:", error);
      throw new Error("Failed to load user collection: " + error.message);
    }
  }

  /**
   * Load task completion data for a roadmap
   */
  static async loadTaskCompletions(userId, roadmapId) {
    try {
      const completionRef = doc(
        db,
        "taskCompletions",
        userId,
        "roadmaps",
        roadmapId
      );
      const completionSnap = await getDoc(completionRef);

      if (completionSnap.exists()) {
        const data = completionSnap.data();
        return data.completedTasks || {};
      }

      return {};
    } catch (error) {
      console.error("❌ Error loading task completions:", error);
      return {};
    }
  }

  /**
   * Save task completion data for a roadmap
   */
  static async saveTaskCompletions(userId, roadmapId, completedTasks) {
    try {
      const completionRef = doc(
        db,
        "taskCompletions",
        userId,
        "roadmaps",
        roadmapId
      );

      await setDoc(
        completionRef,
        {
          completedTasks: completedTasks,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`✅ Task completions saved for roadmap ${roadmapId}`);
    } catch (error) {
      console.error("❌ Error saving task completions:", error);
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Save task completion data for a collection roadmap (separate from owned roadmaps)
   */
  static async saveCollectionTaskCompletions(
    userId,
    roadmapId,
    completedTasks
  ) {
    try {
      const completionRef = doc(
        db,
        "collectionProgress",
        userId,
        "roadmaps",
        roadmapId
      );

      await setDoc(
        completionRef,
        {
          completedTasks: completedTasks,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(
        `✅ Collection task completions saved for roadmap ${roadmapId}`
      );
    } catch (error) {
      console.error("❌ Error saving collection task completions:", error);
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Load task completion data for a collection roadmap
   */
  static async loadCollectionTaskCompletions(userId, roadmapId) {
    try {
      const completionRef = doc(
        db,
        "collectionProgress",
        userId,
        "roadmaps",
        roadmapId
      );

      const completionSnap = await getDoc(completionRef);

      if (completionSnap.exists()) {
        const data = completionSnap.data();
        console.log(
          `✅ Collection task completions loaded for roadmap ${roadmapId}`
        );
        return data.completedTasks || {};
      }

      console.log(
        `📝 No collection task completions found for roadmap ${roadmapId}`
      );
      return {};
    } catch (error) {
      console.error("❌ Error loading collection task completions:", error);
      return {};
    }
  }

  /**
   * Update progress percentage for a collection roadmap
   */
  static async updateCollectionRoadmapProgress(
    userId,
    roadmapId,
    progressPercentage
  ) {
    try {
      const progressRef = doc(
        db,
        "collectionProgress",
        userId,
        "roadmaps",
        roadmapId
      );

      await setDoc(
        progressRef,
        {
          progressPercentage: progressPercentage,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(
        `✅ Collection progress updated for roadmap ${roadmapId}: ${progressPercentage}%`
      );
    } catch (error) {
      console.error("❌ Error updating collection roadmap progress:", error);
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Subscribe to real-time updates for user's collection roadmaps
   */
  static async subscribeToUserCollection(userId, onUpdate, onError) {
    if (!userId) {
      throw new Error("User ID is required for collection subscription");
    }

    try {
      const collectionQuery = query(
        collection(db, "userCollections", userId, "savedRoadmaps"),
        orderBy("savedAt", "desc")
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        collectionQuery,
        async (querySnapshot) => {
          try {
            const collectionRoadmaps = [];

            for (const docSnap of querySnapshot.docs) {
              const collectionData = docSnap.data();

              // Get the original roadmap metadata for current info
              try {
                const metadataRef = doc(
                  db,
                  "roadmapMetadata",
                  collectionData.roadmapId
                );
                const metadataSnap = await getDoc(metadataRef);

                if (metadataSnap.exists()) {
                  const metadata = metadataSnap.data();

                  // Get user's progress for this collection roadmap
                  const progressRef = doc(
                    db,
                    "collectionProgress",
                    userId,
                    "roadmaps",
                    collectionData.roadmapId
                  );
                  const progressSnap = await getDoc(progressRef);
                  const progressData = progressSnap.exists()
                    ? progressSnap.data()
                    : { progressPercentage: 0 };

                  collectionRoadmaps.push({
                    id: collectionData.roadmapId,
                    title: metadata.title,
                    description: metadata.description,
                    projectLevel: metadata.projectLevel,
                    tags: metadata.tags,
                    totalPhases: metadata.totalPhases,
                    totalTasks: metadata.totalTasks,
                    likeCount: metadata.likeCount,
                    viewCount: metadata.viewCount,
                    originalOwnerId: collectionData.originalOwnerId,
                    savedAt: collectionData.savedAt,
                    lastAccessed: collectionData.lastAccessed,
                    progressPercentage: progressData.progressPercentage || 0,
                    isCollection: true,
                    isDeleted: false, // Roadmap still exists
                    createdAt: metadata.createdAt,
                    updatedAt: metadata.updatedAt,
                  });
                } else {
                  // Roadmap has been deleted by owner - include it with deleted flag
                  console.warn(
                    `⚠️ Roadmap ${collectionData.roadmapId} no longer exists (deleted by owner)`
                  );

                  // Get user's progress for this collection roadmap (if any)
                  const progressRef = doc(
                    db,
                    "collectionProgress",
                    userId,
                    "roadmaps",
                    collectionData.roadmapId
                  );
                  const progressSnap = await getDoc(progressRef);
                  const progressData = progressSnap.exists()
                    ? progressSnap.data()
                    : { progressPercentage: 0 };

                  collectionRoadmaps.push({
                    id: collectionData.roadmapId,
                    title: collectionData.title || "Deleted Roadmap",
                    description:
                      collectionData.description ||
                      "This roadmap has been deleted by its owner.",
                    projectLevel: collectionData.projectLevel || "beginner",
                    tags: collectionData.tags || [],
                    totalPhases: 0,
                    totalTasks: 0,
                    likeCount: 0,
                    viewCount: 0,
                    originalOwnerId: collectionData.originalOwnerId,
                    savedAt: collectionData.savedAt,
                    lastAccessed: collectionData.lastAccessed,
                    progressPercentage: progressData.progressPercentage || 0,
                    isCollection: true,
                    isDeleted: true, // Flag to indicate roadmap was deleted
                    createdAt:
                      collectionData.createdAt || collectionData.savedAt,
                    updatedAt: collectionData.savedAt,
                  });
                }
              } catch (metadataError) {
                console.warn(
                  `⚠️ Could not load metadata for roadmap ${collectionData.roadmapId}:`,
                  metadataError
                );
                // Include basic info even if metadata fails - treat as potentially deleted
                collectionRoadmaps.push({
                  id: collectionData.roadmapId,
                  title: collectionData.title || "Deleted Roadmap",
                  description:
                    collectionData.description ||
                    "This roadmap may have been deleted by its owner.",
                  projectLevel: collectionData.projectLevel || "beginner",
                  tags: collectionData.tags || [],
                  originalOwnerId: collectionData.originalOwnerId,
                  savedAt: collectionData.savedAt,
                  lastAccessed: collectionData.lastAccessed,
                  progressPercentage: 0,
                  isCollection: true,
                  isDeleted: true, // Treat metadata errors as potentially deleted
                  totalPhases: 0,
                  totalTasks: 0,
                  likeCount: 0,
                  viewCount: 0,
                  createdAt: collectionData.createdAt || collectionData.savedAt,
                  updatedAt: collectionData.savedAt,
                });
              }
            }

            console.log(
              `📡 Real-time collection update: ${collectionRoadmaps.length} roadmaps received for user ${userId}`
            );

            // Call the update callback
            onUpdate(collectionRoadmaps);
          } catch (error) {
            console.error(
              "❌ Error processing real-time collection update:",
              error
            );
            onError(error);
          }
        },
        (error) => {
          console.error(
            "❌ Real-time listener error for user collection:",
            error
          );
          onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("❌ Error setting up collection listener:", error);
      throw new Error(
        "Failed to set up collection real-time listener: " + error.message
      );
    }
  }

  /**
   * Check if a roadmap is in user's collection
   */
  static async isRoadmapInCollection(userId, roadmapId) {
    try {
      const collectionRef = doc(
        db,
        "userCollections",
        userId,
        "savedRoadmaps",
        roadmapId
      );
      const collectionSnap = await getDoc(collectionRef);
      return collectionSnap.exists();
    } catch (error) {
      console.error("❌ Error checking collection status:", error);
      return false;
    }
  }

  /**
   * Calculate total phases in roadmap
   */
  static calculateTotalPhases(roadmapData) {
    // Handle different roadmap data formats
    // Format 1: Schema format - roadmap.phases (array)
    if (
      roadmapData.roadmap &&
      roadmapData.roadmap.phases &&
      Array.isArray(roadmapData.roadmap.phases)
    ) {
      return roadmapData.roadmap.phases.length;
    }
    // Format 2: UI format - roadmap (direct array)
    else if (roadmapData.roadmap && Array.isArray(roadmapData.roadmap)) {
      return roadmapData.roadmap.length;
    }
    // Format 3: Direct phases array
    else if (roadmapData.phases && Array.isArray(roadmapData.phases)) {
      return roadmapData.phases.length;
    }

    return 0;
  }

  /**
   * Calculate total tasks in roadmap
   */
  static calculateTotalTasks(roadmapData) {
    // Handle different roadmap data formats
    let phases = null;

    // Format 1: Schema format - roadmap.phases (array)
    if (
      roadmapData.roadmap &&
      roadmapData.roadmap.phases &&
      Array.isArray(roadmapData.roadmap.phases)
    ) {
      phases = roadmapData.roadmap.phases;
    }
    // Format 2: UI format - roadmap (direct array)
    else if (roadmapData.roadmap && Array.isArray(roadmapData.roadmap)) {
      phases = roadmapData.roadmap;
    }
    // Format 3: Direct phases array
    else if (roadmapData.phases && Array.isArray(roadmapData.phases)) {
      phases = roadmapData.phases;
    }

    if (!phases || !Array.isArray(phases)) return 0;

    return phases.reduce((total, phase) => {
      // Handle both phase_tasks and tasks property names
      const tasks = phase.phase_tasks || phase.tasks || [];
      return total + tasks.length;
    }, 0);
  }

  /**
   * Split roadmap data into outline and phase tasks to avoid document size limits
   */
  static splitRoadmapData(roadmapData) {
    console.log("🔪 Starting data split:", {
      hasRoadmap: !!roadmapData.roadmap,
      roadmapType: Array.isArray(roadmapData.roadmap)
        ? "array"
        : typeof roadmapData.roadmap,
      roadmapLength: Array.isArray(roadmapData.roadmap)
        ? roadmapData.roadmap.length
        : "N/A",
      hasRoadmapPhases: !!(roadmapData.roadmap && roadmapData.roadmap.phases),
      roadmapPhasesLength: roadmapData.roadmap?.phases?.length || "N/A",
      hasDirectPhases: !!roadmapData.phases,
      directPhasesLength: roadmapData.phases?.length || "N/A",
    });

    // Create outline without task details
    const outline = {
      title: roadmapData.title,
      description: roadmapData.description,
      tags: roadmapData.tags,
      project_level: roadmapData.project_level,
      roadmap: {
        phases: [],
      },
    };

    const phaseTasks = [];

    // Handle different roadmap data formats
    let phases = null;

    // Format 1: Schema format - roadmap.phases (array)
    if (
      roadmapData.roadmap &&
      roadmapData.roadmap.phases &&
      Array.isArray(roadmapData.roadmap.phases)
    ) {
      phases = roadmapData.roadmap.phases;
      console.log("📋 Using schema format: roadmap.phases");
    }
    // Format 2: UI format - roadmap (direct array)
    else if (roadmapData.roadmap && Array.isArray(roadmapData.roadmap)) {
      phases = roadmapData.roadmap;
      console.log("📋 Using UI format: roadmap (direct array)");
    }
    // Format 3: Direct phases array
    else if (roadmapData.phases && Array.isArray(roadmapData.phases)) {
      phases = roadmapData.phases;
      console.log("📋 Using direct phases format");
    }

    console.log("📊 Phases to process:", {
      phasesFound: !!phases,
      phasesCount: phases?.length || 0,
      samplePhase: phases?.[0]
        ? {
            phase_id: phases[0].phase_id,
            phase_title: phases[0].phase_title,
            tasksCount: (phases[0].phase_tasks || phases[0].tasks || []).length,
          }
        : null,
    });

    if (phases && Array.isArray(phases)) {
      phases.forEach((phase, index) => {
        // Create phase outline without tasks
        const phaseOutline = {
          phase_id: phase.phase_id,
          phase_title: phase.phase_title,
          phase_summary: phase.phase_summary,
          phase_details: phase.phase_details,
          phase_number: phase.phase_number || index + 1,
          phase_dependencies: phase.phase_dependencies,
          key_milestones: phase.key_milestones,
          success_indicators: phase.success_indicators,
          // Store task count but not the actual tasks
          task_count: (phase.phase_tasks || phase.tasks || []).length,
        };

        outline.roadmap.phases.push(phaseOutline);

        // Store tasks separately
        const tasks = phase.phase_tasks || phase.tasks || [];
        if (tasks.length > 0) {
          phaseTasks.push({
            phase_id: phase.phase_id,
            phase_tasks: tasks,
          });

          console.log(
            `📝 Phase ${index + 1} (${phase.phase_id}): ${tasks.length} tasks`
          );
        }
      });
    }

    console.log("✂️ Split complete:", {
      outlinePhases: outline.roadmap.phases.length,
      phaseTasksCount: phaseTasks.length,
      totalTasksInPhaseTasks: phaseTasks.reduce(
        (sum, pt) => sum + pt.phase_tasks.length,
        0
      ),
    });

    return { outline, phaseTasks };
  }

  /**
   * Reconstruct full roadmap data from split documents
   */
  static reconstructRoadmapData(roadmapData, phaseTasksSnap) {
    // Get phase tasks data
    const phaseTasksMap = new Map();
    phaseTasksSnap.forEach((doc) => {
      const data = doc.data();
      // Use the correct field name - we store as 'tasks' not 'data.tasks'
      phaseTasksMap.set(data.phaseId, data.tasks || []);
    });

    // Reconstruct full roadmap - need to determine output format
    // The RoadmapVisualizer expects either roadmap.phases OR roadmap as direct array
    const reconstructedPhases = roadmapData.outline.roadmap.phases.map(
      (phase) => {
        // Remove task_count field and add actual tasks
        const { task_count, ...phaseWithoutCount } = phase;
        const phaseTasks = phaseTasksMap.get(phase.phase_id) || [];

        return {
          ...phaseWithoutCount,
          phase_tasks: phaseTasks,
        };
      }
    );

    // Use UI format (direct array) to match what DataTransformer produces
    const fullData = {
      ...roadmapData.outline,
      roadmap: reconstructedPhases, // Direct array format for UI compatibility
    };

    return {
      id: roadmapData.id,
      data: fullData,
      originalData: fullData, // Use reconstructed data as originalData since we don't store it separately
      isPublic: roadmapData.isPublic ?? false, // Default to private for existing roadmaps
      allowDownload: roadmapData.allowDownload ?? true, // Default to allow downloads for existing roadmaps
      userId: roadmapData.userId,
      createdAt: roadmapData.createdAt,
      updatedAt: roadmapData.updatedAt,
      lastAccessed: roadmapData.lastAccessed,
    };
  }

  /**
   * Subscribe to user's roadmaps (real-time updates)
   */
  static subscribeToUserRoadmaps(userId, callback) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const metadataRef = collection(db, "roadmapMetadata");
    const q = query(
      metadataRef,
      where("userId", "==", userId),
      orderBy("lastAccessed", "desc")
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const roadmaps = [];
        querySnapshot.forEach((doc) => {
          roadmaps.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        callback(roadmaps);
      },
      (error) => {
        console.error("❌ Error in roadmaps subscription:", error);
        callback([]);
      }
    );
  }

  /**
   * Subscribe to public roadmaps (real-time updates)
   */
  static subscribeToPublicRoadmaps(callback, limitCount = 20) {
    const metadataRef = collection(db, "roadmapMetadata");

    // Try optimized query first, fall back to simple query if index not ready
    let q;
    try {
      q = query(
        metadataRef,
        where("isPublic", "==", true),
        orderBy("updatedAt", "desc"),
        limit(limitCount)
      );
    } catch (indexError) {
      console.log("📊 Using fallback subscription query (index not ready)");
      q = query(metadataRef, where("isPublic", "==", true), limit(limitCount));
    }

    return onSnapshot(
      q,
      async (querySnapshot) => {
        const roadmaps = [];
        querySnapshot.forEach((doc) => {
          roadmaps.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Sort in memory if we used the fallback query
        if (!q._query.orderBy || q._query.orderBy.length === 0) {
          roadmaps.sort((a, b) => {
            const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
            const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
            return bTime - aTime;
          });
        }

        // Batch fetch creator display names
        const userIds = roadmaps
          .map((roadmap) => roadmap.userId)
          .filter(Boolean);
        const userDisplayNames = await this.batchGetUserDisplayNames(userIds);

        // Add creator information to roadmaps
        const roadmapsWithCreators = roadmaps.map((roadmap) => ({
          ...roadmap,
          creatorDisplayName:
            userDisplayNames[roadmap.userId] || "Unknown User",
        }));

        callback(roadmapsWithCreators);
      },
      (error) => {
        console.error("❌ Error in public roadmaps subscription:", error);
        callback([]);
      }
    );
  }

  /**
   * Save roadmap votes
   */
  static async saveRoadmapVotes(roadmapId, votes) {
    try {
      const votesRef = doc(db, "roadmapVotes", roadmapId);
      await setDoc(
        votesRef,
        {
          roadmapId: roadmapId,
          votes: votes.votes || {},
          totalVotes: votes.totalVotes || 0,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      console.log("✅ Roadmap votes saved to Firestore:", roadmapId);
      return true;
    } catch (error) {
      console.error("❌ Error saving roadmap votes to Firestore:", error);
      throw new Error("Failed to save roadmap votes: " + error.message);
    }
  }

  /**
   * Get roadmap votes
   */
  static async getRoadmapVotes(roadmapId) {
    try {
      const votesRef = doc(db, "roadmapVotes", roadmapId);
      const votesSnap = await getDoc(votesRef);

      if (!votesSnap.exists()) {
        return null;
      }

      const votesData = votesSnap.data();
      return {
        votes: votesData.votes || {},
        totalVotes: votesData.totalVotes || 0,
        lastUpdated: votesData.lastUpdated,
      };
    } catch (error) {
      console.error("❌ Error getting roadmap votes from Firestore:", error);
      return null;
    }
  }

  /**
   * Toggle a user's vote for a roadmap
   */
  static async toggleRoadmapVote(roadmapId, userId) {
    try {
      const votesRef = doc(db, "roadmapVotes", roadmapId);
      const votesSnap = await getDoc(votesRef);

      let votesData = {
        votes: {},
        totalVotes: 0,
      };

      if (votesSnap.exists()) {
        const data = votesSnap.data();
        votesData = {
          votes: data.votes || {},
          totalVotes: data.totalVotes || 0,
        };
      }

      const hasVoted = !!votesData.votes[userId];

      if (hasVoted) {
        // Remove vote
        delete votesData.votes[userId];
      } else {
        // Add vote
        votesData.votes[userId] = new Date().toISOString();
      }

      // Update total count
      votesData.totalVotes = Object.keys(votesData.votes).length;

      // Save back to Firestore (use setDoc without merge to ensure clean write)
      await setDoc(votesRef, {
        roadmapId: roadmapId,
        votes: votesData.votes,
        totalVotes: votesData.totalVotes,
        lastUpdated: serverTimestamp(),
      });

      console.log(`✅ Vote toggled for roadmap ${roadmapId}:`, !hasVoted);
      return !hasVoted; // Return new vote state
    } catch (error) {
      console.error("❌ Error toggling roadmap vote in Firestore:", error);
      throw new Error("Failed to toggle roadmap vote: " + error.message);
    }
  }

  /**
   * Get vote count for a roadmap
   */
  static async getRoadmapVoteCount(roadmapId) {
    try {
      const votes = await this.getRoadmapVotes(roadmapId);

      if (!votes) return 0;

      return votes.totalVotes || 0;
    } catch (error) {
      console.error(
        "❌ Error getting roadmap vote count from Firestore:",
        error
      );
      return 0;
    }
  }

  /**
   * Check if a user has voted for a roadmap
   */
  static async hasUserVotedForRoadmap(roadmapId, userId) {
    try {
      const votes = await this.getRoadmapVotes(roadmapId);

      if (!votes || !votes.votes) return false;

      return !!votes.votes[userId];
    } catch (error) {
      console.error("❌ Error checking user vote in Firestore:", error);
      return false;
    }
  }
}

export default FirestorePersistence;
