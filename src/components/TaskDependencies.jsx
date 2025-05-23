import { useState, useCallback } from "react";
import { useTaskCompletion } from "../context/TaskCompletionContext";

const TaskDependencies = ({
  dependencies,
  allPhases,
  showType = true,
  allowNavigation = true,
  showQuickActions = true,
  showProgressBar = true,
  enableGrouping = true,
}) => {
  const {
    isTaskCompletedById,
    getDependencyStatus,
    toggleTaskCompletionWithValidation,
  } = useTaskCompletion();

  const [expandedGroups, setExpandedGroups] = useState({
    required: true,
    recommended: true,
    optional: false,
  });
  const [navigatingTo, setNavigatingTo] = useState(null);

  if (!dependencies || dependencies.length === 0) {
    return null;
  }

  // Get dependency status information
  const dependencyStatus = getDependencyStatus(dependencies);

  // Function to find task title by phase_id and task_id
  const getTaskInfo = (phaseId, taskId) => {
    if (!allPhases) return { title: taskId, phase: phaseId, found: false };

    for (const phase of allPhases) {
      if (phase.phase_id === phaseId) {
        for (const task of phase.phase_tasks) {
          if (task.task_id === taskId) {
            return {
              title: task.task_title,
              phase: phase.phase_title,
              found: true,
            };
          }
        }
      }
    }
    return { title: taskId, phase: phaseId, found: false };
  };

  // Enhanced navigation with auto-expansion and improved visual feedback
  const handleDependencyClick = useCallback(
    async (phaseId, taskId) => {
      if (!allowNavigation) return;

      setNavigatingTo(`${phaseId}-${taskId}`);

      try {
        // First, emit navigation event to trigger auto-expansion
        const navigationEvent = new CustomEvent("navigateToTask", {
          detail: { phaseId, taskId },
          bubbles: true,
        });
        document.dispatchEvent(navigationEvent);

        // Wait for expansions to complete with multiple checks
        let targetElement = null;
        let attempts = 0;
        const maxAttempts = 12; // Increased for better reliability
        const checkInterval = 200;

        while (!targetElement && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, checkInterval));

          const selector = `[data-task-id="${taskId}"][data-phase-id="${phaseId}"]`;
          targetElement = document.querySelector(selector);
          attempts++;

          if (targetElement) {
            // Check if element is actually visible (not in collapsed state)
            const isVisible = targetElement.offsetParent !== null;

            if (!isVisible) {
              targetElement = null; // Reset to continue waiting
            }
          }
        }

        if (targetElement) {
          // Apply enhanced highlight effect with immediate visual feedback
          targetElement.classList.add("dependency-highlight");

          // Fallback: Apply inline styles for immediate visual feedback
          const originalStyles = {
            transform: targetElement.style.transform,
            boxShadow: targetElement.style.boxShadow,
            background: targetElement.style.background,
            border: targetElement.style.border,
            zIndex: targetElement.style.zIndex,
            position: targetElement.style.position,
          };

          // Apply fallback styles for guaranteed visibility
          targetElement.style.transform = "scale(1.03)";
          targetElement.style.boxShadow =
            "0 0 30px rgba(59, 130, 246, 0.6), inset 0 0 20px rgba(59, 130, 246, 0.1)";
          targetElement.style.background =
            "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))";
          targetElement.style.border = "3px solid rgba(59, 130, 246, 0.5)";
          targetElement.style.zIndex = "20";
          targetElement.style.position = "relative";
          targetElement.style.borderRadius = "8px";

          // Find and enhance the task title
          const taskTitle = targetElement.querySelector(
            ".task-title-highlight"
          );
          let titleElement = taskTitle;

          if (taskTitle) {
            taskTitle.classList.add("dependency-title-active");
          } else {
            // Try alternative selectors
            const titleAlternative = targetElement.querySelector("h3");
            if (titleAlternative) {
              titleAlternative.classList.add(
                "task-title-highlight",
                "dependency-title-active"
              );
              titleElement = titleAlternative;
            }
          }

          // Apply inline styles to title for immediate visual feedback
          if (titleElement) {
            const originalTitleStyles = {
              color: titleElement.style.color,
              fontWeight: titleElement.style.fontWeight,
              textShadow: titleElement.style.textShadow,
            };

            titleElement.style.color = "#1d4ed8"; // Blue-700
            titleElement.style.fontWeight = "bold";
            titleElement.style.textShadow = "0 0 8px rgba(59, 130, 246, 0.6)";

            // Add location pin icon
            if (!titleElement.textContent.startsWith("📍")) {
              titleElement.textContent = "📍 " + titleElement.textContent;
            }

            // Store original styles for cleanup
            titleElement._originalTitleStyles = originalTitleStyles;
          }

          // Add a subtle shake effect to draw attention
          targetElement.style.animation =
            "dependency-attention-shake 0.5s ease-in-out";

          // Smooth scroll to target with a slight delay for better UX
          setTimeout(() => {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }, 100);

          // Remove shake animation after it completes
          setTimeout(() => {
            targetElement.style.animation = "";
          }, 500);

          // Remove highlight after 3 seconds
          setTimeout(() => {
            targetElement.classList.remove("dependency-highlight");

            // Restore original styles
            targetElement.style.transform = originalStyles.transform || "";
            targetElement.style.boxShadow = originalStyles.boxShadow || "";
            targetElement.style.background = originalStyles.background || "";
            targetElement.style.border = originalStyles.border || "";
            targetElement.style.zIndex = originalStyles.zIndex || "";
            targetElement.style.position = originalStyles.position || "";
            targetElement.style.borderRadius = "";

            // Restore title styles
            if (titleElement && titleElement._originalTitleStyles) {
              titleElement.style.color =
                titleElement._originalTitleStyles.color || "";
              titleElement.style.fontWeight =
                titleElement._originalTitleStyles.fontWeight || "";
              titleElement.style.textShadow =
                titleElement._originalTitleStyles.textShadow || "";

              // Remove location pin icon
              if (titleElement.textContent.startsWith("📍 ")) {
                titleElement.textContent =
                  titleElement.textContent.substring(2);
              }

              delete titleElement._originalTitleStyles;
            }

            if (taskTitle) {
              taskTitle.classList.remove("dependency-title-active");
            }
            const titleAlternative = targetElement.querySelector("h3");
            if (titleAlternative) {
              titleAlternative.classList.remove("dependency-title-active");
            }
          }, 3000);
        } else {
          console.warn("Could not navigate to target task:", {
            phaseId,
            taskId,
          });
        }
      } catch (error) {
        console.warn("Navigation failed:", error);
      } finally {
        setTimeout(() => {
          setNavigatingTo(null);
        }, 1000);
      }
    },
    [allowNavigation]
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

  // Render individual dependency card
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
        className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
          isNavigating
            ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400 ring-opacity-50"
            : ""
        } ${allowNavigation && taskInfo.found ? "cursor-pointer" : ""}`}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          {/* Status icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon(dependency)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4
                  className={`text-sm font-medium ${
                    taskInfo.found
                      ? isCompleted
                        ? "text-green-700 dark:text-green-400 line-through"
                        : "text-gray-900 dark:text-white"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {taskInfo.title}
                  {allowNavigation && taskInfo.found && (
                    <svg
                      className="inline w-3 h-3 ml-1 text-blue-500"
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
                </h4>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {taskInfo.phase}
                </p>

                {/* Dependency type badge - only show if not in grouped mode */}
                {showType && !enableGrouping && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      dependency.dependency_type === "required"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : dependency.dependency_type === "recommended"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {dependency.dependency_type}
                  </span>
                )}

                {/* Error state */}
                {!taskInfo.found && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                    Missing: {dependency.phase_id} → {dependency.task_id}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              {showQuickActions && taskInfo.found && !isCompleted && (
                <button
                  onClick={(e) =>
                    handleQuickComplete(
                      dependency.phase_id,
                      dependency.task_id,
                      e
                    )
                  }
                  className="ml-3 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 rounded transition-colors"
                  title="Mark as complete"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with progress */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Dependencies
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {dependencies.length}
            </span>
          </div>

          {/* Progress indicator */}
          {showProgressBar && dependencyStatus.requiredTotal > 0 && (
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <span
                  className={
                    dependencyStatus.canComplete
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {dependencyStatus.requiredCompleted}/
                  {dependencyStatus.requiredTotal} required
                </span>
              </div>

              {/* Compact progress bar */}
              <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dependencyStatus.canComplete ? "bg-green-500" : "bg-red-500"
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

        {/* Status message - only show if blocked */}
        {dependencyStatus.requiredTotal > 0 &&
          !dependencyStatus.canComplete && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200">
              <span className="font-medium">
                Complete required dependencies to mark this task as complete.
              </span>
            </div>
          )}
      </div>

      {/* Dependency groups */}
      <div className="p-4 space-y-3">
        {enableGrouping ? (
          Object.entries(groups).map(([groupType, groupDependencies]) => {
            if (groupDependencies.length === 0) return null;

            const groupConfig = {
              required: {
                title: "Required",
                bgClass:
                  "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30",
                textClass: "text-red-600 dark:text-red-400",
                badgeClass:
                  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
              },
              recommended: {
                title: "Recommended",
                bgClass:
                  "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
                textClass: "text-yellow-600 dark:text-yellow-400",
                badgeClass:
                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
              },
              optional: {
                title: "Optional",
                bgClass:
                  "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30",
                textClass: "text-blue-600 dark:text-blue-400",
                badgeClass:
                  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
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
                className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
              >
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(groupType)}
                  className={`w-full px-3 py-2 flex items-center justify-between ${config.bgClass} transition-colors`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${config.textClass}`}>
                      {config.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-xs font-medium ${config.badgeClass} rounded-full`}
                    >
                      {completedCount}/{groupDependencies.length}
                    </span>
                  </div>

                  <svg
                    className={`w-4 h-4 ${
                      config.textClass
                    } transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
                  <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {groupDependencies.map((dependency, index) =>
                      renderDependencyCard(dependency, index)
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="space-y-2">
            {dependencies.map((dependency, index) =>
              renderDependencyCard(dependency, index)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDependencies;
