import { useEffect, useRef } from "react";
import TaskList from "./TaskList";
import { useTaskCompletion } from "../context/TaskCompletionContext";

const Phase = ({ phase, isExpanded, isActive, onClick }) => {
  const { phase_number, phase_title, phase_tasks, phase_id } = phase;
  const taskListRef = useRef(null);
  const { getCompletedTasksInPhase } = useTaskCompletion();

  const completedTasks = getCompletedTasksInPhase(
    phase_number,
    phase_tasks.length
  );
  const progressPercentage =
    phase_tasks.length > 0
      ? Math.round((completedTasks / phase_tasks.length) * 100)
      : 0;

  const isCompleted =
    completedTasks === phase_tasks.length && phase_tasks.length > 0;

  // Handle navigation events for this phase
  useEffect(() => {
    const handlePhaseExpanded = (event) => {
      const { taskId, phaseId, phaseNumber: targetPhaseNumber } = event.detail;

      // Only handle if this is the target phase
      if (targetPhaseNumber === phase_number && phaseId === phase_id) {
        // Forward the event to TaskList - use a delay to ensure DOM is ready
        setTimeout(() => {
          if (taskListRef.current) {
            const taskListEvent = new CustomEvent("expandTask", {
              detail: { taskId },
              bubbles: false,
            });
            taskListRef.current.dispatchEvent(taskListEvent);
          }
        }, 150); // Increased delay to ensure phase expansion animation completes
      }
    };

    document.addEventListener("phaseExpanded", handlePhaseExpanded);
    return () => {
      document.removeEventListener("phaseExpanded", handlePhaseExpanded);
    };
  }, [phase_number, phase_id]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        isCompleted
          ? "border-l-4 border-green-500"
          : isActive && !isExpanded
          ? "border-l-4 border-blue-500"
          : ""
      }`}
    >
      <div
        className={`px-6 py-4 cursor-pointer flex justify-between items-center ${
          isExpanded
            ? "bg-blue-50 dark:bg-gray-700"
            : isCompleted
            ? "bg-green-50 dark:bg-green-900/20"
            : isActive
            ? "bg-blue-50/50 dark:bg-gray-700/50"
            : ""
        }`}
        onClick={onClick}
      >
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span
              className={`inline-block text-white text-sm font-semibold px-3 py-1 rounded-full mr-3 ${
                isCompleted
                  ? "bg-green-600"
                  : isActive
                  ? "bg-blue-600"
                  : "bg-blue-500"
              }`}
            >
              Phase {phase_number}
            </span>
            <span
              className={`text-lg font-semibold ${
                isCompleted
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-800 dark:text-white"
              }`}
            >
              {phase_title}
            </span>

            {isCompleted && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Completed
              </span>
            )}
          </div>

          <div className="flex items-center">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2 flex-grow">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${
                  isCompleted ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {completedTasks}/{phase_tasks.length} tasks
            </span>
          </div>
        </div>

        <svg
          className={`w-5 h-5 ml-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
            isExpanded ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <TaskList
            ref={taskListRef}
            tasks={phase_tasks}
            phaseNumber={phase_number}
          />
        </div>
      )}
    </div>
  );
};

export default Phase;
