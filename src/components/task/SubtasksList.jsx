import { useState } from "react";

const SubtasksList = ({
  subtasks,
  taskId,
  phaseNumber,
  isPublicView = false,
}) => {
  const [completedSubtasks, setCompletedSubtasks] = useState(() => {
    // Only load from localStorage if not in public view
    if (isPublicView) return {};
    const savedData = localStorage.getItem(`subtasks-${phaseNumber}-${taskId}`);
    return savedData ? JSON.parse(savedData) : {};
  });

  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const handleSubtaskToggle = (index) => {
    // Don't allow toggling in public view
    if (isPublicView) return;

    const newCompletedSubtasks = {
      ...completedSubtasks,
      [index]: !completedSubtasks[index],
    };

    setCompletedSubtasks(newCompletedSubtasks);

    // Save to localStorage
    localStorage.setItem(
      `subtasks-${phaseNumber}-${taskId}`,
      JSON.stringify(newCompletedSubtasks)
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
        <svg
          className="w-4 h-4 mr-2 text-purple-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Subtasks
      </h4>
      <ul className="space-y-3">
        {subtasks.map((subtask, index) => {
          // Create unique key for subtask
          const uniqueKey = `subtask-${phaseNumber}-${taskId}-${index}`;

          return (
            <li key={uniqueKey} className="flex items-start space-x-3">
              {!isPublicView ? (
                // Interactive checkbox for owners
                <>
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      id={`subtask-${phaseNumber}-${taskId}-${index}`}
                      type="checkbox"
                      checked={!!completedSubtasks[index]}
                      onChange={() => handleSubtaskToggle(index)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-colors duration-200"
                    />
                  </div>
                  <label
                    htmlFor={`subtask-${phaseNumber}-${taskId}-${index}`}
                    className={`text-sm leading-relaxed cursor-pointer transition-colors duration-200 ${
                      completedSubtasks[index]
                        ? "text-gray-500 dark:text-gray-500 line-through"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {subtask.description}
                  </label>
                </>
              ) : (
                // Static display for public view
                <>
                  <div className="flex items-center h-5 mt-0.5">
                    <div className="h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-600"></div>
                  </div>
                  <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {subtask.description}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SubtasksList;
