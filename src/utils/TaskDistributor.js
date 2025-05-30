/**
 * Task Distribution Utility
 * Handles distribution of tasks across multiple phases based on phase_id
 */

class TaskDistributor {
  /**
   * Distributes tasks to their respective phases based on phase_id
   * @param {Array} tasks - Array of task objects
   * @param {Array} availablePhases - Array of available phase objects
   * @returns {Object} - Distribution result with success/error information
   */
  static distributeTasksToPhases(tasks, availablePhases) {
    const result = {
      success: true,
      distributedTasks: {},
      orphanedTasks: [],
      errors: [],
      stats: {
        totalTasks: tasks.length,
        distributedCount: 0,
        orphanedCount: 0,
        phasesAffected: 0
      }
    };

    // Create a map of available phase IDs for quick lookup
    const availablePhaseIds = new Set(availablePhases.map(phase => phase.phase_id));
    
    // Initialize distribution object for each available phase
    availablePhases.forEach(phase => {
      result.distributedTasks[phase.phase_id] = {
        phase_title: phase.phase_title,
        tasks: []
      };
    });

    // Distribute tasks
    tasks.forEach((task, index) => {
      try {
        // Validate task has required fields
        if (!task.phase_id) {
          result.errors.push(`Task at index ${index}: Missing phase_id`);
          result.orphanedTasks.push({ ...task, error: 'Missing phase_id' });
          return;
        }

        if (!task.task_id) {
          result.errors.push(`Task at index ${index}: Missing task_id`);
          result.orphanedTasks.push({ ...task, error: 'Missing task_id' });
          return;
        }

        // Check if phase exists
        if (!availablePhaseIds.has(task.phase_id)) {
          result.errors.push(`Task ${task.task_id}: Phase '${task.phase_id}' not found`);
          result.orphanedTasks.push({ ...task, error: `Phase '${task.phase_id}' not found` });
          return;
        }

        // Add task to appropriate phase
        result.distributedTasks[task.phase_id].tasks.push(task);
        result.stats.distributedCount++;

      } catch (error) {
        result.errors.push(`Task at index ${index}: ${error.message}`);
        result.orphanedTasks.push({ ...task, error: error.message });
      }
    });

    // Update stats
    result.stats.orphanedCount = result.orphanedTasks.length;
    result.stats.phasesAffected = Object.values(result.distributedTasks)
      .filter(phase => phase.tasks.length > 0).length;

    // Set overall success status
    result.success = result.errors.length === 0;

    return result;
  }

  /**
   * Validates task distribution before processing
   * @param {Array} tasks - Array of task objects
   * @param {Array} availablePhases - Array of available phase objects
   * @returns {Object} - Validation result
   */
  static validateDistribution(tasks, availablePhases) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!Array.isArray(tasks) || tasks.length === 0) {
      validation.isValid = false;
      validation.errors.push("No tasks provided for distribution");
      return validation;
    }

    if (!Array.isArray(availablePhases) || availablePhases.length === 0) {
      validation.isValid = false;
      validation.errors.push("No phases available for task distribution");
      return validation;
    }

    const availablePhaseIds = new Set(availablePhases.map(phase => phase.phase_id));
    const taskPhaseIds = new Set();
    const taskIds = new Set();

    tasks.forEach((task, index) => {
      // Check for required fields
      if (!task.phase_id) {
        validation.errors.push(`Task at index ${index}: Missing phase_id`);
      } else {
        taskPhaseIds.add(task.phase_id);
        
        // Check if phase exists
        if (!availablePhaseIds.has(task.phase_id)) {
          validation.errors.push(`Task at index ${index}: Phase '${task.phase_id}' does not exist`);
        }
      }

      if (!task.task_id) {
        validation.errors.push(`Task at index ${index}: Missing task_id`);
      } else {
        // Check for duplicate task IDs
        if (taskIds.has(task.task_id)) {
          validation.errors.push(`Duplicate task_id found: ${task.task_id}`);
        }
        taskIds.add(task.task_id);
      }

      // Check for other required fields
      if (!task.task_title) {
        validation.warnings.push(`Task ${task.task_id || index}: Missing task_title`);
      }
      if (!task.task_summary) {
        validation.warnings.push(`Task ${task.task_id || index}: Missing task_summary`);
      }
    });

    // Check for unused phases
    const unusedPhases = [...availablePhaseIds].filter(phaseId => !taskPhaseIds.has(phaseId));
    if (unusedPhases.length > 0) {
      validation.warnings.push(`Some phases will not receive tasks: ${unusedPhases.join(', ')}`);
    }

    validation.isValid = validation.errors.length === 0;
    return validation;
  }

  /**
   * Gets distribution statistics
   * @param {Object} distributionResult - Result from distributeTasksToPhases
   * @returns {Object} - Detailed statistics
   */
  static getDistributionStats(distributionResult) {
    const stats = { ...distributionResult.stats };
    
    // Add phase-specific stats
    stats.phaseBreakdown = {};
    Object.entries(distributionResult.distributedTasks).forEach(([phaseId, phaseData]) => {
      if (phaseData.tasks.length > 0) {
        stats.phaseBreakdown[phaseId] = {
          phase_title: phaseData.phase_title,
          taskCount: phaseData.tasks.length,
          taskIds: phaseData.tasks.map(task => task.task_id)
        };
      }
    });

    // Add success rate
    stats.successRate = stats.totalTasks > 0 
      ? Math.round((stats.distributedCount / stats.totalTasks) * 100) 
      : 0;

    return stats;
  }

  /**
   * Formats distribution result for UI display
   * @param {Object} distributionResult - Result from distributeTasksToPhases
   * @returns {Object} - Formatted result for UI
   */
  static formatForUI(distributionResult) {
    const formatted = {
      success: distributionResult.success,
      message: '',
      details: [],
      stats: this.getDistributionStats(distributionResult)
    };

    // Generate summary message
    if (distributionResult.success) {
      formatted.message = `Successfully distributed ${distributionResult.stats.distributedCount} tasks across ${distributionResult.stats.phasesAffected} phases`;
    } else {
      formatted.message = `Distribution completed with ${distributionResult.errors.length} errors. ${distributionResult.stats.distributedCount} tasks distributed successfully.`;
    }

    // Add phase-specific details
    Object.entries(distributionResult.distributedTasks).forEach(([phaseId, phaseData]) => {
      if (phaseData.tasks.length > 0) {
        formatted.details.push({
          type: 'success',
          phase: phaseData.phase_title,
          message: `${phaseData.tasks.length} tasks added to ${phaseData.phase_title}`,
          taskIds: phaseData.tasks.map(task => task.task_id)
        });
      }
    });

    // Add orphaned tasks details
    if (distributionResult.orphanedTasks.length > 0) {
      formatted.details.push({
        type: 'error',
        phase: 'Orphaned Tasks',
        message: `${distributionResult.orphanedTasks.length} tasks could not be distributed`,
        errors: distributionResult.orphanedTasks.map(task => ({
          taskId: task.task_id || 'Unknown',
          error: task.error
        }))
      });
    }

    return formatted;
  }

  /**
   * Checks for potential task ID conflicts with existing tasks
   * @param {Array} newTasks - New tasks to be added
   * @param {Object} currentRoadmap - Current roadmap data
   * @returns {Object} - Conflict analysis
   */
  static checkTaskIdConflicts(newTasks, currentRoadmap) {
    const conflicts = {
      hasConflicts: false,
      conflictingTasks: [],
      suggestions: []
    };

    // Get all existing task IDs
    const existingTaskIds = new Set();
    const phases = currentRoadmap?.roadmap?.phases || currentRoadmap?.roadmap || [];
    
    phases.forEach(phase => {
      if (phase.phase_tasks) {
        phase.phase_tasks.forEach(task => {
          existingTaskIds.add(task.task_id);
        });
      }
    });

    // Check for conflicts
    newTasks.forEach(task => {
      if (task.task_id && existingTaskIds.has(task.task_id)) {
        conflicts.hasConflicts = true;
        conflicts.conflictingTasks.push({
          task_id: task.task_id,
          task_title: task.task_title,
          phase_id: task.phase_id
        });
        
        // Generate suggestion for new ID
        let counter = 1;
        let suggestedId = `${task.task_id}_${counter}`;
        while (existingTaskIds.has(suggestedId)) {
          counter++;
          suggestedId = `${task.task_id}_${counter}`;
        }
        
        conflicts.suggestions.push({
          original: task.task_id,
          suggested: suggestedId
        });
      }
    });

    return conflicts;
  }
}

export default TaskDistributor;
