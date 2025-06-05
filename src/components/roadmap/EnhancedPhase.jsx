import { useEffect, useRef } from "react";
import TaskList from "../task/TaskList";
import { useTaskCompletion } from "../../context/TaskCompletionContext";
import Tooltip from "../tooltips/Tooltip";
import { SuccessTooltip } from "../tooltips/EnhancedTooltip";
import { 
  TaskSkeleton, 
  ProgressiveLoadingContainer,
  LoadingIndicator 
} from "../feedback/ImprovedSkeletons";

const EnhancedPhase = ({ 
  phase, 
  isExpanded, 
  isActive, 
  onClick, 
  isLoading = false, 
  isLoaded = true,
  hasError = false,
  error = null,
  onRetryLoad = null,
  expectedTaskCount = 0
}) => {
  const taskListRef = useRef(null);
  const { getPhaseProgress } = useTaskCompletion();

  const {
    phase_id,
    phase_number,
    phase_title,
    phase_description,
    phase_tasks = [],
    estimated_time,
    difficulty_level,
  } = phase;

  // Scroll to phase when it becomes active
  useEffect(() => {
    if (isActive && taskListRef.current) {
      taskListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isActive]);

  // Calculate progress
  const progress = getPhaseProgress(phase_number);
  const progressPercentage = Math.round(progress.percentage);

  // Determine the number of skeleton tasks to show
  const skeletonTaskCount = expectedTaskCount > 0 ? Math.min(expectedTaskCount, 4) : 2;

  // Create skeleton content for loading state
  const skeletonContent = (
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        <LoadingIndicator 
          message="Loading tasks..." 
          className="mb-4"
        />
        {Array.from({ length: skeletonTaskCount }).map((_, index) => (
          <TaskSkeleton key={index} />
        ))}
      </div>
    </div>
  );

  // Create error content
  const errorContent = (
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm font-medium text-red-900 dark:text-red-100">
            Failed to load tasks
          </span>
        </div>
        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
          {error || "An error occurred while loading the tasks for this phase."}
        </p>
        {onRetryLoad && (
          <button
            onClick={() => onRetryLoad(phase_id)}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Retry Loading</span>
          </button>
        )}
      </div>
    </div>
  );

  // Create actual task content
  const taskContent = (
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
      <TaskList
        ref={taskListRef}
        tasks={phase_tasks}
        phaseNumber={phase_number}
      />
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
      {/* Phase Header */}
      <div
        className={`p-4 sm:p-6 cursor-pointer transition-colors duration-200 ${
          isActive
            ? "bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700"
            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        aria-expanded={isExpanded}
        aria-controls={`phase-${phase_number}-content`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Phase Number Badge */}
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-semibold rounded-full">
                {phase_number}
              </span>
            </div>

            {/* Phase Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {phase_title}
            </h3>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}

            {/* Error Indicator */}
            {hasError && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm">Error</span>
              </div>
            )}
          </div>

          {/* Expand/Collapse Icon */}
          <div className="flex-shrink-0">
            <SuccessTooltip
              content={isExpanded ? "Collapse phase" : "Expand phase"}
              position="left"
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
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
            </SuccessTooltip>
          </div>
        </div>

        {/* Phase Description */}
        {phase_description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {phase_description}
          </p>
        )}

        {/* Phase Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          {estimated_time && (
            <Tooltip content="Estimated completion time">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{estimated_time}</span>
              </div>
            </Tooltip>
          )}

          {difficulty_level && (
            <Tooltip content="Difficulty level">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="capitalize">{difficulty_level}</span>
              </div>
            </Tooltip>
          )}

          {/* Task Count */}
          <Tooltip content="Number of tasks in this phase">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>
                {isLoaded ? phase_tasks.length : expectedTaskCount || "?"} tasks
              </span>
            </div>
          </Tooltip>
        </div>

        {/* Progress Bar */}
        {isLoaded && phase_tasks.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {progress.completed}/{progress.total} tasks ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Phase Content with Progressive Loading */}
      {isExpanded && (
        <div id={`phase-${phase_number}-content`}>
          {hasError ? (
            errorContent
          ) : (
            <ProgressiveLoadingContainer
              isLoading={isLoading}
              skeleton={skeletonContent}
              fadeInDuration="duration-500"
            >
              {taskContent}
            </ProgressiveLoadingContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedPhase;
