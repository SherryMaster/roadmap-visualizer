import { useState, useCallback, useEffect } from "react";
import { useTaskCompletion } from "../../context/TaskCompletionContext";

const TaskDependencies = ({
  dependencies,
  allPhases,
  allowNavigation = true,
  showQuickActions = true,
  showProgressBar = true,
  enableGrouping = true,
}) => {
  const {
    isTaskCompletedById,
    getDependencyStatus,
    toggleTaskCompletionWithValidation,
    completedTasks,
  } = useTaskCompletion();

  const [expandedGroups, setExpandedGroups] = useState({
    required: true,
    recommended: true,
    optional: false,
  });
  const [navigatingTo, setNavigatingTo] = useState(null);
  const [dependencyStatus, setDependencyStatus] = useState(null);

  // Update dependency status when completedTasks changes
  useEffect(() => {
    if (dependencies && dependencies.length > 0) {
      const status = getDependencyStatus(dependencies);
      setDependencyStatus(status);
    }
  }, [dependencies, getDependencyStatus, completedTasks]);

  if (!dependencies || dependencies.length === 0) {
    return null;
  }

  // Function to find task title by phase_id and task_id
  const getTaskInfo = (phaseId, taskId) => {
    if (!allPhases) {
      console.warn("No phases data available");
      return { title: taskId, phase: phaseId, found: false };
    }

    // Handle both assembled roadmap structure (roadmap.phases) and direct array structure
    const phases = allPhases.phases || allPhases;

    if (!Array.isArray(phases)) {
      console.warn("Invalid phases structure:", allPhases);
      return { title: taskId, phase: phaseId, found: false };
    }

    for (const phase of phases) {
      if (phase.phase_id === phaseId) {
        if (phase.phase_tasks && Array.isArray(phase.phase_tasks)) {
          for (const task of phase.phase_tasks) {
            if (task.task_id === taskId) {
              return {
                title: task.task_title || taskId, // Fallback to taskId if no title
                phase: phase.phase_title || phaseId, // Fallback to phaseId if no title
                phaseNumber: phase.phase_number,
                found: true,
              };
            }
          }
        }
      }
    }

    // If not found, return a more user-friendly error
    console.warn(`Task not found: ${taskId} in phase ${phaseId}`);
    return {
      title: `Task ${taskId}`,
      phase: `Phase ${phaseId}`,
      found: false,
    };
  };

  // Enhanced navigation with auto-expansion and improved visual feedback
  const handleDependencyClick = useCallback(
    async (phaseId, taskId) => {
      if (!allowNavigation) {
        console.log("Navigation disabled");
        return;
      }

      console.log("Starting navigation to:", { phaseId, taskId });
      setNavigatingTo(`${phaseId}-${taskId}`);

      try {
        // First, emit navigation event to trigger auto-expansion
        const navigationEvent = new CustomEvent("navigateToTask", {
          detail: { phaseId, taskId },
          bubbles: true,
        });
        document.dispatchEvent(navigationEvent);
        console.log("Navigation event dispatched");

        // Wait for expansions to complete with multiple checks
        let targetElement = null;
        let attempts = 0;
        const maxAttempts = 15; // Increased for better reliability
        const checkInterval = 250; // Slightly longer interval

        while (!targetElement && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, checkInterval));

          // Try multiple selector strategies
          const selectors = [
            `[data-task-id="${taskId}"][data-phase-id="${phaseId}"]`,
            `[data-task-id="${taskId}"]`,
            `[data-phase-id="${phaseId}"] [data-task-id="${taskId}"]`,
          ];

          for (const selector of selectors) {
            targetElement = document.querySelector(selector);
            if (targetElement) {
              console.log(`Found target element with selector: ${selector}`);
              break;
            }
          }

          attempts++;
          console.log(`Navigation attempt ${attempts}/${maxAttempts}`);

          if (targetElement) {
            // Check if element is actually visible (not in collapsed state)
            const rect = targetElement.getBoundingClientRect();
            const isVisible =
              rect.width > 0 &&
              rect.height > 0 &&
              targetElement.offsetParent !== null;

            if (!isVisible) {
              console.log(
                "Target element found but not visible, continuing..."
              );
              targetElement = null; // Reset to continue waiting
            } else {
              console.log("Target element found and visible");
            }
          }
        }

        if (targetElement) {
          console.log("Successfully found target element, applying highlights");

          // Apply subtle highlight effect to the task card
          targetElement.classList.add("dependency-highlight");

          // Find and enhance the task title with professional highlighting
          const taskTitle =
            targetElement.querySelector(".task-title-highlight") ||
            targetElement.querySelector("h3") ||
            targetElement.querySelector("[class*='task-title']");

          if (taskTitle) {
            console.log("Found task title element, applying highlighting");
            // Apply professional title highlighting
            taskTitle.classList.add("task-title-highlighted");
            taskTitle.classList.add("task-title-navigation-indicator");
          } else {
            console.log("Could not find task title element");
          }

          // Smooth scroll to target with a slight delay for better UX
          setTimeout(() => {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
            console.log("Scrolled to target element");
          }, 150);

          // Remove highlight after 3 seconds for better visibility
          setTimeout(() => {
            targetElement.classList.remove("dependency-highlight");

            // Remove professional title highlighting
            if (taskTitle) {
              taskTitle.classList.remove("task-title-highlighted");
              taskTitle.classList.remove("task-title-navigation-indicator");
            }
            console.log("Removed highlighting");
          }, 3000);
        } else {
          console.warn(
            "Could not navigate to target task after all attempts:",
            {
              phaseId,
              taskId,
              attempts,
              maxAttempts,
            }
          );

          // Show user feedback for failed navigation
          const taskInfo = getTaskInfo(phaseId, taskId);
          if (taskInfo.found) {
            alert(
              `Could not navigate to "${taskInfo.title}". The task may be in a collapsed section. Please try expanding the relevant phase manually.`
            );
          } else {
            alert(`Task not found: ${taskId} in phase ${phaseId}`);
          }
        }
      } catch (error) {
        console.error("Navigation failed with error:", error);
        alert("Navigation failed. Please try again.");
      } finally {
        setTimeout(() => {
          setNavigatingTo(null);
        }, 1000);
      }
    },
    [allowNavigation, getTaskInfo]
  );

  // Group dependencies by type
  const groupedDependencies = useCallback(() => {
    if (!enableGrouping) {
      return { all: dependencies };
    }

    const groups = {
      required: dependencies.filter(
        (dep) => dep.dependency_type === "required"
      ),
      recommended: dependencies.filter(
        (dep) => dep.dependency_type === "recommended"
      ),
      optional: dependencies.filter(
        (dep) => dep.dependency_type === "optional"
      ),
    };

    // Sort within each group by completion status (incomplete first)
    Object.keys(groups).forEach((groupType) => {
      groups[groupType].sort((a, b) => {
        const aCompleted = isTaskCompletedById(a.phase_id, a.task_id);
        const bCompleted = isTaskCompletedById(b.phase_id, b.task_id);
        return aCompleted - bCompleted;
      });
    });

    return groups;
  }, [dependencies, enableGrouping, isTaskCompletedById]);

  // Toggle group expansion
  const toggleGroup = (groupType) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupType]: !prev[groupType],
    }));
  };

  // Handle quick completion action
  const handleQuickComplete = useCallback(
    async (phaseId, taskId, e) => {
      e.stopPropagation();

      for (let phaseIndex = 0; phaseIndex < allPhases.length; phaseIndex++) {
        const phase = allPhases[phaseIndex];
        if (phase.phase_id === phaseId) {
          for (
            let taskIndex = 0;
            taskIndex < phase.phase_tasks.length;
            taskIndex++
          ) {
            const task = phase.phase_tasks[taskIndex];
            if (task.task_id === taskId) {
              const success = toggleTaskCompletionWithValidation(
                phase.phase_number,
                taskIndex,
                task.task_dependencies || []
              );

              if (!success) {
                alert("Cannot complete this task due to its own dependencies.");
              }
              return;
            }
          }
        }
      }
    },
    [allPhases, toggleTaskCompletionWithValidation]
  );

  // Professional SVG icons
  const getStatusIcon = (dependency) => {
    const isCompleted = isTaskCompletedById(
      dependency.phase_id,
      dependency.task_id
    );

    if (isCompleted) {
      return (
        <svg
          className="w-5 h-5 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    switch (dependency.dependency_type) {
      case "required":
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "recommended":
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "optional":
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const groups = groupedDependencies();

  // Render individual dependency item (compact single-line)
  const renderDependencyCard = (dependency, index) => {
    const taskInfo = getTaskInfo(dependency.phase_id, dependency.task_id);
    const isCompleted = isTaskCompletedById(
      dependency.phase_id,
      dependency.task_id
    );
    const isNavigating =
      navigatingTo === `${dependency.phase_id}-${dependency.task_id}`;

    const handleClick = () => {
      if (taskInfo.found && allowNavigation) {
        handleDependencyClick(dependency.phase_id, dependency.task_id);
      }
    };

    return (
      <div
        key={`${dependency.phase_id}-${dependency.task_id}-${index}`}
        className={`
          flex items-center justify-between py-2 px-3 rounded-md transition-all duration-200
          ${
            isNavigating
              ? "bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-400"
              : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }
          ${allowNavigation && taskInfo.found ? "cursor-pointer" : ""}
          ${!taskInfo.found ? "opacity-75" : ""}
        `}
        onClick={handleClick}
      >
        {/* Left side: Status icon and task info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Status icon */}
          <div className="flex-shrink-0">{getStatusIcon(dependency)}</div>

          {/* Task title and phase */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {" "}
              <span
                className={`text-sm font-medium truncate ${
                  taskInfo.found
                    ? isCompleted
                      ? "text-green-700 dark:text-green-400"
                      : "text-gray-900 dark:text-white"
                    : "text-red-600 dark:text-red-400"
                }`}
                title={taskInfo.title}
              >
                {taskInfo.title}
              </span>
              {/* Navigation indicator */}
              {allowNavigation && taskInfo.found && (
                <svg
                  className="w-3 h-3 text-blue-500 dark:text-blue-400 opacity-60 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              )}
            </div>

            {/* Phase name - smaller text */}
            <span
              className="text-xs text-gray-500 dark:text-gray-400 truncate block"
              title={taskInfo.phase}
            >
              {taskInfo.phase}
            </span>
          </div>
        </div>

        {/* Right side: Actions and loading */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Loading indicator */}
          {isNavigating && (
            <div className="w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          )}

          {/* Quick complete button */}
          {showQuickActions &&
            taskInfo.found &&
            !isCompleted &&
            !isNavigating && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickComplete(
                    dependency.phase_id,
                    dependency.task_id,
                    e
                  );
                }}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/50 rounded transition-colors"
                title="Mark as complete"
              >
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
              </button>
            )}

          {/* Error indicator for missing tasks */}
          {!taskInfo.found && (
            <div className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Missing</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Compact header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Dependencies ({dependencies.length})
            </h3>
          </div>

          {/* Compact progress indicator */}
          {showProgressBar &&
            dependencyStatus &&
            dependencyStatus.requiredTotal > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {dependencyStatus.requiredCompleted}/
                  {dependencyStatus.requiredTotal} required
                </span>
                <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      dependencyStatus.canComplete
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${
                        (dependencyStatus.requiredCompleted /
                          dependencyStatus.requiredTotal) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Compact dependency list */}
      <div className="max-h-80 overflow-y-auto">
        {enableGrouping ? (
          <div>
            {Object.entries(groups).map(([groupType, groupDependencies]) => {
              if (groupDependencies.length === 0) return null;

              const groupConfig = {
                required: {
                  title: "Required",
                  textClass: "text-red-600 dark:text-red-400",
                  badgeClass:
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
                },
                recommended: {
                  title: "Recommended",
                  textClass: "text-yellow-600 dark:text-yellow-400",
                  badgeClass:
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
                },
                optional: {
                  title: "Optional",
                  textClass: "text-blue-600 dark:text-blue-400",
                  badgeClass:
                    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
                },
              };

              const config = groupConfig[groupType];
              const isExpanded = expandedGroups[groupType];
              const completedCount = groupDependencies.filter((dep) =>
                isTaskCompletedById(dep.phase_id, dep.task_id)
              ).length;

              return (
                <div
                  key={groupType}
                  className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  {/* Compact group header */}
                  <button
                    onClick={() => toggleGroup(groupType)}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-medium ${config.textClass}`}
                      >
                        {config.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-xs font-medium ${config.badgeClass} rounded`}
                      >
                        {completedCount}/{groupDependencies.length}
                      </span>
                    </div>

                    <svg
                      className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
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
                  </button>

                  {/* Group content */}
                  {isExpanded && (
                    <div className="px-4 pb-2 space-y-1">
                      {groupDependencies.map((dependency, index) =>
                        renderDependencyCard(
                          dependency,
                          `${groupType}-${index}`
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {dependencies.map((dependency, index) =>
              renderDependencyCard(dependency, index)
            )}
          </div>
        )}
      </div>

      {/* Compact footer hint */}
      {allowNavigation &&
        dependencies.some(
          (dep) => getTaskInfo(dep.phase_id, dep.task_id).found
        ) && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-3a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zM9 9a1 1 0 112 0 1 1 0 01-2 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Click to navigate to task</span>
            </div>
          </div>
        )}
    </div>
  );
};

export default TaskDependencies;
