import { useEffect, useRef } from "react";
import TaskList from "../task/TaskList";
import { useTaskCompletion } from "../../context/TaskCompletionContext";
import Tooltip from "../tooltips/Tooltip";
import { SuccessTooltip } from "../tooltips/EnhancedTooltip";
import { TaskSkeleton } from "../feedback/RoadmapSkeleton";

const Phase = ({ phase, isExpanded, isActive, onClick, isLoading = false, isLoaded = true }) => {
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
      <Tooltip
        content={
          isExpanded
            ? "Click to collapse and hide tasks"
            : "Click to expand and view tasks"
        }
        position="top"
        maxWidth="250px"
      >
        <div
          className={`px-4 sm:px-6 py-3 sm:py-4 cursor-pointer flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 ${
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
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center mb-2 gap-2 sm:gap-0">
              <span
                className={`inline-block text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full mr-0 sm:mr-3 self-start ${
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
                className={`text-base sm:text-lg font-semibold ${
                  isCompleted
                    ? "text-green-700 dark:text-green-400"
                    : "text-gray-800 dark:text-white"
                }`}
              >
                {phase_title}
              </span>

              {isCompleted && (
                <SuccessTooltip
                  content="All tasks in this phase have been completed"
                  position="top"
                  maxWidth="250px"
                >
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
                </SuccessTooltip>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Tooltip
                content={`Progress: ${progressPercentage}% complete (${completedTasks} of ${phase_tasks.length} tasks)`}
                position="top"
                maxWidth="300px"
              >
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 min-w-[80px]">
                  <div
                    className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ease-in-out ${
                      isCompleted ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </Tooltip>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap flex-shrink-0">
                {completedTasks}/{phase_tasks.length} tasks
              </span>
            </div>
          </div>

          <svg
            className={`w-5 h-5 ml-2 sm:ml-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${
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
      </Tooltip>

      {isExpanded && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 mb-4">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading tasks...</span>
              </div>
              {Array.from({ length: 2 }).map((_, index) => (
                <TaskSkeleton key={index} />
              ))}
            </div>
          ) : !isLoaded && phase_tasks.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Tasks will load when you expand this phase</span>
              </div>
            </div>
          ) : (
            <TaskList
              ref={taskListRef}
              tasks={phase_tasks}
              phaseNumber={phase_number}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Phase;
