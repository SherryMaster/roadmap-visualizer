import { useState, useEffect, forwardRef } from "react";
import Task from "./Task";
import configManager from "../utils/ConfigManager";

const TaskList = forwardRef(({ tasks, phaseNumber }, ref) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  // Sort tasks by task_number based on configuration, fallback to array order for backward compatibility
  const taskNumberingConfig = configManager.getComponentConfig("taskNumbering");
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!taskNumberingConfig.orderByTaskNumber) {
      // If ordering by task number is disabled, maintain original array order
      return 0;
    }

    const aNumber =
      a.task_number !== undefined
        ? a.task_number
        : taskNumberingConfig.fallbackToArrayOrder
        ? a.task_index + 1
        : 999;
    const bNumber =
      b.task_number !== undefined
        ? b.task_number
        : taskNumberingConfig.fallbackToArrayOrder
        ? b.task_index + 1
        : 999;
    return aNumber - bNumber;
  });

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
    const taskIndex = sortedTasks.findIndex((task) => task.task_id === taskId);
    if (taskIndex !== -1) {
      setExpandedTasks((prev) => new Set(prev).add(taskIndex));
    }
  };

  // Listen for navigation events that require task expansion
  useEffect(() => {
    const handleNavigateToTask = (event) => {
      const { taskId } = event.detail;

      // Check if this TaskList contains the target task
      const targetTask = sortedTasks.find((task) => task.task_id === taskId);
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
  }, [sortedTasks, phaseNumber, ref]);

  return (
    <div ref={ref} className="space-y-4">
      {sortedTasks.map((task, index) => {
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
