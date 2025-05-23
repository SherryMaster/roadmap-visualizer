import { createContext, useState, useEffect, useContext } from 'react';

// Create context
const TaskCompletionContext = createContext();

// Custom hook to use the context
export const useTaskCompletion = () => {
  return useContext(TaskCompletionContext);
};

// Provider component
export const TaskCompletionProvider = ({ children, roadmapData }) => {
  const [completedTasks, setCompletedTasks] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate a unique ID for the roadmap to use in localStorage
  const getRoadmapId = () => {
    if (!roadmapData || !roadmapData.title) return 'default-roadmap';
    return `roadmap-${roadmapData.title.replace(/\s+/g, '-').toLowerCase()}`;
  };

  // Load completed tasks from localStorage on initial render
  useEffect(() => {
    if (!roadmapData) return;
    
    const roadmapId = getRoadmapId();
    const savedCompletedTasks = localStorage.getItem(`completed-tasks-${roadmapId}`);
    
    if (savedCompletedTasks) {
      try {
        setCompletedTasks(JSON.parse(savedCompletedTasks));
      } catch (error) {
        console.error('Error parsing saved completed tasks:', error);
        setCompletedTasks({});
      }
    }
    
    setIsInitialized(true);
  }, [roadmapData]);

  // Save completed tasks to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized || !roadmapData) return;
    
    const roadmapId = getRoadmapId();
    localStorage.setItem(`completed-tasks-${roadmapId}`, JSON.stringify(completedTasks));
  }, [completedTasks, isInitialized, roadmapData]);

  // Toggle task completion status
  const toggleTaskCompletion = (phaseNumber, taskIndex) => {
    const taskId = `${phaseNumber}-${taskIndex}`;
    
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Check if a task is completed
  const isTaskCompleted = (phaseNumber, taskIndex) => {
    const taskId = `${phaseNumber}-${taskIndex}`;
    return !!completedTasks[taskId];
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
      completedCount += getCompletedTasksInPhase(phase.phase_number, phaseTasks);
    });
    
    return totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  };

  // Reset all completion data
  const resetAllProgress = () => {
    setCompletedTasks({});
  };

  // Context value
  const value = {
    toggleTaskCompletion,
    isTaskCompleted,
    getCompletedTasksInPhase,
    calculateOverallProgress,
    resetAllProgress
  };

  return (
    <TaskCompletionContext.Provider value={value}>
      {children}
    </TaskCompletionContext.Provider>
  );
};
