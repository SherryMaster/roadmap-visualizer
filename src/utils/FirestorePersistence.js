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

      console.log("💾 Saving roadmap debug:", {
        roadmapId,
        originalPhases: roadmapData.roadmap?.phases?.length || 0,
        outlinePhases: outline.roadmap?.phases?.length || 0,
        phaseTasksCount: phaseTasks.length,
        totalTasks: phaseTasks.reduce(
          (sum, pt) => sum + pt.phase_tasks.length,
          0
        ),
        samplePhase: roadmapData.roadmap?.phases?.[0]
          ? {
              phase_id: roadmapData.roadmap.phases[0].phase_id,
              phase_title: roadmapData.roadmap.phases[0].phase_title,
              taskCount: roadmapData.roadmap.phases[0].phase_tasks?.length || 0,
            }
          : null,
        sampleOutlinePhase: outline.roadmap?.phases?.[0]
          ? {
              phase_id: outline.roadmap.phases[0].phase_id,
              phase_title: outline.roadmap.phases[0].phase_title,
              task_count: outline.roadmap.phases[0].task_count,
            }
          : null,
      });

      // Prepare roadmap outline document (without task details)
      const roadmapDoc = {
        id: roadmapId,
        userId: userId,
        outline: outline,
        // Note: originalData removed to avoid size limits - can be reconstructed from split documents
        isPublic: false, // Default to private
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

      console.log("📊 Metadata calculation debug:", {
        totalPhases,
        totalTasks,
        roadmapDataStructure: {
          hasRoadmap: !!roadmapData.roadmap,
          hasPhases: !!roadmapData.roadmap?.phases,
          phasesLength: roadmapData.roadmap?.phases?.length || 0,
        },
      });

      const metadataDoc = {
        id: roadmapId,
        userId: userId,
        title: roadmapData.title,
        description: roadmapData.description || "",
        projectLevel: roadmapData.project_level || "beginner",
        tags: roadmapData.tags || [],
        isPublic: false,
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

      console.log("📊 Loading roadmap debug:", {
        roadmapId,
        hasOutline: !!roadmapData.outline,
        phaseTasksCount: phaseTasksSnap.size,
        outlinePhases: roadmapData.outline?.roadmap?.phases?.length || 0,
        phaseTasksDocs: phaseTasksSnap.docs.map((doc) => ({
          id: doc.id,
          phaseId: doc.data().phaseId,
          tasksCount: doc.data().tasks?.length || 0,
        })),
        sampleOutlinePhase: roadmapData.outline?.roadmap?.phases?.[0]
          ? {
              phase_id: roadmapData.outline.roadmap.phases[0].phase_id,
              phase_title: roadmapData.outline.roadmap.phases[0].phase_title,
              task_count: roadmapData.outline.roadmap.phases[0].task_count,
            }
          : null,
      });

      // Reconstruct full roadmap data
      const fullRoadmapData = this.reconstructRoadmapData(
        roadmapData,
        phaseTasksSnap
      );

      // Update last accessed time if user owns the roadmap
      if (userId && roadmapData.userId === userId) {
        await this.updateLastAccessed(roadmapId);
      }

      return fullRoadmapData;
    } catch (error) {
      console.error("❌ Error loading roadmap from Firestore:", error);
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
   * Get public roadmaps for community section
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

      return roadmaps;
    } catch (error) {
      console.error("❌ Error getting public roadmaps:", error);
      throw new Error("Failed to load public roadmaps: " + error.message);
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
      console.log("🗑️ Starting roadmap deletion:", {
        roadmapId,
        userId,
      });

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

      console.log("📋 Found documents to delete:", {
        roadmapExists: roadmapSnap.exists(),
        phaseTasksCount: phaseTasksSnap.size,
        phaseTasksDocs: phaseTasksSnap.docs.map((doc) => ({
          id: doc.id,
          phaseId: doc.data().phaseId,
        })),
      });

      // Use batch write for atomic deletion
      const batch = writeBatch(db);

      // Delete roadmap document
      batch.delete(roadmapRef);
      console.log("🗑️ Queued roadmap document for deletion");

      // Delete metadata document
      const metadataRef = doc(db, "roadmapMetadata", roadmapId);
      batch.delete(metadataRef);
      console.log("🗑️ Queued metadata document for deletion");

      // Delete all phase tasks documents
      phaseTasksSnap.forEach((doc) => {
        batch.delete(doc.ref);
        console.log(`🗑️ Queued phase tasks document for deletion: ${doc.id}`);
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
      console.log("🗑️ Queued task completions for deletion");

      // Execute all deletions atomically
      await batch.commit();

      console.log("✅ Roadmap deletion completed successfully:", {
        roadmapId,
        deletedDocuments: {
          roadmap: 1,
          metadata: 1,
          phaseTasks: phaseTasksSnap.size,
          taskCompletions: 1,
        },
        totalDeleted: 3 + phaseTasksSnap.size,
      });

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
    console.log("🔄 Starting roadmap reconstruction:", {
      hasOutline: !!roadmapData.outline,
      outlinePhases: roadmapData.outline?.roadmap?.phases?.length || 0,
      phaseTasksDocsCount: phaseTasksSnap.size,
    });

    // Get phase tasks data
    const phaseTasksMap = new Map();
    phaseTasksSnap.forEach((doc) => {
      const data = doc.data();
      console.log(`📋 Processing phase tasks document:`, {
        docId: doc.id,
        phaseId: data.phaseId,
        tasksCount: data.tasks?.length || 0,
        sampleTask: data.tasks?.[0]
          ? {
              task_id: data.tasks[0].task_id,
              task_title: data.tasks[0].task_title,
            }
          : null,
      });

      // Use the correct field name - we store as 'tasks' not 'data.tasks'
      phaseTasksMap.set(data.phaseId, data.tasks || []);
    });

    console.log("🗺️ Phase tasks map created:", {
      mapSize: phaseTasksMap.size,
      phaseIds: Array.from(phaseTasksMap.keys()),
      taskCounts: Array.from(phaseTasksMap.entries()).map(
        ([phaseId, tasks]) => ({
          phaseId,
          taskCount: tasks.length,
        })
      ),
    });

    // Reconstruct full roadmap - need to determine output format
    // The RoadmapVisualizer expects either roadmap.phases OR roadmap as direct array
    const reconstructedPhases = roadmapData.outline.roadmap.phases.map(
      (phase) => {
        // Remove task_count field and add actual tasks
        const { task_count, ...phaseWithoutCount } = phase;
        const phaseTasks = phaseTasksMap.get(phase.phase_id) || [];

        console.log(`🔗 Reconstructing phase ${phase.phase_id}:`, {
          phase_title: phase.phase_title,
          originalTaskCount: task_count,
          foundTasksCount: phaseTasks.length,
          hasTasksInMap: phaseTasksMap.has(phase.phase_id),
        });

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

    // Calculate totals using the direct array format
    const totalReconstructedTasks = Array.isArray(fullData.roadmap)
      ? fullData.roadmap.reduce(
          (sum, phase) => sum + phase.phase_tasks.length,
          0
        )
      : 0;

    console.log("✅ Roadmap reconstruction complete:", {
      phasesCount: Array.isArray(fullData.roadmap)
        ? fullData.roadmap.length
        : 0,
      totalTasks: totalReconstructedTasks,
      phaseTasksMapSize: phaseTasksMap.size,
      roadmapFormat: Array.isArray(fullData.roadmap)
        ? "direct array"
        : "object with phases",
      reconstructedPhases: Array.isArray(fullData.roadmap)
        ? fullData.roadmap.map((phase) => ({
            phase_id: phase.phase_id,
            phase_title: phase.phase_title,
            taskCount: phase.phase_tasks.length,
          }))
        : [],
    });

    return {
      id: roadmapData.id,
      data: fullData,
      originalData: fullData, // Use reconstructed data as originalData since we don't store it separately
      isPublic: roadmapData.isPublic,
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
      (querySnapshot) => {
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

        callback(roadmaps);
      },
      (error) => {
        console.error("❌ Error in public roadmaps subscription:", error);
        callback([]);
      }
    );
  }
}

export default FirestorePersistence;
