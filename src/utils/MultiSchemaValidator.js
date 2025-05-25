/**
 * Multi-Schema Validation Utility
 * Validates different types of roadmap files against their respective schemas
 */

class MultiSchemaValidator {
  constructor(schemas) {
    this.schemas = schemas;
  }

  /**
   * Validates a roadmap skeleton file with strict schema checking
   * @param {Object} data - The skeleton data to validate
   * @returns {Object} - Validation result with isValid flag and errors array
   */
  validateSkeleton(data) {
    const errors = [];

    try {
      if (!data || typeof data !== "object") {
        errors.push("Skeleton data must be an object");
        return { isValid: false, errors };
      }

      const schema = this.schemas.skeleton;
      if (!schema) {
        errors.push("Skeleton schema not available");
        return { isValid: false, errors };
      }

      // STRICT CHECK: Ensure this is actually a skeleton file, not a task file
      if (data.tasks && Array.isArray(data.tasks)) {
        errors.push(
          "This appears to be a task file, not a skeleton file. Please upload this file in the task files section."
        );
        return { isValid: false, errors };
      }

      // STRICT CHECK: Skeleton files must have skeleton-specific properties
      if (!data.roadmap_title && !data.project_title) {
        errors.push(
          "Skeleton file must contain either roadmap_title or project_title"
        );
      }

      if (!data.phases || !Array.isArray(data.phases)) {
        errors.push("Skeleton file must contain a phases array");
        return { isValid: false, errors };
      }

      // Validate required properties
      const requiredProps = schema.required || [];
      for (const prop of requiredProps) {
        if (!(prop in data)) {
          errors.push(`Missing required property: ${prop}`);
        }
      }

      // Validate phases array structure
      data.phases.forEach((phase, index) => {
        this.validatePhaseStructure(phase, index, errors, "skeleton");
      });

      // Validate project level
      if (data.project_level && schema.properties?.project_level?.enum) {
        if (
          !schema.properties.project_level.enum.includes(data.project_level)
        ) {
          errors.push(`Invalid project_level: ${data.project_level}`);
        }
      }

      // Validate num_of_phases matches actual phases length
      if (data.num_of_phases && data.phases.length !== data.num_of_phases) {
        errors.push(
          `num_of_phases (${data.num_of_phases}) does not match actual phases count (${data.phases.length})`
        );
      }

      // Validate tags property
      if (data.tags !== undefined) {
        if (!Array.isArray(data.tags)) {
          errors.push("tags must be an array");
        } else {
          data.tags.forEach((tag, index) => {
            if (typeof tag !== "string") {
              errors.push(`Tag at index ${index} must be a string`);
            } else if (!tag.trim()) {
              errors.push(
                `Tag at index ${index} cannot be empty or whitespace only`
              );
            }
          });
        }
      }
    } catch (error) {
      errors.push(`Skeleton validation error: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates a task file with strict schema checking
   * @param {Object} data - The task data to validate
   * @returns {Object} - Validation result with isValid flag and errors array
   */
  validateTasks(data) {
    const errors = [];

    try {
      if (!data || typeof data !== "object") {
        errors.push("Task data must be an object");
        return { isValid: false, errors };
      }

      const schema = this.schemas.tasks;
      if (!schema) {
        errors.push("Task schema not available");
        return { isValid: false, errors };
      }

      // STRICT CHECK: Ensure this is actually a task file, not a skeleton file
      if (data.phases && Array.isArray(data.phases)) {
        errors.push(
          "This appears to be a skeleton file, not a task file. Please upload this file in the skeleton file section."
        );
        return { isValid: false, errors };
      }

      if (data.roadmap_title || data.project_title || data.num_of_phases) {
        errors.push(
          "This appears to be a skeleton file, not a task file. Please upload this file in the skeleton file section."
        );
        return { isValid: false, errors };
      }

      // STRICT CHECK: Task files must have tasks array
      if (!data.tasks || !Array.isArray(data.tasks)) {
        errors.push("Task file must contain a tasks array");
        return { isValid: false, errors };
      }

      if (data.tasks.length === 0) {
        errors.push("Task file must contain at least one task");
        return { isValid: false, errors };
      }

      // Validate required properties
      const requiredProps = schema.required || [];
      for (const prop of requiredProps) {
        if (!(prop in data)) {
          errors.push(`Missing required property: ${prop}`);
        }
      }

      // Validate each task in the tasks array
      data.tasks.forEach((task, index) => {
        this.validateTaskStructure(task, index, errors);
      });
    } catch (error) {
      errors.push(`Task validation error: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates the final merged roadmap
   * @param {Object} data - The complete roadmap data to validate
   * @returns {Object} - Validation result with isValid flag and errors array
   */
  validateFinalRoadmap(data) {
    const errors = [];

    try {
      if (!data || typeof data !== "object") {
        errors.push("Roadmap data must be an object");
        return { isValid: false, errors };
      }

      const schema = this.schemas.final;
      if (!schema) {
        errors.push("Final roadmap schema not available");
        return { isValid: false, errors };
      }

      // Validate required root properties
      const requiredProps = schema.required || [];
      for (const prop of requiredProps) {
        if (!(prop in data)) {
          errors.push(`Missing required property: ${prop}`);
        }
      }

      // Validate roadmap structure
      if (data.roadmap) {
        if (!data.roadmap.phases || !Array.isArray(data.roadmap.phases)) {
          errors.push("Roadmap must contain a phases array");
        } else {
          data.roadmap.phases.forEach((phase, index) => {
            this.validatePhaseStructure(phase, index, errors, "final");
          });
        }
      }
    } catch (error) {
      errors.push(`Final roadmap validation error: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates phase structure based on context
   */
  validatePhaseStructure(phase, index, errors, context = "skeleton") {
    if (!phase || typeof phase !== "object") {
      errors.push(`Phase ${index + 1} must be an object`);
      return;
    }

    // Common validations
    if (!phase.phase_id) {
      errors.push(`Phase ${index + 1} missing phase_id`);
    }

    if (!phase.phase_title) {
      errors.push(`Phase ${index + 1} missing phase_title`);
    }

    if (context === "skeleton") {
      if (typeof phase.phase_number !== "number") {
        errors.push(`Phase ${index + 1} missing or invalid phase_number`);
      }
      if (typeof phase.num_of_tasks !== "number") {
        errors.push(`Phase ${index + 1} missing or invalid num_of_tasks`);
      }
    }

    if (context === "final") {
      if (!phase.phase_tasks || !Array.isArray(phase.phase_tasks)) {
        errors.push(`Phase ${index + 1} missing phase_tasks array`);
      }
    }
  }

  /**
   * Validates task structure
   */
  validateTaskStructure(task, index, errors) {
    if (!task || typeof task !== "object") {
      errors.push(`Task ${index + 1} must be an object`);
      return;
    }

    // Required task properties
    const requiredTaskProps = [
      "phase_id",
      "task_id",
      "task_title",
      "task_summary",
    ];
    for (const prop of requiredTaskProps) {
      if (!task[prop]) {
        errors.push(`Task ${index + 1} missing ${prop}`);
      }
    }

    // Validate task difficulty
    if (task.task_difficulty) {
      const validDifficulties = [
        "very_easy",
        "easy",
        "normal",
        "difficult",
        "challenging",
      ];
      if (!validDifficulties.includes(task.task_difficulty)) {
        errors.push(
          `Task ${index + 1} has invalid difficulty: ${task.task_difficulty}`
        );
      }
    }

    // Validate task priority (handle both correct and typo versions)
    const priority = task.task_priority || task.task_priotity;
    if (priority) {
      const validPriorities = ["low", "mid", "high", "critical"];
      if (!validPriorities.includes(priority)) {
        errors.push(`Task ${index + 1} has invalid priority: ${priority}`);
      }
    }
  }

  /**
   * Validates multiple files at once
   * @param {Object} files - Object containing skeleton and task files
   * @returns {Object} - Combined validation results
   */
  validateAll(files) {
    const results = {
      skeleton: null,
      tasks: [],
      overall: { isValid: true, errors: [] },
    };

    // Validate skeleton
    if (files.skeleton) {
      results.skeleton = this.validateSkeleton(files.skeleton);
      if (!results.skeleton.isValid) {
        results.overall.isValid = false;
        results.overall.errors.push(
          ...results.skeleton.errors.map((err) => `Skeleton: ${err}`)
        );
      }
    } else {
      results.overall.isValid = false;
      results.overall.errors.push("No skeleton file provided");
    }

    // Validate task files
    if (files.taskFiles && Array.isArray(files.taskFiles)) {
      files.taskFiles.forEach((taskFile, index) => {
        const taskResult = this.validateTasks(taskFile);
        results.tasks.push(taskResult);
        if (!taskResult.isValid) {
          results.overall.isValid = false;
          results.overall.errors.push(
            ...taskResult.errors.map((err) => `Task file ${index + 1}: ${err}`)
          );
        }
      });
    } else {
      results.overall.isValid = false;
      results.overall.errors.push("No task files provided");
    }

    return results;
  }
}

export default MultiSchemaValidator;
