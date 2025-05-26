import { useTaskCompletion } from "../context/TaskCompletionContext";
import Tooltip from "./Tooltip";

const ProgressIndicator = ({ phases }) => {
  const { calculateOverallProgress, resetAllProgress } = useTaskCompletion();

  // Calculate the percentage of completion based on completed tasks
  const progress = calculateOverallProgress();

  // Determine progress status
  const getProgressStatus = () => {
    if (progress === 100) return "Completed";
    if (progress >= 75) return "Almost there!";
    if (progress >= 50) return "Halfway there!";
    if (progress >= 25) return "Good progress!";
    if (progress > 0) return "Just started";
    return "Not started";
  };

  // Get color class based on progress
  const getColorClass = () => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-blue-500";
    return "bg-blue-500";
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Roadmap Progress
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getProgressStatus()}
          </p>
        </div>
        <div className="flex items-center">
          <Tooltip
            content={`${progress}% of all tasks completed across all phases`}
            position="left"
            maxWidth="200px"
          >
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mr-2">
              {progress}%
            </span>
          </Tooltip>
          {progress > 0 && (
            <Tooltip
              content="Reset all task completion progress. This action cannot be undone."
              position="left"
              maxWidth="250px"
            >
              <button
                onClick={resetAllProgress}
                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                aria-label="Reset all progress"
              >
                Reset
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`${getColorClass()} h-3 rounded-full transition-all duration-500 ease-in-out relative`}
          style={{ width: `${progress}%` }}
        >
          {progress >= 10 && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="w-full h-full opacity-30 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
