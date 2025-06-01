/**
 * Roadmap Persistence Utility
 * Manages localStorage operations for roadmap data, metadata, and progress tracking
 */

class RoadmapPersistence {
  static STORAGE_KEYS = {
    ROADMAPS: "roadmap-visualizer-roadmaps",
    CURRENT_ROADMAP: "roadmap-visualizer-current",
    ROADMAP_METADATA: "roadmap-visualizer-metadata",
    APP_STATE: "roadmap-visualizer-app-state",
  };

  /**
   * Generate a unique ID for a roadmap based on title and timestamp
   */
  static generateRoadmapId(title) {
    const timestamp = Date.now();
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    return `${cleanTitle}-${timestamp}`;
  }

  /**
   * Save a roadmap with metadata
   */
  static saveRoadmap(roadmapData, originalData = null) {
    try {
      const roadmapId = this.generateRoadmapId(roadmapData.title);
      const timestamp = new Date().toISOString();

      // Save the roadmap data
      const roadmapKey = `roadmap-data-${roadmapId}`;
      localStorage.setItem(
        roadmapKey,
        JSON.stringify({
          id: roadmapId,
          data: roadmapData,
          originalData: originalData || roadmapData,
          savedAt: timestamp,
          lastAccessed: timestamp,
        })
      );

      // Update roadmap metadata list
      const metadata = {
        id: roadmapId,
        title: roadmapData.title,
        description: roadmapData.description || "",
        project_level: roadmapData.project_level || "beginner",
        tags: roadmapData.tags || [],
        uploadDate: timestamp,
        lastAccessed: timestamp,
        totalPhases: this.calculateTotalPhases(roadmapData),
        totalTasks: this.calculateTotalTasks(roadmapData),
        progressPercentage: 0,
      };

      this.updateRoadmapMetadata(metadata);
      this.setCurrentRoadmap(roadmapId);

      return roadmapId;
    } catch (error) {
      console.error("Error saving roadmap:", error);
      throw new Error("Failed to save roadmap to storage");
    }
  }

  /**
   * Load a roadmap by ID
   */
  static loadRoadmap(roadmapId) {
    try {
      const roadmapKey = `roadmap-data-${roadmapId}`;
      const stored = localStorage.getItem(roadmapKey);

      if (!stored) {
        return null;
      }

      const roadmapInfo = JSON.parse(stored);

      // Update last accessed time
      roadmapInfo.lastAccessed = new Date().toISOString();
      localStorage.setItem(roadmapKey, JSON.stringify(roadmapInfo));

      // Update metadata
      this.updateLastAccessed(roadmapId);
      this.setCurrentRoadmap(roadmapId);

      return roadmapInfo;
    } catch (error) {
      console.error("Error loading roadmap:", error);
      return null;
    }
  }

  /**
   * Update existing roadmap data in place
   */
  static updateRoadmapData(roadmapId, updatedData) {
    try {
      const roadmapKey = `roadmap-data-${roadmapId}`;
      const stored = localStorage.getItem(roadmapKey);

      if (!stored) {
        throw new Error("Roadmap not found");
      }

      const roadmapInfo = JSON.parse(stored);
      const timestamp = new Date().toISOString();

      // Update the roadmap data while preserving original data and metadata
      const updatedRoadmapInfo = {
        ...roadmapInfo,
        data: updatedData,
        lastAccessed: timestamp,
        lastModified: timestamp,
      };

      // Save updated roadmap data
      localStorage.setItem(roadmapKey, JSON.stringify(updatedRoadmapInfo));

      // Update metadata with new counts
      const metadata = {
        id: roadmapId,
        title: updatedData.title,
        description: updatedData.description || "",
        project_level: updatedData.project_level || "beginner",
        tags: updatedData.tags || [],
        lastAccessed: timestamp,
        totalPhases: this.calculateTotalPhases(updatedData),
        totalTasks: this.calculateTotalTasks(updatedData),
      };

      this.updateRoadmapMetadata(metadata);

      return true;
    } catch (error) {
      console.error("Error updating roadmap data:", error);
      return false;
    }
  }

  /**
   * Get all roadmap metadata
   */
  static getAllRoadmapMetadata() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.ROADMAP_METADATA);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading roadmap metadata:", error);
      return [];
    }
  }

  /**
   * Update roadmap metadata list
   */
  static updateRoadmapMetadata(metadata) {
    try {
      const allMetadata = this.getAllRoadmapMetadata();
      const existingIndex = allMetadata.findIndex((m) => m.id === metadata.id);

      if (existingIndex >= 0) {
        allMetadata[existingIndex] = {
          ...allMetadata[existingIndex],
          ...metadata,
        };
      } else {
        allMetadata.push(metadata);
      }

      // Sort by last accessed (most recent first)
      allMetadata.sort(
        (a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)
      );

      localStorage.setItem(
        this.STORAGE_KEYS.ROADMAP_METADATA,
        JSON.stringify(allMetadata)
      );
    } catch (error) {
      console.error("Error updating roadmap metadata:", error);
    }
  }

  /**
   * Update progress percentage for a roadmap
   */
  static updateRoadmapProgress(roadmapId, progressPercentage) {
    try {
      const allMetadata = this.getAllRoadmapMetadata();
      const metadata = allMetadata.find((m) => m.id === roadmapId);

      if (metadata) {
        metadata.progressPercentage = progressPercentage;
        metadata.lastAccessed = new Date().toISOString();
        this.updateRoadmapMetadata(metadata);
      }
    } catch (error) {
      console.error("Error updating roadmap progress:", error);
    }
  }

  /**
   * Recalculate and update metadata for existing roadmaps
   * This fixes any incorrect phase/task counts in stored metadata
   */
  static recalculateAllMetadata() {
    try {
      const allMetadata = this.getAllRoadmapMetadata();
      let updated = false;

      allMetadata.forEach((metadata) => {
        // Use direct localStorage access to avoid circular calls
        const roadmapKey = `roadmap-data-${metadata.id}`;
        const stored = localStorage.getItem(roadmapKey);

        if (stored) {
          try {
            const roadmapInfo = JSON.parse(stored);
            if (roadmapInfo && roadmapInfo.data) {
              const correctPhases = this.calculateTotalPhases(roadmapInfo.data);
              const correctTasks = this.calculateTotalTasks(roadmapInfo.data);

              if (
                metadata.totalPhases !== correctPhases ||
                metadata.totalTasks !== correctTasks
              ) {
                metadata.totalPhases = correctPhases;
                metadata.totalTasks = correctTasks;
                updated = true;
              }
            }
          } catch (parseError) {
            console.error(
              "Error parsing roadmap data for",
              metadata.id,
              parseError
            );
          }
        }
      });

      if (updated) {
        localStorage.setItem(
          this.STORAGE_KEYS.ROADMAP_METADATA,
          JSON.stringify(allMetadata)
        );
      }

      return updated;
    } catch (error) {
      console.error("Error recalculating roadmap metadata:", error);
      return false;
    }
  }

  /**
   * Update last accessed time for a roadmap
   */
  static updateLastAccessed(roadmapId) {
    try {
      const allMetadata = this.getAllRoadmapMetadata();
      const metadata = allMetadata.find((m) => m.id === roadmapId);

      if (metadata) {
        metadata.lastAccessed = new Date().toISOString();
        this.updateRoadmapMetadata(metadata);
      }
    } catch (error) {
      console.error("Error updating last accessed time:", error);
    }
  }

  /**
   * Delete a roadmap and its associated data
   */
  static deleteRoadmap(roadmapId) {
    try {
      // Remove roadmap data
      const roadmapKey = `roadmap-data-${roadmapId}`;
      localStorage.removeItem(roadmapKey);

      // Remove task completion data
      const completionKey = `completed-tasks-roadmap-${roadmapId}`;
      localStorage.removeItem(completionKey);

      // Remove from metadata
      const allMetadata = this.getAllRoadmapMetadata();
      const filteredMetadata = allMetadata.filter((m) => m.id !== roadmapId);
      localStorage.setItem(
        this.STORAGE_KEYS.ROADMAP_METADATA,
        JSON.stringify(filteredMetadata)
      );

      // Clear current roadmap if it was the deleted one
      const currentRoadmap = this.getCurrentRoadmap();
      if (currentRoadmap === roadmapId) {
        this.clearCurrentRoadmap();
      }

      return true;
    } catch (error) {
      console.error("Error deleting roadmap:", error);
      return false;
    }
  }

  /**
   * Set current active roadmap
   */
  static setCurrentRoadmap(roadmapId) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_ROADMAP, roadmapId);
    } catch (error) {
      console.error("Error setting current roadmap:", error);
    }
  }

  /**
   * Get current active roadmap ID
   */
  static getCurrentRoadmap() {
    try {
      return localStorage.getItem(this.STORAGE_KEYS.CURRENT_ROADMAP);
    } catch (error) {
      console.error("Error getting current roadmap:", error);
      return null;
    }
  }

  /**
   * Clear current roadmap
   */
  static clearCurrentRoadmap() {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_ROADMAP);
    } catch (error) {
      console.error("Error clearing current roadmap:", error);
    }
  }

  /**
   * Save application state
   */
  static saveAppState(state) {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.APP_STATE,
        JSON.stringify({
          ...state,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Error saving app state:", error);
    }
  }

  /**
   * Load application state
   */
  static loadAppState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.APP_STATE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading app state:", error);
      return null;
    }
  }

  /**
   * Calculate total phases in a roadmap
   */
  static calculateTotalPhases(roadmapData) {
    if (!roadmapData || !roadmapData.roadmap) {
      return 0;
    }

    // Handle both assembled roadmap structure (roadmap.phases) and direct array structure
    const phases = roadmapData.roadmap.phases || roadmapData.roadmap;

    if (!Array.isArray(phases)) {
      return 0;
    }

    return phases.length;
  }

  /**
   * Calculate total tasks in a roadmap
   */
  static calculateTotalTasks(roadmapData) {
    if (!roadmapData || !roadmapData.roadmap) {
      return 0;
    }

    // Handle both assembled roadmap structure (roadmap.phases) and direct array structure
    const phases = roadmapData.roadmap.phases || roadmapData.roadmap;

    if (!Array.isArray(phases)) {
      return 0;
    }

    return phases.reduce((total, phase) => {
      return total + (phase.phase_tasks ? phase.phase_tasks.length : 0);
    }, 0);
  }

  /**
   * Get roadmap statistics
   */
  static getRoadmapStats() {
    try {
      const allMetadata = this.getAllRoadmapMetadata();
      const totalRoadmaps = allMetadata.length;
      const totalTasks = allMetadata.reduce(
        (sum, roadmap) => sum + roadmap.totalTasks,
        0
      );
      const averageProgress =
        totalRoadmaps > 0
          ? allMetadata.reduce(
              (sum, roadmap) => sum + roadmap.progressPercentage,
              0
            ) / totalRoadmaps
          : 0;

      return {
        totalRoadmaps,
        totalTasks,
        averageProgress: Math.round(averageProgress),
      };
    } catch (error) {
      console.error("Error calculating roadmap stats:", error);
      return { totalRoadmaps: 0, totalTasks: 0, averageProgress: 0 };
    }
  }

  /**
   * Export roadmap data for backup
   */
  static exportRoadmap(roadmapId) {
    try {
      const roadmapInfo = this.loadRoadmap(roadmapId);
      if (!roadmapInfo) {
        throw new Error("Roadmap not found");
      }

      const exportData = {
        roadmap: roadmapInfo.originalData || roadmapInfo.data,
        metadata: this.getAllRoadmapMetadata().find((m) => m.id === roadmapId),
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      return exportData;
    } catch (error) {
      console.error("Error exporting roadmap:", error);
      throw error;
    }
  }

  /**
   * Clear all stored data (for reset functionality)
   */
  static clearAllData() {
    try {
      const allMetadata = this.getAllRoadmapMetadata();

      // Remove all roadmap data
      allMetadata.forEach((metadata) => {
        const roadmapKey = `roadmap-data-${metadata.id}`;
        const completionKey = `completed-tasks-roadmap-${metadata.id}`;
        localStorage.removeItem(roadmapKey);
        localStorage.removeItem(completionKey);
      });

      // Clear metadata and app state
      localStorage.removeItem(this.STORAGE_KEYS.ROADMAP_METADATA);
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_ROADMAP);
      localStorage.removeItem(this.STORAGE_KEYS.APP_STATE);

      return true;
    } catch (error) {
      console.error("Error clearing all data:", error);
      return false;
    }
  }
}

export default RoadmapPersistence;
