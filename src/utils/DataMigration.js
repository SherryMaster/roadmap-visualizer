/**
 * Data Migration Utility
 * Migrates roadmap data from localStorage to Firestore when users first authenticate
 */

import RoadmapPersistence from "./RoadmapPersistence";
import FirestorePersistence from "./FirestorePersistence";

class DataMigration {
  static MIGRATION_KEY = "roadmap-visualizer-migration-status";
  static MIGRATION_BACKUP_KEY = "roadmap-visualizer-migration-backup";

  /**
   * Check if migration has been completed for this user
   */
  static isMigrationCompleted(userId) {
    try {
      const migrationStatus = localStorage.getItem(this.MIGRATION_KEY);
      if (!migrationStatus) return false;

      const status = JSON.parse(migrationStatus);
      return status.completed && status.userId === userId;
    } catch (error) {
      console.error("Error checking migration status:", error);
      return false;
    }
  }

  /**
   * Mark migration as completed for this user
   */
  static markMigrationCompleted(userId, migratedCount = 0) {
    try {
      const migrationStatus = {
        completed: true,
        userId: userId,
        completedAt: new Date().toISOString(),
        migratedRoadmapsCount: migratedCount,
      };

      localStorage.setItem(this.MIGRATION_KEY, JSON.stringify(migrationStatus));
      console.log(`✅ Migration marked as completed for user ${userId}`);
    } catch (error) {
      console.error("Error marking migration as completed:", error);
    }
  }

  /**
   * Create backup of localStorage data before migration
   */
  static createMigrationBackup() {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        roadmaps: RoadmapPersistence.getAllRoadmapMetadata(),
        currentRoadmap: RoadmapPersistence.getCurrentRoadmap(),
        appState: RoadmapPersistence.loadAppState(),
      };

      // Store individual roadmap data
      backup.roadmapData = {};
      backup.roadmaps.forEach((metadata) => {
        const roadmapData = RoadmapPersistence.loadRoadmap(metadata.id);
        if (roadmapData) {
          backup.roadmapData[metadata.id] = roadmapData;
        }
      });

      localStorage.setItem(this.MIGRATION_BACKUP_KEY, JSON.stringify(backup));
      console.log("✅ Migration backup created");
      return backup;
    } catch (error) {
      console.error("❌ Error creating migration backup:", error);
      throw new Error("Failed to create migration backup");
    }
  }

  /**
   * Migrate all localStorage roadmaps to Firestore
   */
  static async migrateToFirestore(userId) {
    if (!userId) {
      throw new Error("User ID is required for migration");
    }

    // Check if migration already completed
    if (this.isMigrationCompleted(userId)) {
      console.log("✅ Migration already completed for this user");
      return { success: true, migratedCount: 0, message: "Already migrated" };
    }

    try {
      console.log("🔄 Starting data migration to Firestore...");

      // Create backup before migration
      const backup = this.createMigrationBackup();

      // Get all roadmaps from localStorage
      const localRoadmaps = RoadmapPersistence.getAllRoadmapMetadata();

      if (localRoadmaps.length === 0) {
        console.log("✅ No roadmaps to migrate");
        this.markMigrationCompleted(userId, 0);
        return {
          success: true,
          migratedCount: 0,
          message: "No data to migrate",
        };
      }

      console.log(`📦 Found ${localRoadmaps.length} roadmaps to migrate`);

      const migrationResults = [];
      let successCount = 0;
      let errorCount = 0;

      // Migrate each roadmap
      for (const metadata of localRoadmaps) {
        try {
          console.log(
            `🔄 Migrating roadmap: ${metadata.title} (${metadata.id})`
          );

          // Load full roadmap data
          const roadmapInfo = RoadmapPersistence.loadRoadmap(metadata.id);

          if (!roadmapInfo) {
            console.warn(`⚠️ Could not load roadmap data for ${metadata.id}`);
            errorCount++;
            continue;
          }

          // Save to Firestore
          const firestoreId = await FirestorePersistence.saveRoadmap(
            roadmapInfo.data,
            userId
          );

          // Migrate task completion data if exists
          await this.migrateTaskCompletions(metadata.id, firestoreId, userId);

          migrationResults.push({
            originalId: metadata.id,
            firestoreId: firestoreId,
            title: metadata.title,
            success: true,
          });

          successCount++;
          console.log(`✅ Successfully migrated: ${metadata.title}`);
        } catch (error) {
          console.error(`❌ Failed to migrate roadmap ${metadata.id}:`, error);
          migrationResults.push({
            originalId: metadata.id,
            title: metadata.title,
            success: false,
            error: error.message,
          });
          errorCount++;
        }
      }

      // Mark migration as completed
      this.markMigrationCompleted(userId, successCount);

      // Store migration results
      const migrationSummary = {
        userId: userId,
        completedAt: new Date().toISOString(),
        totalRoadmaps: localRoadmaps.length,
        successCount: successCount,
        errorCount: errorCount,
        results: migrationResults,
      };

      localStorage.setItem(
        "roadmap-visualizer-migration-results",
        JSON.stringify(migrationSummary)
      );

      console.log(
        `✅ Migration completed: ${successCount} success, ${errorCount} errors`
      );

      return {
        success: true,
        migratedCount: successCount,
        errorCount: errorCount,
        results: migrationResults,
        message: `Successfully migrated ${successCount} of ${localRoadmaps.length} roadmaps`,
      };
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw new Error("Migration failed: " + error.message);
    }
  }

  /**
   * Migrate task completion data for a specific roadmap
   */
  static async migrateTaskCompletions(
    originalRoadmapId,
    firestoreRoadmapId,
    userId
  ) {
    try {
      // Get completion data from localStorage
      const completionKey = `completed-tasks-roadmap-${originalRoadmapId}`;
      const completionData = localStorage.getItem(completionKey);

      if (!completionData) {
        return; // No completion data to migrate
      }

      const completions = JSON.parse(completionData);

      if (Object.keys(completions).length === 0) {
        return; // No completed tasks
      }

      // Save to Firestore task completions collection
      const { doc, setDoc } = await import("firebase/firestore");
      const { db } = await import("../config/firebase");

      const completionRef = doc(
        db,
        "taskCompletions",
        userId,
        "roadmaps",
        firestoreRoadmapId
      );
      await setDoc(completionRef, {
        completedTasks: completions,
        migratedFrom: originalRoadmapId,
        migratedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      console.log(
        `✅ Migrated task completions for roadmap ${firestoreRoadmapId}`
      );
    } catch (error) {
      console.error("❌ Error migrating task completions:", error);
      // Don't throw error - completion data migration is not critical
    }
  }

  /**
   * Clean up localStorage data after successful migration
   */
  static async cleanupLocalStorageData(userId, confirmCleanup = false) {
    if (!confirmCleanup) {
      console.log("⚠️ Cleanup skipped - confirmation required");
      return false;
    }

    if (!this.isMigrationCompleted(userId)) {
      throw new Error("Cannot cleanup - migration not completed");
    }

    try {
      console.log("🧹 Cleaning up localStorage data...");

      // Get all roadmap metadata before cleanup
      const roadmaps = RoadmapPersistence.getAllRoadmapMetadata();

      // Remove individual roadmap data
      roadmaps.forEach((metadata) => {
        const roadmapKey = `roadmap-data-${metadata.id}`;
        const completionKey = `completed-tasks-roadmap-${metadata.id}`;
        localStorage.removeItem(roadmapKey);
        localStorage.removeItem(completionKey);
      });

      // Remove main storage keys
      localStorage.removeItem(RoadmapPersistence.STORAGE_KEYS.ROADMAP_METADATA);
      localStorage.removeItem(RoadmapPersistence.STORAGE_KEYS.CURRENT_ROADMAP);
      localStorage.removeItem(RoadmapPersistence.STORAGE_KEYS.APP_STATE);

      console.log("✅ localStorage cleanup completed");
      return true;
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
      throw new Error("Cleanup failed: " + error.message);
    }
  }

  /**
   * Restore data from migration backup (emergency recovery)
   */
  static restoreFromBackup() {
    try {
      const backupData = localStorage.getItem(this.MIGRATION_BACKUP_KEY);

      if (!backupData) {
        throw new Error("No backup data found");
      }

      const backup = JSON.parse(backupData);

      console.log("🔄 Restoring from backup...");

      // Restore roadmap metadata
      if (backup.roadmaps) {
        localStorage.setItem(
          RoadmapPersistence.STORAGE_KEYS.ROADMAP_METADATA,
          JSON.stringify(backup.roadmaps)
        );
      }

      // Restore individual roadmap data
      if (backup.roadmapData) {
        Object.entries(backup.roadmapData).forEach(([roadmapId, data]) => {
          const roadmapKey = `roadmap-data-${roadmapId}`;
          localStorage.setItem(roadmapKey, JSON.stringify(data));
        });
      }

      // Restore current roadmap
      if (backup.currentRoadmap) {
        localStorage.setItem(
          RoadmapPersistence.STORAGE_KEYS.CURRENT_ROADMAP,
          backup.currentRoadmap
        );
      }

      // Restore app state
      if (backup.appState) {
        localStorage.setItem(
          RoadmapPersistence.STORAGE_KEYS.APP_STATE,
          JSON.stringify(backup.appState)
        );
      }

      // Reset migration status
      localStorage.removeItem(this.MIGRATION_KEY);

      console.log("✅ Data restored from backup");
      return true;
    } catch (error) {
      console.error("❌ Error restoring from backup:", error);
      throw new Error("Restore failed: " + error.message);
    }
  }

  /**
   * Get migration status and results
   */
  static getMigrationStatus() {
    try {
      const status = localStorage.getItem(this.MIGRATION_KEY);
      const results = localStorage.getItem(
        "roadmap-visualizer-migration-results"
      );

      return {
        status: status ? JSON.parse(status) : null,
        results: results ? JSON.parse(results) : null,
      };
    } catch (error) {
      console.error("Error getting migration status:", error);
      return { status: null, results: null };
    }
  }
}

export default DataMigration;
