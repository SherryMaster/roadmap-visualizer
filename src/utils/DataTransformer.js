/**
 * Data Transformer Utility
 * Transforms schema-compliant data to UI-friendly format and vice versa
 */

class DataTransformer {
  /**
   * Transforms schema-compliant roadmap data to UI-friendly format
   * @param {Object} schemaData - Data following the JSON schema
   * @returns {Object} - UI-friendly data format
   */
  static transformToUI(schemaData) {
    if (!schemaData) return null;

    try {
      const transformed = {
        title: schemaData.title || "Untitled Roadmap",
        description: schemaData.description || "",
        tags: schemaData.tags || [],
        project_level: schemaData.project_level || "beginner",
        roadmap: [],
      };

      // Transform phases
      if (schemaData.roadmap && schemaData.roadmap.phases) {
        transformed.roadmap = schemaData.roadmap.phases.map((phase, index) =>
          this.transformPhase(phase, index + 1)
        );
      }

      return transformed;
    } catch (error) {
      console.error("Error transforming data to UI format:", error);
      return null;
    }
  }

  /**
   * Transforms a phase from schema format to UI format
   */
  static transformPhase(phase, phaseNumber) {
    return {
      phase_number: phaseNumber,
      phase_id: phase.phase_id,
      phase_title: phase.phase_title,
      phase_summary: phase.phase_summary,
      phase_details: phase.phase_details || [],
      phase_dependencies: phase.phase_dependencies || [],
      key_milestones: phase.key_milestones || [],
      success_indicators:
        phase.succes_indicators || phase.success_indicators || [],
      phase_tasks: (phase.phase_tasks || []).map((task, index) =>
        this.transformTask(task, index, phase.phase_id)
      ),
    };
  }

  /**
   * Transforms a task from schema format to UI format
   */
  static transformTask(task, taskIndex, phaseId) {
    const transformed = {
      task_index: taskIndex,
      task_id: task.task_id,
      task_title: task.task_title,
      task_summary: task.task_summary,
      task_dependencies: task.task_dependencies || [],
      task_tags: task.task_tags || [],
      task_priority: task.task_priority || "mid",
      phase_id: phaseId, // Add phase_id to each task
      // Preserve task_number from schema, fallback to taskIndex + 1 for backward compatibility
      task_number:
        task.task_number !== undefined ? task.task_number : taskIndex + 1,
    };

    // Transform task detail
    if (task.task_detail) {
      transformed.task_detail = this.transformTaskDetail(task.task_detail);
    }

    return transformed;
  }

  /**
   * Transforms task detail from schema format to UI format
   */
  static transformTaskDetail(detail) {
    const transformed = {
      code_blocks: detail.code_blocks || [],
      resource_links: this.transformResourceLinks(detail.resource_links || []),
    };

    // Handle explanation field - check if it's the new format with content and format
    if (detail.explanation) {
      if (
        typeof detail.explanation === "object" &&
        detail.explanation.content
      ) {
        // New format: explanation = {content: "...", format: "..."}
        transformed.explanation = {
          content: detail.explanation.content,
          format: detail.explanation.format || "plaintext",
        };
      } else if (typeof detail.explanation === "string") {
        // Legacy format: explanation is a string
        transformed.explanation = {
          content: detail.explanation,
          format: "plaintext",
        };
      } else {
        // Fallback
        transformed.explanation = {
          content: "",
          format: "plaintext",
        };
      }
    } else {
      // No explanation field
      transformed.explanation = {
        content: "",
        format: "plaintext",
      };
    }

    // Transform difficulty
    if (detail.difficulty) {
      transformed.difficulty = this.transformDifficulty(detail.difficulty);
    }

    // Transform estimated time
    if (detail.est_time) {
      transformed.est_time = this.transformEstimatedTime(detail.est_time);
    }

    return transformed;
  }

  /**
   * Transforms difficulty from schema format to UI format
   */
  static transformDifficulty(difficulty) {
    const levelMap = {
      very_easy: 1,
      easy: 2,
      normal: 3,
      difficult: 4,
      challenging: 5,
    };

    return {
      level: levelMap[difficulty.level] || 3,
      level_text: difficulty.level || "normal",
      reason: difficulty.reason_of_difficulty || "",
      prerequisites: difficulty.prerequisites_needed || [],
    };
  }

  /**
   * Transforms estimated time from schema format to UI format
   */
  static transformEstimatedTime(estTime) {
    const transformed = {};

    if (estTime.min_time) {
      transformed.min = {
        value: estTime.min_time.amount,
        unit: estTime.min_time.unit,
      };
    }

    if (estTime.max_time) {
      transformed.max = {
        value: estTime.max_time.amount,
        unit: estTime.max_time.unit,
      };
    }

    // For backward compatibility, set primary time to min_time
    if (transformed.min) {
      transformed.value = transformed.min.value;
      transformed.unit = transformed.min.unit;
    }

    transformed.factors = estTime.factors_affecting_time || [];

    return transformed;
  }

  /**
   * Transforms resource links from schema format to UI format
   */
  static transformResourceLinks(links) {
    return links.map((link) => ({
      display_text: link.display_text,
      link: link.url, // Map 'url' to 'link' for backward compatibility
      url: link.url,
      type: link.type,
      is_essential: link.is_essential,
    }));
  }

  /**
   * Transforms UI data back to schema-compliant format
   * @param {Object} uiData - UI-friendly data format
   * @returns {Object} - Schema-compliant data
   */
  static transformToSchema(uiData) {
    if (!uiData) return null;

    try {
      const transformed = {
        title: uiData.title || "Untitled Roadmap",
        description: uiData.description || "",
        tags: uiData.tags || [],
        project_level: uiData.project_level || "beginner",
        roadmap: {
          phases: [],
        },
      };

      // Transform phases back to schema format
      if (uiData.roadmap && Array.isArray(uiData.roadmap)) {
        transformed.roadmap.phases = uiData.roadmap.map((phase) =>
          this.transformPhaseToSchema(phase)
        );
      }

      return transformed;
    } catch (error) {
      console.error("Error transforming data to schema format:", error);
      return null;
    }
  }

  /**
   * Transforms a phase from UI format back to schema format
   */
  static transformPhaseToSchema(phase) {
    return {
      phase_id: phase.phase_id,
      phase_title: phase.phase_title,
      phase_summary: phase.phase_summary,
      phase_details: phase.phase_details || [],
      phase_dependencies: phase.phase_dependencies || [],
      key_milestones: phase.key_milestones || [],
      succes_indicators: phase.success_indicators || [],
      phase_tasks: (phase.phase_tasks || []).map((task) =>
        this.transformTaskToSchema(task)
      ),
    };
  }

  /**
   * Transforms a task from UI format back to schema format
   */
  static transformTaskToSchema(task) {
    const transformed = {
      task_id: task.task_id,
      task_title: task.task_title,
      task_summary: task.task_summary,
      task_dependencies: task.task_dependencies || [],
      task_tags: task.task_tags || [],
      task_priority: task.task_priority || "mid",
      // Include task_number in schema transformation
      task_number: task.task_number || task.task_index + 1,
    };

    // Transform task detail back to schema format
    if (task.task_detail) {
      transformed.task_detail = this.transformTaskDetailToSchema(
        task.task_detail
      );
    }

    return transformed;
  }

  /**
   * Transforms task detail from UI format back to schema format
   */
  static transformTaskDetailToSchema(detail) {
    const transformed = {
      explanation: this.transformExplanationToSchema(detail),
      code_blocks: detail.code_blocks || [],
      resource_links: this.transformResourceLinksToSchema(
        detail.resource_links || []
      ),
    };

    // Transform difficulty back to schema format
    if (detail.difficulty) {
      transformed.difficulty = this.transformDifficultyToSchema(
        detail.difficulty
      );
    }

    // Transform estimated time back to schema format
    if (detail.est_time) {
      transformed.est_time = this.transformEstimatedTimeToSchema(
        detail.est_time
      );
    }

    return transformed;
  }

  /**
   * Transforms explanation content to schema format with format support
   */
  static transformExplanationToSchema(detail) {
    // Handle new format with explanation object containing content and format
    if (detail.explanation && typeof detail.explanation === "object") {
      return {
        content: detail.explanation.content || "",
        format: detail.explanation.format || "plaintext",
      };
    }

    // Handle legacy formats
    const content = detail.detail || detail.explanation || "";
    return {
      content: content,
      format: "plaintext",
    };
  }

  /**
   * Transforms difficulty from UI format back to schema format
   */
  static transformDifficultyToSchema(difficulty) {
    const levelMap = {
      1: "very_easy",
      2: "easy",
      3: "normal",
      4: "difficult",
      5: "challenging",
    };

    return {
      level: difficulty.level_text || levelMap[difficulty.level] || "normal",
      reason_of_difficulty: difficulty.reason || "",
      prerequisites_needed: difficulty.prerequisites || [],
    };
  }

  /**
   * Transforms estimated time from UI format back to schema format
   */
  static transformEstimatedTimeToSchema(estTime) {
    const transformed = {
      factors_affecting_time: estTime.factors || [],
    };

    if (estTime.min || (estTime.value && estTime.unit)) {
      transformed.min_time = {
        amount: estTime.min?.value || estTime.value,
        unit: estTime.min?.unit || estTime.unit,
      };
    }

    if (estTime.max) {
      transformed.max_time = {
        amount: estTime.max.value,
        unit: estTime.max.unit,
      };
    }

    return transformed;
  }

  /**
   * Transforms resource links from UI format back to schema format
   */
  static transformResourceLinksToSchema(links) {
    return links.map((link) => ({
      display_text: link.display_text,
      url: link.url || link.link, // Handle both 'url' and 'link' properties
      type: link.type,
      is_essential: link.is_essential,
    }));
  }

  /**
   * Validates that data can be safely transformed
   */
  static canTransform(data) {
    if (!data || typeof data !== "object") return false;

    // Check for basic required structure
    return data.title !== undefined || data.roadmap !== undefined;
  }
}

export default DataTransformer;
