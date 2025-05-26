/**
 * Roadmap Merger Utility
 * Merges skeleton and task files into a complete roadmap structure
 */

class RoadmapMerger {
  /**
   * Merges skeleton and task files into a complete roadmap
   * @param {Object} skeleton - The roadmap skeleton data
   * @param {Array} taskFiles - Array of task file data
   * @returns {Object} - Complete merged roadmap or null if merge fails
   */
  static merge(skeleton, taskFiles) {
    try {
      if (!skeleton || !taskFiles || !Array.isArray(taskFiles)) {
        throw new Error("Invalid input: skeleton and taskFiles array required");
      }

      // Combine all tasks from all task files
      const allTasks = [];
      taskFiles.forEach((taskFile) => {
        if (taskFile.tasks && Array.isArray(taskFile.tasks)) {
          allTasks.push(...taskFile.tasks);
        }
      });

      // Create the base roadmap structure
      const mergedRoadmap = {
        title:
          skeleton.roadmap_title ||
          skeleton.project_title ||
          "Untitled Roadmap",
        description:
          skeleton.roadmap_description || skeleton.project_description || "",
        tags: this.extractTags(skeleton, allTasks),
        project_level: skeleton.project_level || "beginner",
        roadmap: {
          phases: [],
        },
      };

      // Process each phase from skeleton in correct order
      if (skeleton.phases && Array.isArray(skeleton.phases)) {
        // Sort phases by phase_number to ensure correct ordering
        const sortedPhases = [...skeleton.phases].sort((a, b) => {
          const aNum = a.phase_number || 0;
          const bNum = b.phase_number || 0;
          return aNum - bNum;
        });

        sortedPhases.forEach((skeletonPhase) => {
          const mergedPhase = this.mergePhase(skeletonPhase, allTasks);
          mergedRoadmap.roadmap.phases.push(mergedPhase);
        });
      }

      // Validate the merge was successful
      const mergeValidation = this.validateMerge(
        mergedRoadmap,
        skeleton,
        allTasks
      );
      if (!mergeValidation.isValid) {
        throw new Error(
          `Merge validation failed: ${mergeValidation.errors.join(", ")}`
        );
      }

      return mergedRoadmap;
    } catch (error) {
      console.error("Error merging roadmap:", error);
      return null;
    }
  }

  /**
   * Merges a single phase with its corresponding tasks
   */
  static mergePhase(skeletonPhase, allTasks) {
    // Find tasks that belong to this phase
    const phaseTasks = allTasks.filter(
      (task) => task.phase_id === skeletonPhase.phase_id
    );

    // Sort tasks by task_id for consistent ordering
    phaseTasks.sort((a, b) => a.task_id.localeCompare(b.task_id));

    const mergedPhase = {
      phase_id: skeletonPhase.phase_id,
      phase_title: skeletonPhase.phase_title,
      phase_dependencies: skeletonPhase.phase_dependencies || [],
      phase_summary: skeletonPhase.phase_summary,
      phase_details:
        skeletonPhase.phase_details ||
        (skeletonPhase.phase_detail ? [skeletonPhase.phase_detail] : []),
      key_milestones:
        skeletonPhase.key_milestones || this.extractMilestones(phaseTasks),
      success_indicators:
        skeletonPhase.success_indicators ||
        this.extractSuccessIndicators(phaseTasks),
      phase_tasks: [],
    };

    // Transform each task to the final schema format
    phaseTasks.forEach((task) => {
      const transformedTask = this.transformTask(task);
      mergedPhase.phase_tasks.push(transformedTask);
    });

    return mergedPhase;
  }

  /**
   * Transforms a task from skeleton format to final schema format
   */
  static transformTask(task) {
    return {
      task_id: task.task_id,
      task_title: task.task_title,
      task_summary: task.task_summary,
      task_detail: {
        explanation: task.task_detail ? task.task_detail.join(" ") : "",
        difficulty: {
          level: task.task_difficulty || "normal",
          reason_of_difficulty: task.difficulty_reason || "",
          prerequisites_needed: task.prerequisites_needed || [],
        },
        est_time: this.transformEstTime(task.est_time),
        code_blocks: task.code_blocks || [],
        resource_links: this.transformResourceLinks(task.resource_links || []),
      },
      task_dependencies: this.transformTaskDependencies(
        task.task_dependencies || []
      ),
      task_tags: task.task_tags || [],
      task_priority: task.task_priority || task.task_priotity || "mid", // Handle both correct and typo versions
      // Preserve task_number from skeleton task data
      task_number: task.task_number,
    };
  }

  /**
   * Transforms estimated time structure
   */
  static transformEstTime(estTime) {
    if (!estTime) {
      return {
        min_time: { amount: 1, unit: "hours" },
        max_time: { amount: 2, unit: "hours" },
        factors_affecting_time: [],
      };
    }

    // Handle cases where max_time might be missing
    let maxTime = estTime.max_time;
    if (!maxTime && estTime.min_time) {
      // If max_time is missing, estimate it as 1.5x min_time
      maxTime = {
        amount: Math.ceil(estTime.min_time.amount * 1.5),
        unit: estTime.min_time.unit,
      };
    }

    return {
      min_time: estTime.min_time || { amount: 1, unit: "hours" },
      max_time: maxTime || { amount: 2, unit: "hours" },
      factors_affecting_time: estTime.factors_affecting_time || [],
    };
  }

  /**
   * Transforms resource links to final format
   */
  static transformResourceLinks(resourceLinks) {
    return resourceLinks.map((link) => ({
      display_text: link.display_text,
      url: link.url,
      type: link.type || "reference",
      is_essential: link.is_essential || false,
    }));
  }

  /**
   * Transforms task dependencies to final format
   */
  static transformTaskDependencies(dependencies) {
    return dependencies.map((dep) => ({
      phase_id: dep.phase_id || "",
      task_id: dep.task_id || "",
      dependency_type: dep.dependency_type || "recommended",
    }));
  }

  /**
   * Extracts tags exclusively from skeleton file
   * Task-level tags (task.task_tags) are preserved separately for individual tasks
   */
  static extractTags(skeleton, allTasks) {
    const tags = [];

    // Extract tags ONLY from skeleton file
    if (skeleton.tags && Array.isArray(skeleton.tags)) {
      skeleton.tags.forEach((tag) => {
        if (tag && typeof tag === "string" && tag.trim()) {
          tags.push(tag.trim());
        }
      });
    }

    return tags.sort(); // Sort for consistent ordering
  }

  /**
   * Extracts key milestones from tasks
   */
  static extractMilestones(tasks) {
    const milestones = [];

    // Use high priority tasks as milestones
    tasks.forEach((task) => {
      const priority = task.task_priority || task.task_priotity; // Handle both correct and typo versions
      if (priority === "critical" || priority === "high") {
        milestones.push(`Complete ${task.task_title}`);
      }
    });

    // If no high priority tasks, use first and last tasks
    if (milestones.length === 0 && tasks.length > 0) {
      milestones.push(`Start with ${tasks[0].task_title}`);
      if (tasks.length > 1) {
        milestones.push(`Finish with ${tasks[tasks.length - 1].task_title}`);
      }
    }

    return milestones;
  }

  /**
   * Extracts success indicators from tasks
   */
  static extractSuccessIndicators(tasks) {
    const indicators = [];

    tasks.forEach((task) => {
      if (task.task_detail && Array.isArray(task.task_detail)) {
        // Use the first detail as a success indicator
        if (task.task_detail.length > 0) {
          indicators.push(`Successfully ${task.task_detail[0].toLowerCase()}`);
        }
      }
    });

    // Default indicators if none found
    if (indicators.length === 0) {
      indicators.push("All tasks completed successfully");
      indicators.push("Phase objectives met");
    }

    return indicators.slice(0, 3); // Limit to 3 indicators
  }

  /**
   * Validates the merge was successful
   */
  static validateMerge(mergedRoadmap, skeleton, allTasks) {
    const errors = [];

    // Check that all skeleton phases are present
    if (skeleton.phases) {
      skeleton.phases.forEach((skeletonPhase) => {
        const foundPhase = mergedRoadmap.roadmap.phases.find(
          (p) => p.phase_id === skeletonPhase.phase_id
        );
        if (!foundPhase) {
          errors.push(
            `Phase ${skeletonPhase.phase_id} not found in merged roadmap`
          );
        }
      });
    }

    // Check that all tasks are assigned to phases
    const assignedTaskIds = new Set();
    mergedRoadmap.roadmap.phases.forEach((phase) => {
      phase.phase_tasks.forEach((task) => {
        assignedTaskIds.add(task.task_id);
      });
    });

    allTasks.forEach((task) => {
      if (!assignedTaskIds.has(task.task_id)) {
        errors.push(`Task ${task.task_id} not assigned to any phase`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets merge statistics
   */
  static getMergeStats(skeleton, taskFiles, mergedRoadmap) {
    const allTasks = [];
    taskFiles.forEach((taskFile) => {
      if (taskFile.tasks) {
        allTasks.push(...taskFile.tasks);
      }
    });

    return {
      totalPhases: skeleton.phases ? skeleton.phases.length : 0,
      totalTasks: allTasks.length,
      taskFiles: taskFiles.length,
      mergedPhases: mergedRoadmap ? mergedRoadmap.roadmap.phases.length : 0,
      mergedTasks: mergedRoadmap
        ? mergedRoadmap.roadmap.phases.reduce(
            (sum, phase) => sum + phase.phase_tasks.length,
            0
          )
        : 0,
    };
  }
}

export default RoadmapMerger;
