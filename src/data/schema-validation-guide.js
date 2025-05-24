/**
 * Schema Validation and Merging Guide
 * 
 * This file demonstrates how to validate and merge the modular roadmap schemas.
 * It provides utility functions for working with the three-schema system.
 */

// Schema type constants
const SCHEMA_TYPES = {
  ROADMAP_SKELETON: 'roadmap_skeleton',
  PHASE_TASKS: 'phase_tasks', 
  TASK_DETAILS: 'task_details'
};

/**
 * Validates that a schema object has the correct metadata structure
 * @param {Object} schemaData - The schema data to validate
 * @param {string} expectedType - Expected schema type
 * @returns {Object} Validation result with success flag and errors
 */
function validateSchemaMetadata(schemaData, expectedType) {
  const errors = [];
  
  if (!schemaData.schema_metadata) {
    errors.push('Missing schema_metadata object');
    return { success: false, errors };
  }
  
  const metadata = schemaData.schema_metadata;
  
  if (metadata.schema_type !== expectedType) {
    errors.push(`Expected schema_type '${expectedType}', got '${metadata.schema_type}'`);
  }
  
  if (!metadata.roadmap_id) {
    errors.push('Missing roadmap_id in schema_metadata');
  }
  
  if (expectedType === SCHEMA_TYPES.PHASE_TASKS && !metadata.target_phase_id) {
    errors.push('Missing target_phase_id for phase_tasks schema');
  }
  
  if (expectedType === SCHEMA_TYPES.TASK_DETAILS) {
    if (!metadata.target_phase_id) {
      errors.push('Missing target_phase_id for task_details schema');
    }
    if (!metadata.target_task_id) {
      errors.push('Missing target_task_id for task_details schema');
    }
  }
  
  return { success: errors.length === 0, errors };
}

/**
 * Validates reference consistency between schemas
 * @param {Object} parentSchema - Parent schema (skeleton or phase-tasks)
 * @param {Object} childSchema - Child schema (phase-tasks or task-details)
 * @returns {Object} Validation result
 */
function validateSchemaReferences(parentSchema, childSchema) {
  const errors = [];
  
  // Check roadmap_id consistency
  if (parentSchema.schema_metadata.roadmap_id !== childSchema.schema_metadata.roadmap_id) {
    errors.push('Roadmap ID mismatch between schemas');
  }
  
  // For phase-tasks referencing skeleton
  if (parentSchema.schema_metadata.schema_type === SCHEMA_TYPES.ROADMAP_SKELETON &&
      childSchema.schema_metadata.schema_type === SCHEMA_TYPES.PHASE_TASKS) {
    
    const targetPhaseId = childSchema.schema_metadata.target_phase_id;
    const phaseExists = parentSchema.roadmap.phases.some(phase => phase.phase_id === targetPhaseId);
    
    if (!phaseExists) {
      errors.push(`Target phase '${targetPhaseId}' not found in roadmap skeleton`);
    }
  }
  
  // For task-details referencing phase-tasks
  if (parentSchema.schema_metadata.schema_type === SCHEMA_TYPES.PHASE_TASKS &&
      childSchema.schema_metadata.schema_type === SCHEMA_TYPES.TASK_DETAILS) {
    
    const targetTaskId = childSchema.schema_metadata.target_task_id;
    const taskExists = parentSchema.phase_tasks.some(task => task.task_id === targetTaskId);
    
    if (!taskExists) {
      errors.push(`Target task '${targetTaskId}' not found in phase tasks`);
    }
  }
  
  return { success: errors.length === 0, errors };
}

/**
 * Merges phase tasks into a roadmap skeleton
 * @param {Object} skeletonData - Roadmap skeleton data
 * @param {Array} phaseTasksArray - Array of phase-tasks schemas
 * @returns {Object} Merged roadmap with tasks
 */
function mergePhaseTasksIntoSkeleton(skeletonData, phaseTasksArray) {
  const mergedRoadmap = JSON.parse(JSON.stringify(skeletonData)); // Deep clone
  
  // Create a map of phase tasks by phase_id
  const phaseTasksMap = {};
  phaseTasksArray.forEach(phaseTasksSchema => {
    const phaseId = phaseTasksSchema.schema_metadata.target_phase_id;
    phaseTasksMap[phaseId] = phaseTasksSchema.phase_tasks;
  });
  
  // Merge tasks into corresponding phases
  mergedRoadmap.roadmap.phases.forEach(phase => {
    if (phaseTasksMap[phase.phase_id]) {
      phase.phase_tasks = phaseTasksMap[phase.phase_id];
    } else {
      phase.phase_tasks = []; // Empty array if no tasks provided
    }
  });
  
  return mergedRoadmap;
}

/**
 * Merges task details into phase tasks
 * @param {Object} phaseTasksData - Phase tasks data
 * @param {Array} taskDetailsArray - Array of task-details schemas
 * @returns {Object} Phase tasks with detailed content
 */
function mergeTaskDetailsIntoPhase(phaseTasksData, taskDetailsArray) {
  const mergedPhase = JSON.parse(JSON.stringify(phaseTasksData)); // Deep clone
  
  // Create a map of task details by task_id
  const taskDetailsMap = {};
  taskDetailsArray.forEach(taskDetailsSchema => {
    const taskId = taskDetailsSchema.schema_metadata.target_task_id;
    taskDetailsMap[taskId] = taskDetailsSchema.task_detail;
  });
  
  // Merge details into corresponding tasks
  mergedPhase.phase_tasks.forEach(task => {
    if (taskDetailsMap[task.task_id]) {
      task.task_detail = taskDetailsMap[task.task_id];
    }
  });
  
  return mergedPhase;
}

/**
 * Builds a complete roadmap from modular schemas
 * @param {Object} skeleton - Roadmap skeleton
 * @param {Array} phaseTasks - Array of phase-tasks schemas
 * @param {Array} taskDetails - Array of task-details schemas
 * @returns {Object} Complete roadmap with all details
 */
function buildCompleteRoadmap(skeleton, phaseTasks, taskDetails) {
  // First merge phase tasks into skeleton
  let completeRoadmap = mergePhaseTasksIntoSkeleton(skeleton, phaseTasks);
  
  // Group task details by phase
  const taskDetailsByPhase = {};
  taskDetails.forEach(taskDetail => {
    const phaseId = taskDetail.schema_metadata.target_phase_id;
    if (!taskDetailsByPhase[phaseId]) {
      taskDetailsByPhase[phaseId] = [];
    }
    taskDetailsByPhase[phaseId].push(taskDetail);
  });
  
  // Merge task details into each phase
  completeRoadmap.roadmap.phases.forEach(phase => {
    if (taskDetailsByPhase[phase.phase_id]) {
      const phaseWithDetails = mergeTaskDetailsIntoPhase(
        { phase_tasks: phase.phase_tasks },
        taskDetailsByPhase[phase.phase_id]
      );
      phase.phase_tasks = phaseWithDetails.phase_tasks;
    }
  });
  
  return completeRoadmap;
}

/**
 * Extracts generation statistics from schemas
 * @param {Object} skeleton - Roadmap skeleton
 * @param {Array} phaseTasks - Array of phase-tasks schemas
 * @param {Array} taskDetails - Array of task-details schemas
 * @returns {Object} Statistics about the roadmap
 */
function getGenerationStatistics(skeleton, phaseTasks, taskDetails) {
  const stats = {
    totalPhases: skeleton.roadmap.phases.length,
    phasesWithTasks: phaseTasks.length,
    totalTasks: 0,
    tasksWithDetails: taskDetails.length,
    completionPercentage: 0
  };
  
  // Count total tasks
  phaseTasks.forEach(phaseTask => {
    stats.totalTasks += phaseTask.phase_tasks.length;
  });
  
  // Calculate completion percentage
  if (stats.totalTasks > 0) {
    stats.completionPercentage = Math.round((stats.tasksWithDetails / stats.totalTasks) * 100);
  }
  
  return stats;
}

// Example usage:
/*
const skeleton = require('./sample-roadmap-skeleton.json');
const phaseTasks = [require('./sample-phase-tasks.json')];
const taskDetails = [require('./sample-task-details.json')];

// Validate schemas
const skeletonValidation = validateSchemaMetadata(skeleton, SCHEMA_TYPES.ROADMAP_SKELETON);
console.log('Skeleton validation:', skeletonValidation);

// Build complete roadmap
const completeRoadmap = buildCompleteRoadmap(skeleton, phaseTasks, taskDetails);
console.log('Complete roadmap built successfully');

// Get statistics
const stats = getGenerationStatistics(skeleton, phaseTasks, taskDetails);
console.log('Generation statistics:', stats);
*/

module.exports = {
  SCHEMA_TYPES,
  validateSchemaMetadata,
  validateSchemaReferences,
  mergePhaseTasksIntoSkeleton,
  mergeTaskDetailsIntoPhase,
  buildCompleteRoadmap,
  getGenerationStatistics
};
