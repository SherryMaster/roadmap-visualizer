import { useEffect, useRef } from "react";
import PublicTaskList from "../task/PublicTaskList";
import Tooltip from "../tooltips/Tooltip";

const PublicPhase = ({ phase, isExpanded, isActive, onClick }) => {
  const { phase_number, phase_title, phase_tasks, phase_id } = phase;
  const taskListRef = useRef(null);

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
        isActive && !isExpanded ? "border-l-4 border-blue-500" : ""
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
                  isActive ? "bg-blue-600" : "bg-blue-500"
                }`}
              >
                Phase {phase_number}
              </span>
              <span className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                {phase_title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap flex-shrink-0">
                {phase_tasks.length} tasks
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <Tooltip
              content={isExpanded ? "Collapse phase" : "Expand phase"}
              position="top"
              maxWidth="150px"
            >
              <div className="text-gray-400 dark:text-gray-500">
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </Tooltip>
          </div>
        </div>
      </Tooltip>

      {isExpanded && (
        <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <PublicTaskList
            ref={taskListRef}
            tasks={phase_tasks}
            phaseNumber={phase_number}
          />
        </div>
      )}
    </div>
  );
};

export default PublicPhase;
