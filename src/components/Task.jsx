import { useState, useEffect } from "react";
import TaskDetail from "./TaskDetail";
import { useTaskCompletion } from "../context/TaskCompletionContext";
import configManager from "../utils/ConfigManager";
import Tooltip from "./Tooltip";

const Task = ({ task, isExpanded, onClick, phaseNumber, taskIndex }) => {
  const { task_title, task_summary, task_dependencies } = task;
  const {
    toggleTaskCompletion,
    toggleTaskCompletionWithValidation,
    isTaskCompleted,
    getDependencyStatus,
    completedTasks,
  } = useTaskCompletion();
  const [completed, setCompleted] = useState(false);
  const [animateCompletion, setAnimateCompletion] = useState(false);
  const [canComplete, setCanComplete] = useState(true);
  const [dependencyStatus, setDependencyStatus] = useState(null);

  // Check if task is completed and dependencies on initial render and updates
  useEffect(() => {
    setCompleted(isTaskCompleted(phaseNumber, taskIndex));

    // Check dependency status
    if (task_dependencies && task_dependencies.length > 0) {
      const depStatus = getDependencyStatus(task_dependencies);
      setDependencyStatus(depStatus);
      setCanComplete(depStatus.canComplete);
    } else {
      setCanComplete(true);
      setDependencyStatus(null);
    }
  }, [
    phaseNumber,
    taskIndex,
    isTaskCompleted,
    task_dependencies,
    getDependencyStatus,
    completedTasks, // Add completedTasks to trigger re-evaluation when any task completion changes
  ]);

  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking checkbox

    // If trying to complete a task, check dependencies first
    if (!completed && task_dependencies && task_dependencies.length > 0) {
      const success = toggleTaskCompletionWithValidation(
        phaseNumber,
        taskIndex,
        task_dependencies
      );

      if (!success) {
        // Task completion was blocked due to dependencies
        // Show a visual indication or alert
        alert(
          `Cannot complete this task. Please complete all required dependencies first.\n\nRequired: ${
            dependencyStatus?.requiredCompleted || 0
          }/${dependencyStatus?.requiredTotal || 0} completed`
        );
        return;
      }
    } else {
      // No dependencies or unchecking, proceed normally
      toggleTaskCompletion(phaseNumber, taskIndex);
    }

    // If task is being marked as completed, trigger animation
    if (!completed) {
      setAnimateCompletion(true);
      setTimeout(() => setAnimateCompletion(false), 1000);
    }

    setCompleted(!completed);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 ${
        completed
          ? "border-l-4 border-green-500 bg-green-50/30 dark:bg-green-900/10"
          : ""
      } ${animateCompletion ? "animate-pulse" : ""}`}
      data-task-id={task.task_id}
      data-phase-id={task.phase_id || `P${phaseNumber}`}
    >
      <div
        className={`px-6 py-4 cursor-pointer transition-colors duration-200 ${
          isExpanded
            ? "bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800"
            : completed
            ? "bg-green-50/50 dark:bg-green-900/10"
            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-1" onClick={onClick}>
            <div className="flex items-center space-x-3">
              {/* Task status icon */}
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  completed
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-500"
                }`}
              >
                {completed && (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <div className="flex items-center space-x-2">
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

                <h3
                  className={`text-lg font-semibold task-title-highlight transition-colors duration-200 ${
                    completed
                      ? "text-green-700 dark:text-green-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {task_title}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Completion toggle button */}
            <Tooltip
              content={
                !completed && !canComplete
                  ? `Complete required dependencies first (${
                      dependencyStatus?.requiredCompleted || 0
                    }/${dependencyStatus?.requiredTotal || 0})`
                  : completed
                  ? "Mark task as incomplete"
                  : "Mark task as complete"
              }
              position="top"
              maxWidth="250px"
            >
              <button
                onClick={handleCheckboxClick}
                disabled={!completed && !canComplete}
                className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                  !completed && !canComplete
                    ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                    : completed
                    ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400"
                    : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                }`}
              >
                {completed ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}

                {animateCompletion && (
                  <span className="absolute flex h-10 w-10 -top-1 -left-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-green-400 opacity-75"></span>
                  </span>
                )}
              </button>
            </Tooltip>

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
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
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
        <div onClick={onClick} className="mt-3">
          <p
            className={`text-sm leading-relaxed ${
              completed
                ? "text-green-600 dark:text-green-400"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {task_summary}
          </p>

          {/* Dependency status indicator */}
          {!completed &&
            dependencyStatus &&
            dependencyStatus.requiredTotal > 0 && (
              <div
                className={`inline-flex items-center text-xs mt-3 px-3 py-2 rounded-lg font-medium ${
                  canComplete
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border border-green-200 dark:border-green-800"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {canComplete ? (
                  <>
                    <svg
                      className="w-3 h-3 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    All required dependencies completed
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Dependencies: {dependencyStatus.requiredCompleted}/
                    {dependencyStatus.requiredTotal} required
                  </>
                )}
              </div>
            )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <TaskDetail
            detail={task.task_detail}
            task={task}
            taskId={task.task_id}
            phaseNumber={phaseNumber}
            allPhases={window.roadmapData ? window.roadmapData.roadmap : null}
          />
        </div>
      )}
    </div>
  );
};

export default Task;
