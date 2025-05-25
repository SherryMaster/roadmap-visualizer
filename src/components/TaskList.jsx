import { useState, useEffect, forwardRef } from "react";
import Task from "./Task";

const TaskList = forwardRef(({ tasks, phaseNumber }, ref) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const handleTaskClick = (index) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Function to expand a specific task (for dependency navigation)
  const expandTask = (taskId) => {
    const taskIndex = tasks.findIndex((task) => task.task_id === taskId);
    if (taskIndex !== -1) {
      setExpandedTasks((prev) => new Set(prev).add(taskIndex));
    }
  };

  // Listen for navigation events that require task expansion
  useEffect(() => {
    const handleNavigateToTask = (event) => {
      const { taskId } = event.detail;

      // Check if this TaskList contains the target task
      const targetTask = tasks.find((task) => task.task_id === taskId);
      if (targetTask) {
        expandTask(taskId);
      }
    };

    const handleExpandTask = (event) => {
      const { taskId } = event.detail;
      expandTask(taskId);
    };

    // Add event listeners
    document.addEventListener("navigateToTask", handleNavigateToTask);

    // Listen for expandTask events on the ref element
    if (ref && ref.current) {
      ref.current.addEventListener("expandTask", handleExpandTask);
    }

    return () => {
      document.removeEventListener("navigateToTask", handleNavigateToTask);
      if (ref && ref.current) {
        ref.current.removeEventListener("expandTask", handleExpandTask);
      }
    };
  }, [tasks, phaseNumber, ref]);

  return (
    <div ref={ref} className="space-y-4">
      {tasks.map((task, index) => {
        // Create a robust unique key using multiple identifiers
        const uniqueKey =
          task.task_id ||
          `task-${phaseNumber}-${index}` ||
          `task-index-${index}`;

        return (
          <Task
            key={uniqueKey}
            task={task}
            isExpanded={expandedTasks.has(index)}
            onClick={() => handleTaskClick(index)}
            phaseNumber={phaseNumber}
            taskIndex={index}
          />
        );
      })}
    </div>
  );
});

TaskList.displayName = "TaskList";

export default TaskList;
