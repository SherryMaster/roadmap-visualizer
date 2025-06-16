/**
 * Roadmap Editor Utility
 * Core operations for editing roadmaps with validation and dependency management
 */

import MultiSchemaValidator from "./MultiSchemaValidator";
import DataTransformer from "./DataTransformer";
import skeletonTasksSchema from "../data/skeleton_tasks_schema.json";
import finalSchema from "../data/schema.json";

class RoadmapEditor {
  /**
   * Add a task to a specific phase (overrides existing tasks with same ID)
   * @param {Object} roadmap - Current roadmap data
   * @param {string} phaseId - Target phase ID
   * @param {Object} taskData - Task data to add
   * @param {number} position - Optional position to insert at
   * @returns {Object} - Updated roadmap with override info or null if failed
   */
  static addTask(roadmap, phaseId, taskData, position = null) {
    try {
      const newRoadmap = JSON.parse(JSON.stringify(roadmap));
      const phases = newRoadmap.roadmap.phases || newRoadmap.roadmap;

      const targetPhase = phases.find((phase) => phase.phase_id === phaseId);
      if (!targetPhase) {
        throw new Error(`Phase ${phaseId} not found`);
      }

      // Validate task data
      const taskValidation = this.validateTask(taskData);
      if (!taskValidation.isValid) {
        throw new Error(
          `Invalid task data: ${taskValidation.errors.join(", ")}`
        );
      }

      // Check if task ID already exists and override if it does
      const existingTaskIndex = targetPhase.phase_tasks.findIndex(
        (task) => task.task_id === taskData.task_id
      );

      let isOverride = false;
      if (existingTaskIndex !== -1) {
        isOverride = true;
      }

      // Transform task data to UI format
      const transformedTask = this.transformTaskToUI(taskData, phaseId);

      if (isOverride) {
        // Override existing task, preserving its position and task_index
        const originalTask = targetPhase.phase_tasks[existingTaskIndex];
        transformedTask.task_index = originalTask.task_index;
        targetPhase.phase_tasks[existingTaskIndex] = transformedTask;
      } else {
        // Add new task at specified position or end
        if (
          position !== null &&
          position >= 0 &&
          position <= targetPhase.phase_tasks.length
        ) {
          targetPhase.phase_tasks.splice(position, 0, transformedTask);
        } else {
          targetPhase.phase_tasks.push(transformedTask);
        }
      }

      // Update task indices only if not overriding (to maintain order)
      if (!isOverride) {
        this.updateTaskIndices(targetPhase);
      }

      // Return roadmap with override information
      const result = { ...newRoadmap };
      result._operationInfo = { isOverride, taskId: taskData.task_id };
      return result;
    } catch (error) {
      console.error("Error adding task:", error);
      return null;
    }
  }

  /**
   * Remove a task from a phase
   * @param {Object} roadmap - Current roadmap data
   * @param {string} phaseId - Target phase ID
   * @param {string} taskId - Task ID to remove
   * @returns {Object} - Updated roadmap or null if failed
   */
  static removeTask(roadmap, phaseId, taskId) {
    try {
      const newRoadmap = JSON.parse(JSON.stringify(roadmap));
      const phases = newRoadmap.roadmap.phases || newRoadmap.roadmap;

      const targetPhase = phases.find((phase) => phase.phase_id === phaseId);
      if (!targetPhase) {
        throw new Error(`Phase ${phaseId} not found`);
      }

      const taskIndex = targetPhase.phase_tasks.findIndex(
        (task) => task.task_id === taskId
      );
      if (taskIndex === -1) {
        throw new Error(`Task ${taskId} not found in phase ${phaseId}`);
      }

      // Check for dependencies before removing
      const dependentTasks = this.findDependentTasks(
        newRoadmap,
        phaseId,
        taskId
      );
      if (dependentTasks.length > 0) {
        console.warn(
          `Removing task ${taskId} will break dependencies for:`,
          dependentTasks
        );
        // Remove the dependencies or handle as needed
        this.removeDependencies(newRoadmap, phaseId, taskId);
      }

      // Remove the task
      targetPhase.phase_tasks.splice(taskIndex, 1);

      // Update task indices
      this.updateTaskIndices(targetPhase);

      return newRoadmap;
    } catch (error) {
      console.error("Error removing task:", error);
      return null;
    }
  }

  /**
   * Replace a task with new task data
   * @param {Object} roadmap - Current roadmap data
   * @param {string} phaseId - Target phase ID
   * @param {string} taskId - Task ID to replace
   * @param {Object} newTaskData - New task data
   * @returns {Object} - Updated roadmap or null if failed
   */
  static replaceTask(roadmap, phaseId, taskId, newTaskData) {
    try {
      const newRoadmap = JSON.parse(JSON.stringify(roadmap));
      const phases = newRoadmap.roadmap.phases || newRoadmap.roadmap;

      const targetPhase = phases.find((phase) => phase.phase_id === phaseId);
      if (!targetPhase) {
        throw new Error(`Phase ${phaseId} not found`);
      }

      const taskIndex = targetPhase.phase_tasks.findIndex(
        (task) => task.task_id === taskId
      );
      if (taskIndex === -1) {
        throw new Error(`Task ${taskId} not found in phase ${phaseId}`);
      }

      // Validate new task data
      const taskValidation = this.validateTask(newTaskData);
      if (!taskValidation.isValid) {
        throw new Error(
          `Invalid task data: ${taskValidation.errors.join(", ")}`
        );
      }

      // Preserve original task index, phase_id, and detailed information
      const originalTask = targetPhase.phase_tasks[taskIndex];

      // Merge new task data with existing task detail information
      const mergedTaskData = {
        ...newTaskData,
        // Preserve existing task_detail if not provided in new data
        task_detail: newTaskData.task_detail || originalTask.task_detail,
      };

      const transformedTask = this.transformTaskToUI(mergedTaskData, phaseId);
      transformedTask.task_index = originalTask.task_index;
      transformedTask.phase_id = phaseId;

      // Replace the task
      targetPhase.phase_tasks[taskIndex] = transformedTask;

      return newRoadmap;
    } catch (error) {
      console.error("Error replacing task:", error);
      return null;
    }
  }

  /**
   * Move a task between phases or within a phase
   * @param {Object} roadmap - Current roadmap data
   * @param {string} fromPhaseId - Source phase ID
   * @param {string} toPhaseId - Target phase ID
   * @param {string} taskId - Task ID to move
   * @param {number} position - Target position
   * @returns {Object} - Updated roadmap or null if failed
   */
  static moveTask(roadmap, fromPhaseId, toPhaseId, taskId, position = null) {
    try {
      const newRoadmap = JSON.parse(JSON.stringify(roadmap));
      const phases = newRoadmap.roadmap.phases || newRoadmap.roadmap;

      const fromPhase = phases.find((phase) => phase.phase_id === fromPhaseId);
      const toPhase = phases.find((phase) => phase.phase_id === toPhaseId);

      if (!fromPhase || !toPhase) {
        throw new Error("Source or target phase not found");
      }

      const taskIndex = fromPhase.phase_tasks.findIndex(
        (task) => task.task_id === taskId
      );
      if (taskIndex === -1) {
        throw new Error(`Task ${taskId} not found in phase ${fromPhaseId}`);
      }

      // Get the task and remove from source
      const task = fromPhase.phase_tasks.splice(taskIndex, 1)[0];

      // Update phase_id if moving between phases
      if (fromPhaseId !== toPhaseId) {
        task.phase_id = toPhaseId;
      }

      // Add to target phase
      if (
        position !== null &&
        position >= 0 &&
        position <= toPhase.phase_tasks.length
      ) {
        toPhase.phase_tasks.splice(position, 0, task);
      } else {
        toPhase.phase_tasks.push(task);
      }

      // Update task indices for both phases
      this.updateTaskIndices(fromPhase);
      if (fromPhaseId !== toPhaseId) {
        this.updateTaskIndices(toPhase);
      }

      return newRoadmap;
    } catch (error) {
      console.error("Error moving task:", error);
      return null;
    }
  }

  /**
   * Update a specific property of a task
   * @param {Object} roadmap - Current roadmap data
   * @param {string} phaseId - Target phase ID
   * @param {string} taskId - Task ID to update
   * @param {string} property - Property name to update
   * @param {any} value - New value
   * @returns {Object} - Updated roadmap or null if failed
   */
  static updateTaskProperty(roadmap, phaseId, taskId, property, value) {
    try {
      const newRoadmap = JSON.parse(JSON.stringify(roadmap));
      const phases = newRoadmap.roadmap.phases || newRoadmap.roadmap;

      const targetPhase = phases.find((phase) => phase.phase_id === phaseId);
      if (!targetPhase) {
        throw new Error(`Phase ${phaseId} not found`);
      }

      const task = targetPhase.phase_tasks.find(
        (task) => task.task_id === taskId
      );
      if (!task) {
        throw new Error(`Task ${taskId} not found in phase ${phaseId}`);
      }

      // Update the property
      if (property.includes(".")) {
        // Handle nested properties
        const parts = property.split(".");
        let current = task;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        task[property] = value;
      }

      return newRoadmap;
    } catch (error) {
      console.error("Error updating task property:", error);
      return null;
    }
  }

  /**
   * Validate a single task against the schema
   * @param {Object} taskData - Task data to validate
   * @returns {Object} - Validation result
   */
  static validateTask(taskData) {
    try {
      const validator = new MultiSchemaValidator({
        tasks: skeletonTasksSchema,
      });

      // Wrap task in tasks array for validation
      const taskFile = { tasks: [taskData] };
      return validator.validateTasks(taskFile);
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
      };
    }
  }

  /**
   * Validate the entire roadmap
   * @param {Object} roadmap - Roadmap to validate
   * @returns {Object} - Validation result
   */
  static validateRoadmap(roadmap) {
    try {
      const validator = new MultiSchemaValidator({
        final: finalSchema,
      });

      // Transform to schema format for validation
      const schemaData = DataTransformer.transformToSchema(roadmap);
      return validator.validateFinalRoadmap(schemaData);
    } catch (error) {
      return {
        isValid: false,
        errors: [`Roadmap validation error: ${error.message}`],
      };
    }
  }

  /**
   * Transform task data to UI format
   * @param {Object} taskData - Raw task data
   * @param {string} phaseId - Phase ID
   * @returns {Object} - UI-formatted task
   */
  static transformTaskToUI(taskData, phaseId) {
    // Handle task data that comes from editor forms (flat structure)
    // vs task data that comes from schema (nested structure)

    if (
      taskData.task_difficulty ||
      taskData.difficulty_reason ||
      taskData.est_time
    ) {
      // This is flat task data from editor forms - transform it to schema format first
      const schemaTask = {
        task_id: taskData.task_id,
        task_title: taskData.task_title,
        task_summary: taskData.task_summary,
        task_dependencies: taskData.task_dependencies || [],
        task_tags: taskData.task_tags || [],
        task_priority: taskData.task_priority || "mid",
        task_number: taskData.task_number || 1,
        task_detail: {
          explanation: taskData.task_detail || {
            content: "",
            format: "plaintext",
          },
          difficulty: {
            level: taskData.task_difficulty || "normal",
            reason_of_difficulty: taskData.difficulty_reason || "",
            prerequisites_needed: taskData.prerequisites_needed || [],
          },
          est_time: taskData.est_time || {},
          code_blocks: taskData.code_blocks || [],
          resource_links: taskData.resource_links || [],
        },
      };

      return DataTransformer.transformTask(schemaTask, 0, phaseId);
    }

    // This is already schema-formatted task data
    return DataTransformer.transformTask(taskData, 0, phaseId);
  }

  /**
   * Transform roadmap to schema format
   * @param {Object} roadmap - UI roadmap data
   * @returns {Object} - Schema-formatted roadmap
   */
  static transformToSchema(roadmap) {
    return DataTransformer.transformToSchema(roadmap);
  }

  /**
   * Update task indices within a phase
   * @param {Object} phase - Phase object
   */
  static updateTaskIndices(phase) {
    phase.phase_tasks.forEach((task, index) => {
      task.task_index = index;
    });
  }

  /**
   * Find tasks that depend on a specific task
   * @param {Object} roadmap - Roadmap data
   * @param {string} phaseId - Phase ID of the dependency
   * @param {string} taskId - Task ID of the dependency
   * @returns {Array} - Array of dependent tasks
   */
  static findDependentTasks(roadmap, phaseId, taskId) {
    const dependentTasks = [];
    const phases = roadmap.roadmap.phases || roadmap.roadmap;

    phases.forEach((phase) => {
      phase.phase_tasks.forEach((task) => {
        if (task.task_dependencies) {
          const hasDependency = task.task_dependencies.some(
            (dep) => dep.phase_id === phaseId && dep.task_id === taskId
          );
          if (hasDependency) {
            dependentTasks.push({
              phase_id: phase.phase_id,
              task_id: task.task_id,
              task_title: task.task_title,
            });
          }
        }
      });
    });

    return dependentTasks;
  }

  /**
   * Remove dependencies to a specific task
   * @param {Object} roadmap - Roadmap data
   * @param {string} phaseId - Phase ID of the dependency
   * @param {string} taskId - Task ID of the dependency
   */
  static removeDependencies(roadmap, phaseId, taskId) {
    const phases = roadmap.roadmap.phases || roadmap.roadmap;

    phases.forEach((phase) => {
      phase.phase_tasks.forEach((task) => {
        if (task.task_dependencies) {
          task.task_dependencies = task.task_dependencies.filter(
            (dep) => !(dep.phase_id === phaseId && dep.task_id === taskId)
          );
        }
      });
    });
  }
}

export default RoadmapEditor;
