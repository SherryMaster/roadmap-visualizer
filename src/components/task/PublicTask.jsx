import TaskDetail from "./TaskDetail";
import configManager from "../../utils/ConfigManager";
import Tooltip from "../tooltips/Tooltip";

const PublicTask = ({ task, isExpanded, onClick, phaseNumber, taskIndex }) => {
  const { task_title, task_summary } = task;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
      data-task-id={task.task_id}
      data-phase-id={task.phase_id || `P${phaseNumber}`}
    >
      <div
        className={`px-4 sm:px-6 py-3 sm:py-4 cursor-pointer transition-colors duration-200 ${
          isExpanded
            ? "bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800"
            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center flex-1 min-w-0" onClick={onClick}>
            <div className="flex items-center space-x-3">
              {/* Task status icon - static for public view */}
              <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500">
              </div>

              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {/* Task number badge - conditionally shown based on configuration */}
                {configManager.getComponentConfig("taskNumbering")
                  .showTaskNumbers && (
                  <Tooltip
                    content="Task number in this phase"
                    position="top"
                    maxWidth="150px"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full flex-shrink-0 cursor-help">
                      {task.task_number !== undefined
                        ? task.task_number
                        : taskIndex + 1}
                    </span>
                  </Tooltip>
                )}

                <h3 className="text-base sm:text-lg font-semibold task-title-highlight transition-colors duration-200 text-gray-900 dark:text-white">
                  {task_title}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Expand/collapse button */}
            <Tooltip
              content={
                isExpanded
                  ? "Collapse task details"
                  : "Expand to view task details"
              }
              position="top"
              maxWidth="200px"
            >
              <button
                onClick={onClick}
                className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? "transform rotate-180" : ""
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
              </button>
            </Tooltip>
          </div>
        </div>
        <div onClick={onClick} className="mt-3 sm:mt-3">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {task_summary}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <TaskDetail
            detail={task.task_detail}
            task={task}
            taskId={task.task_id}
            phaseNumber={phaseNumber}
            allPhases={window.roadmapData ? window.roadmapData.roadmap : null}
            isPublicView={true}
          />
        </div>
      )}
    </div>
  );
};

export default PublicTask;
