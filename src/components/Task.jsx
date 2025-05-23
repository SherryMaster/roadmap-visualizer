import { useState, useEffect } from "react";
import TaskDetail from "./TaskDetail";
import { useTaskCompletion } from "../context/TaskCompletionContext";

const Task = ({ task, isExpanded, onClick, phaseNumber, taskIndex }) => {
  const { task_title, task_summary } = task;
  const { toggleTaskCompletion, isTaskCompleted } = useTaskCompletion();
  const [completed, setCompleted] = useState(false);
  const [animateCompletion, setAnimateCompletion] = useState(false);

  // Check if task is completed on initial render
  useEffect(() => {
    setCompleted(isTaskCompleted(phaseNumber, taskIndex));
  }, [phaseNumber, taskIndex, isTaskCompleted]);

  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking checkbox
    toggleTaskCompletion(phaseNumber, taskIndex);

    // If task is being marked as completed, trigger animation
    if (!completed) {
      setAnimateCompletion(true);
      setTimeout(() => setAnimateCompletion(false), 1000);
    }

    setCompleted(!completed);
  };

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ${
        completed ? "border-l-4 border-green-500" : ""
      } ${animateCompletion ? "animate-pulse" : ""}`}
    >
      <div
        className={`px-4 py-3 cursor-pointer ${
          isExpanded
            ? "bg-blue-100 dark:bg-gray-800"
            : completed
            ? "bg-green-50 dark:bg-green-900/20"
            : ""
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-1" onClick={onClick}>
            <h3
              className={`text-md font-medium ml-2 ${
                completed
                  ? "text-green-700 dark:text-green-400 line-through"
                  : "text-gray-800 dark:text-white"
              }`}
            >
              {task_title}
            </h3>
          </div>

          <div className="flex items-center">
            <div
              className="relative flex items-center justify-center mr-3"
              onClick={handleCheckboxClick}
            >
              <input
                type="checkbox"
                checked={completed}
                onChange={() => {}} // Handled by onClick to prevent event bubbling issues
                className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer transition-colors"
              />
              {animateCompletion && (
                <span className="absolute flex h-10 w-10 -top-2.5 -left-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                </span>
              )}
            </div>

            <svg
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                isExpanded ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              onClick={onClick}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
        <div onClick={onClick}>
          <p
            className={`text-sm mt-1 ${
              completed
                ? "text-green-600 dark:text-green-400 line-through"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {task_summary}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
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
