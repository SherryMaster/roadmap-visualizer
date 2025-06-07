import { useState, useEffect, forwardRef } from "react";
import PublicTask from "./PublicTask";

const PublicTaskList = forwardRef(({ tasks, phaseNumber }, ref) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  // Sort tasks by task_number if available, otherwise maintain array order
  const sortedTasks = [...tasks].sort((a, b) => {
    // If both tasks have task_number, sort by that
    if (a.task_number !== undefined && b.task_number !== undefined) {
      return a.task_number - b.task_number;
    }
    // If only one has task_number, prioritize it
    if (a.task_number !== undefined) return -1;
    if (b.task_number !== undefined) return 1;
    // If neither has task_number, maintain original order
    return 0;
  });

  const handleTaskClick = (taskIndex) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskIndex)) {
        newSet.delete(taskIndex);
      } else {
        newSet.add(taskIndex);
      }
      return newSet;
    });
  };

  // Handle expand task events from navigation
  useEffect(() => {
    const handleExpandTask = (event) => {
      const { taskId } = event.detail;

      // Find the task by ID
      const taskIndex = sortedTasks.findIndex((task) => task.task_id === taskId);

      if (taskIndex !== -1) {
        setExpandedTasks((prev) => {
          const newSet = new Set(prev);
          newSet.add(taskIndex);
          return newSet;
        });

        // Scroll to the task after a short delay
        setTimeout(() => {
          const taskElement = document.querySelector(
            `[data-task-id="${taskId}"]`
          );
          if (taskElement) {
            taskElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 200);
      }
    };

    // Handle navigation to task events
    const handleNavigateToTask = (event) => {
      const { taskId, phaseNumber: targetPhaseNumber } = event.detail;

      // Only handle if this is the target phase
      if (targetPhaseNumber === phaseNumber) {
        handleExpandTask(event);
      }
    };

    if (ref && ref.current) {
      ref.current.addEventListener("expandTask", handleExpandTask);
    }

    document.addEventListener("navigateToTask", handleNavigateToTask);
    return () => {
      document.removeEventListener("navigateToTask", handleNavigateToTask);
      if (ref && ref.current) {
        ref.current.removeEventListener("expandTask", handleExpandTask);
      }
    };
  }, [sortedTasks, phaseNumber, ref]);

  return (
    <div ref={ref} className="space-y-3 sm:space-y-4">
      {sortedTasks.map((task, index) => {
        // Create a robust unique key using multiple identifiers
        const uniqueKey =
          task.task_id ||
          `task-${phaseNumber}-${index}` ||
          `task-index-${index}`;

        return (
          <PublicTask
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

PublicTaskList.displayName = "PublicTaskList";

export default PublicTaskList;
