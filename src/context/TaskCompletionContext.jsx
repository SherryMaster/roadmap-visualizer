import { createContext, useState, useEffect, useContext } from "react";
import RoadmapPersistence from "../utils/RoadmapPersistence";

// Create context
const TaskCompletionContext = createContext();

// Custom hook to use the context
export const useTaskCompletion = () => {
  return useContext(TaskCompletionContext);
};

// Provider component
export const TaskCompletionProvider = ({
  children,
  roadmapData,
  roadmapId,
}) => {
  const [completedTasks, setCompletedTasks] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate a unique ID for the roadmap to use in localStorage
  const getRoadmapId = () => {
    if (roadmapId) return roadmapId;
    if (!roadmapData || !roadmapData.title) return "default-roadmap";
    return `roadmap-${roadmapData.title.replace(/\s+/g, "-").toLowerCase()}`;
  };

  // Load completed tasks from localStorage on initial render
  useEffect(() => {
    if (!roadmapData) return;

    const roadmapId = getRoadmapId();
    const savedCompletedTasks = localStorage.getItem(
      `completed-tasks-${roadmapId}`
    );

    if (savedCompletedTasks) {
      try {
        setCompletedTasks(JSON.parse(savedCompletedTasks));
      } catch (error) {
        console.error("Error parsing saved completed tasks:", error);
        setCompletedTasks({});
      }
    }

    setIsInitialized(true);
  }, [roadmapData]);

  // Save completed tasks to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized || !roadmapData) return;

    const currentRoadmapId = getRoadmapId();
    localStorage.setItem(
      `completed-tasks-${currentRoadmapId}`,
      JSON.stringify(completedTasks)
    );

    // Update progress in roadmap metadata
    const progressPercentage = calculateOverallProgress();
    RoadmapPersistence.updateRoadmapProgress(
      currentRoadmapId,
      progressPercentage
    );
  }, [completedTasks, isInitialized, roadmapData]);

  // Toggle task completion status
  const toggleTaskCompletion = (phaseNumber, taskIndex) => {
    const taskId = `${phaseNumber}-${taskIndex}`;

    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Check if a task is completed
  const isTaskCompleted = (phaseNumber, taskIndex) => {
    const taskId = `${phaseNumber}-${taskIndex}`;
    return !!completedTasks[taskId];
  };

  // Check if a task is completed by phase_id and task_id (for dependencies)
  const isTaskCompletedById = (phaseId, taskId) => {
    if (!roadmapData || !roadmapData.roadmap) return false;

    // Find the phase and task to get their indices
    for (
      let phaseIndex = 0;
      phaseIndex < roadmapData.roadmap.length;
      phaseIndex++
    ) {
      const phase = roadmapData.roadmap[phaseIndex];
      if (phase.phase_id === phaseId) {
        for (
          let taskIndex = 0;
          taskIndex < phase.phase_tasks.length;
          taskIndex++
        ) {
          const task = phase.phase_tasks[taskIndex];
          if (task.task_id === taskId) {
            return isTaskCompleted(phase.phase_number, taskIndex);
          }
        }
      }
    }
    return false;
  };

  // Get the number of completed tasks in a phase
  const getCompletedTasksInPhase = (phaseNumber, totalTasks) => {
    let count = 0;

    for (let i = 0; i < totalTasks; i++) {
      if (isTaskCompleted(phaseNumber, i)) {
        count++;
      }
    }

    return count;
  };

  // Calculate overall progress percentage
  const calculateOverallProgress = () => {
    if (!roadmapData || !roadmapData.roadmap) return 0;

    let totalTasks = 0;
    let completedCount = 0;

    roadmapData.roadmap.forEach((phase) => {
      const phaseTasks = phase.phase_tasks.length;
      totalTasks += phaseTasks;
      completedCount += getCompletedTasksInPhase(
        phase.phase_number,
        phaseTasks
      );
    });

    return totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  };

  // Check if all required dependencies are completed for a task
  const areRequiredDependenciesCompleted = (dependencies) => {
    if (!dependencies || dependencies.length === 0) return true;

    const requiredDependencies = dependencies.filter(
      (dep) => dep.dependency_type === "required"
    );
    if (requiredDependencies.length === 0) return true;

    return requiredDependencies.every((dep) =>
      isTaskCompletedById(dep.phase_id, dep.task_id)
    );
  };

  // Get dependency completion status for a task
  const getDependencyStatus = (dependencies) => {
    if (!dependencies || dependencies.length === 0) {
      return {
        canComplete: true,
        requiredCompleted: 0,
        requiredTotal: 0,
        recommendedCompleted: 0,
        recommendedTotal: 0,
        optionalCompleted: 0,
        optionalTotal: 0,
        dependencyStatuses: [],
      };
    }

    const dependencyStatuses = dependencies.map((dep) => ({
      ...dep,
      isCompleted: isTaskCompletedById(dep.phase_id, dep.task_id),
    }));

    const required = dependencyStatuses.filter(
      (dep) => dep.dependency_type === "required"
    );
    const recommended = dependencyStatuses.filter(
      (dep) => dep.dependency_type === "recommended"
    );
    const optional = dependencyStatuses.filter(
      (dep) => dep.dependency_type === "optional"
    );

    const requiredCompleted = required.filter((dep) => dep.isCompleted).length;
    const recommendedCompleted = recommended.filter(
      (dep) => dep.isCompleted
    ).length;
    const optionalCompleted = optional.filter((dep) => dep.isCompleted).length;

    return {
      canComplete: requiredCompleted === required.length,
      requiredCompleted,
      requiredTotal: required.length,
      recommendedCompleted,
      recommendedTotal: recommended.length,
      optionalCompleted,
      optionalTotal: optional.length,
      dependencyStatuses,
    };
  };

  // Enhanced toggle function that checks dependencies
  const toggleTaskCompletionWithValidation = (
    phaseNumber,
    taskIndex,
    dependencies
  ) => {
    // If trying to complete a task, check dependencies first
    const currentlyCompleted = isTaskCompleted(phaseNumber, taskIndex);

    if (!currentlyCompleted && dependencies && dependencies.length > 0) {
      const canComplete = areRequiredDependenciesCompleted(dependencies);
      if (!canComplete) {
        // Return false to indicate the toggle was blocked
        return false;
      }
    }

    // Proceed with normal toggle
    toggleTaskCompletion(phaseNumber, taskIndex);
    return true;
  };

  // Reset all completion data
  const resetAllProgress = () => {
    setCompletedTasks({});
  };

  // Context value
  const value = {
    toggleTaskCompletion,
    toggleTaskCompletionWithValidation,
    isTaskCompleted,
    isTaskCompletedById,
    getCompletedTasksInPhase,
    calculateOverallProgress,
    areRequiredDependenciesCompleted,
    getDependencyStatus,
    resetAllProgress,
  };

  return (
    <TaskCompletionContext.Provider value={value}>
      {children}
    </TaskCompletionContext.Provider>
  );
};
