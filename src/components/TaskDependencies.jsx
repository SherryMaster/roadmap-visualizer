const TaskDependencies = ({
  dependencies,
  allPhases,
  showType = true,
  allowNavigation = false,
}) => {
  if (!dependencies || dependencies.length === 0) {
    return null;
  }

  // Function to find task title by phase_id and task_id (schema format)
  const getTaskInfo = (phaseId, taskId) => {
    if (!allPhases)
      return { title: "Unknown Task", phase: "Unknown Phase", found: false };

    // Find phase by phase_id (schema uses phase_id, not phase_number)
    const phase = allPhases.find((p) => p.phase_id === phaseId);
    if (!phase) {
      console.warn(`Phase not found: ${phaseId}`);
      return { title: "Unknown Task", phase: "Unknown Phase", found: false };
    }

    const task = phase.phase_tasks.find((t) => t.task_id === taskId);
    if (!task) {
      console.warn(`Task not found: ${taskId} in phase ${phaseId}`);
      return { title: "Unknown Task", phase: phase.phase_title, found: false };
    }

    return {
      title: task.task_title,
      phase: phase.phase_title,
      phaseId: phase.phase_id,
      taskId: task.task_id,
      found: true,
    };
  };

  // Function to get dependency type badge color
  const getDependencyTypeColor = (type) => {
    switch (type) {
      case "required":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "recommended":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "optional":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Dependencies
      </h4>
      <ul className="space-y-2">
        {dependencies.map((dependency, index) => {
          const taskInfo = getTaskInfo(dependency.phase_id, dependency.task_id);
          const typeColor = getDependencyTypeColor(dependency.dependency_type);

          return (
            <li key={index} className="flex items-start">
              <svg
                className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                ></path>
              </svg>
              <div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className={taskInfo.found ? "" : "text-red-500"}>
                    {taskInfo.title}
                  </span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    ({taskInfo.phase})
                  </span>
                </div>

                {/* Dependency type badge */}
                {showType && dependency.dependency_type && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColor} mt-1`}
                  >
                    {dependency.dependency_type}
                  </span>
                )}

                {/* Debug info for missing dependencies */}
                {!taskInfo.found && (
                  <div className="text-xs text-red-500 mt-1">
                    Missing: {dependency.phase_id} → {dependency.task_id}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TaskDependencies;
