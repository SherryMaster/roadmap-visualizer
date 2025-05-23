/**
 * Schema Validation Utility
 * Validates roadmap data against the JSON schema and provides validation feedback
 */

class SchemaValidator {
  constructor(schema) {
    this.schema = schema;
  }

  /**
   * Validates roadmap data against the schema
   * @param {Object} data - The roadmap data to validate
   * @returns {Object} - Validation result with isValid flag and errors array
   */
  validate(data) {
    const errors = [];
    
    try {
      // Basic structure validation
      if (!data || typeof data !== 'object') {
        errors.push('Data must be an object');
        return { isValid: false, errors };
      }

      // Validate required root properties
      const requiredProps = this.schema.required || [];
      for (const prop of requiredProps) {
        if (!(prop in data)) {
          errors.push(`Missing required property: ${prop}`);
        }
      }

      // Validate roadmap structure
      if (data.roadmap) {
        this.validateRoadmap(data.roadmap, errors);
      }

      // Validate project level
      if (data.project_level) {
        this.validateProjectLevel(data.project_level, errors);
      }

      // Validate tags
      if (data.tags) {
        this.validateTags(data.tags, errors);
      }

    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates the roadmap structure
   */
  validateRoadmap(roadmap, errors) {
    if (!roadmap || typeof roadmap !== 'object') {
      errors.push('Roadmap must be an object');
      return;
    }

    if (!roadmap.phases || !Array.isArray(roadmap.phases)) {
      errors.push('Roadmap must contain a phases array');
      return;
    }

    // Validate each phase
    roadmap.phases.forEach((phase, index) => {
      this.validatePhase(phase, index, errors);
    });
  }

  /**
   * Validates a phase object
   */
  validatePhase(phase, index, errors) {
    const phasePrefix = `Phase ${index + 1}`;
    
    if (!phase || typeof phase !== 'object') {
      errors.push(`${phasePrefix}: Must be an object`);
      return;
    }

    // Required phase properties
    const requiredPhaseProps = ['phase_id', 'phase_title', 'phase_summary', 'phase_tasks'];
    for (const prop of requiredPhaseProps) {
      if (!(prop in phase)) {
        errors.push(`${phasePrefix}: Missing required property '${prop}'`);
      }
    }

    // Validate phase tasks
    if (phase.phase_tasks && Array.isArray(phase.phase_tasks)) {
      phase.phase_tasks.forEach((task, taskIndex) => {
        this.validateTask(task, `${phasePrefix}, Task ${taskIndex + 1}`, errors);
      });
    }
  }

  /**
   * Validates a task object
   */
  validateTask(task, taskPrefix, errors) {
    if (!task || typeof task !== 'object') {
      errors.push(`${taskPrefix}: Must be an object`);
      return;
    }

    // Required task properties
    const requiredTaskProps = ['task_id', 'task_title', 'task_summary', 'task_detail'];
    for (const prop of requiredTaskProps) {
      if (!(prop in task)) {
        errors.push(`${taskPrefix}: Missing required property '${prop}'`);
      }
    }

    // Validate task detail
    if (task.task_detail) {
      this.validateTaskDetail(task.task_detail, taskPrefix, errors);
    }

    // Validate task dependencies
    if (task.task_dependencies && Array.isArray(task.task_dependencies)) {
      task.task_dependencies.forEach((dep, depIndex) => {
        this.validateTaskDependency(dep, `${taskPrefix}, Dependency ${depIndex + 1}`, errors);
      });
    }
  }

  /**
   * Validates task detail object
   */
  validateTaskDetail(detail, taskPrefix, errors) {
    if (!detail || typeof detail !== 'object') {
      errors.push(`${taskPrefix}: task_detail must be an object`);
      return;
    }

    // Validate difficulty
    if (detail.difficulty) {
      this.validateDifficulty(detail.difficulty, taskPrefix, errors);
    }

    // Validate estimated time
    if (detail.est_time) {
      this.validateEstimatedTime(detail.est_time, taskPrefix, errors);
    }

    // Validate resource links
    if (detail.resource_links && Array.isArray(detail.resource_links)) {
      detail.resource_links.forEach((link, linkIndex) => {
        this.validateResourceLink(link, `${taskPrefix}, Resource ${linkIndex + 1}`, errors);
      });
    }
  }

  /**
   * Validates difficulty object
   */
  validateDifficulty(difficulty, taskPrefix, errors) {
    if (!difficulty || typeof difficulty !== 'object') {
      errors.push(`${taskPrefix}: difficulty must be an object`);
      return;
    }

    const validLevels = ['very_easy', 'easy', 'normal', 'difficult', 'challenging'];
    if (difficulty.level && !validLevels.includes(difficulty.level)) {
      errors.push(`${taskPrefix}: Invalid difficulty level '${difficulty.level}'`);
    }
  }

  /**
   * Validates estimated time object
   */
  validateEstimatedTime(estTime, taskPrefix, errors) {
    if (!estTime || typeof estTime !== 'object') {
      errors.push(`${taskPrefix}: est_time must be an object`);
      return;
    }

    if (!estTime.min_time) {
      errors.push(`${taskPrefix}: est_time must have min_time`);
    } else {
      this.validateTimeObject(estTime.min_time, `${taskPrefix}, min_time`, errors);
    }

    if (estTime.max_time) {
      this.validateTimeObject(estTime.max_time, `${taskPrefix}, max_time`, errors);
    }
  }

  /**
   * Validates time object (min_time/max_time)
   */
  validateTimeObject(timeObj, prefix, errors) {
    if (!timeObj || typeof timeObj !== 'object') {
      errors.push(`${prefix}: must be an object`);
      return;
    }

    if (typeof timeObj.amount !== 'number' || timeObj.amount <= 0) {
      errors.push(`${prefix}: amount must be a positive number`);
    }

    const validUnits = ['minutes', 'hours', 'days', 'weeks'];
    if (!validUnits.includes(timeObj.unit)) {
      errors.push(`${prefix}: unit must be one of ${validUnits.join(', ')}`);
    }
  }

  /**
   * Validates resource link object
   */
  validateResourceLink(link, linkPrefix, errors) {
    if (!link || typeof link !== 'object') {
      errors.push(`${linkPrefix}: must be an object`);
      return;
    }

    const requiredLinkProps = ['display_text', 'url', 'type', 'is_essential'];
    for (const prop of requiredLinkProps) {
      if (!(prop in link)) {
        errors.push(`${linkPrefix}: Missing required property '${prop}'`);
      }
    }

    const validTypes = ['document', 'tutorial', 'video', 'article', 'tool', 'reference', 'example', 'course'];
    if (link.type && !validTypes.includes(link.type)) {
      errors.push(`${linkPrefix}: Invalid type '${link.type}'`);
    }
  }

  /**
   * Validates task dependency object
   */
  validateTaskDependency(dependency, depPrefix, errors) {
    if (!dependency || typeof dependency !== 'object') {
      errors.push(`${depPrefix}: must be an object`);
      return;
    }

    const requiredDepProps = ['phase_id', 'task_id', 'dependency_type'];
    for (const prop of requiredDepProps) {
      if (!(prop in dependency)) {
        errors.push(`${depPrefix}: Missing required property '${prop}'`);
      }
    }

    const validDepTypes = ['required', 'recommended', 'optional'];
    if (dependency.dependency_type && !validDepTypes.includes(dependency.dependency_type)) {
      errors.push(`${depPrefix}: Invalid dependency_type '${dependency.dependency_type}'`);
    }
  }

  /**
   * Validates project level
   */
  validateProjectLevel(level, errors) {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validLevels.includes(level)) {
      errors.push(`Invalid project_level '${level}'. Must be one of: ${validLevels.join(', ')}`);
    }
  }

  /**
   * Validates tags array
   */
  validateTags(tags, errors) {
    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array');
      return;
    }

    tags.forEach((tag, index) => {
      if (typeof tag !== 'string') {
        errors.push(`Tag ${index + 1}: must be a string`);
      }
    });
  }
}

export default SchemaValidator;
