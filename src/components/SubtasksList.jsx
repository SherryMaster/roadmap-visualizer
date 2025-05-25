import { useState } from "react";

const SubtasksList = ({ subtasks, taskId, phaseNumber }) => {
  const [completedSubtasks, setCompletedSubtasks] = useState(() => {
    // Load from localStorage if available
    const savedData = localStorage.getItem(`subtasks-${phaseNumber}-${taskId}`);
    return savedData ? JSON.parse(savedData) : {};
  });

  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const handleSubtaskToggle = (index) => {
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
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Subtasks
      </h4>
      <ul className="space-y-2">
        {subtasks.map((subtask, index) => {
          // Create unique key for subtask
          const uniqueKey = `subtask-${phaseNumber}-${taskId}-${index}`;

          return (
            <li key={uniqueKey} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={`subtask-${phaseNumber}-${taskId}-${index}`}
                  type="checkbox"
                  checked={!!completedSubtasks[index]}
                  onChange={() => handleSubtaskToggle(index)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <label
                htmlFor={`subtask-${phaseNumber}-${taskId}-${index}`}
                className={`ml-3 text-sm ${
                  completedSubtasks[index]
                    ? "text-gray-500 dark:text-gray-500 line-through"
                    : "text-gray-700 dark:text-gray-300"
                } cursor-pointer`}
              >
                {subtask.description}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SubtasksList;
