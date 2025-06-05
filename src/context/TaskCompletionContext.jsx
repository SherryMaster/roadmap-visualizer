import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import RoadmapPersistence from "../utils/RoadmapPersistence";
import FirestorePersistence from "../utils/FirestorePersistence";
import { useAuth } from "./AuthContext";

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
  const { currentUser } = useAuth();
  const [completedTasks, setCompletedTasks] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate a unique ID for the roadmap to use in localStorage
  const getRoadmapId = () => {
    if (roadmapId) return roadmapId;
    if (!roadmapData || !roadmapData.title) return "default-roadmap";
    return `roadmap-${roadmapData.title.replace(/\s+/g, "-").toLowerCase()}`;
  };

  // Load completed tasks from Firestore and localStorage on initial render
  useEffect(() => {
    if (!roadmapData) return;

    const loadCompletedTasks = async () => {
      let loadedTasks = {};

      // Try to load from Firestore first (if user is authenticated and roadmapId exists)
      if (currentUser && roadmapId) {
        try {
          loadedTasks = await FirestorePersistence.loadTaskCompletions(
            currentUser.uid,
            roadmapId
          );
        } catch (error) {
          console.error("Error loading task completions from Firestore:", error);
        }
      }

      // Fallback to localStorage if no Firestore data or not authenticated
      if (Object.keys(loadedTasks).length === 0) {
        const localRoadmapId = getRoadmapId();
        const savedCompletedTasks = localStorage.getItem(
          `completed-tasks-${localRoadmapId}`
        );

        if (savedCompletedTasks) {
          try {
            loadedTasks = JSON.parse(savedCompletedTasks);
          } catch (error) {
            console.error("Error parsing saved completed tasks:", error);
            loadedTasks = {};
          }
        }
      }

      setCompletedTasks(loadedTasks);
      setIsInitialized(true);
    };

    loadCompletedTasks();
  }, [roadmapData, currentUser, roadmapId]);

  // Save completed tasks to localStorage and Firestore, and update progress whenever they change
  useEffect(() => {
    if (!isInitialized || !roadmapData) return;

    const saveCompletedTasks = async () => {
      const currentRoadmapId = getRoadmapId();

      // Save to localStorage (for backward compatibility)
      localStorage.setItem(
        `completed-tasks-${currentRoadmapId}`,
        JSON.stringify(completedTasks)
      );

      // Save to Firestore (if user is authenticated and roadmapId exists)
      if (currentUser && roadmapId) {
        await FirestorePersistence.saveTaskCompletions(
          currentUser.uid,
          roadmapId,
          completedTasks
        );
      }

      // Update progress in roadmap metadata (both localStorage and Firestore)
      const progressPercentage = calculateOverallProgress();

      // Update localStorage metadata (for backward compatibility)
      RoadmapPersistence.updateRoadmapProgress(
        currentRoadmapId,
        progressPercentage
      );

      // Update Firestore metadata (for real-time sync)
      if (roadmapId) {
        FirestorePersistence.updateRoadmapProgress(roadmapId, progressPercentage);
      }
    };

    saveCompletedTasks();
  }, [completedTasks, isInitialized, roadmapData, roadmapId, currentUser]);

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
  const isTaskCompletedById = useCallback(
    (phaseId, taskId) => {
      if (!roadmapData || !roadmapData.roadmap) return false;

      // Handle both assembled roadmap structure (roadmap.phases) and direct array structure
      const phases = roadmapData.roadmap.phases || roadmapData.roadmap;

      if (!Array.isArray(phases)) return false;

      // Find the phase and task to get their indices
      for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
        const phase = phases[phaseIndex];
        if (phase.phase_id === phaseId) {
          for (
            let taskIndex = 0;
            taskIndex < phase.phase_tasks.length;
            taskIndex++
          ) {
            const task = phase.phase_tasks[taskIndex];
            if (task.task_id === taskId) {
              // Use phase.phase_number to maintain consistency with the rest of the system
              const completed = isTaskCompleted(phase.phase_number, taskIndex);
              return completed;
            }
          }
        }
      }
      return false;
    },
    [completedTasks, roadmapData, isTaskCompleted]
  ); // Include isTaskCompleted as dependency

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

    // Handle both assembled roadmap structure (roadmap.phases) and direct array structure
    const phases = roadmapData.roadmap.phases || roadmapData.roadmap;

    if (!Array.isArray(phases)) return 0;

    let totalTasks = 0;
    let completedCount = 0;

    phases.forEach((phase) => {
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
  const getDependencyStatus = useCallback(
    (dependencies) => {
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

      const requiredCompleted = required.filter(
        (dep) => dep.isCompleted
      ).length;
      const recommendedCompleted = recommended.filter(
        (dep) => dep.isCompleted
      ).length;
      const optionalCompleted = optional.filter(
        (dep) => dep.isCompleted
      ).length;

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
    },
    [completedTasks, roadmapData, isTaskCompletedById]
  ); // Include isTaskCompletedById as dependency

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
    completedTasks, // Expose completedTasks for dependency tracking
  };

  return (
    <TaskCompletionContext.Provider value={value}>
      {children}
    </TaskCompletionContext.Provider>
  );
};
