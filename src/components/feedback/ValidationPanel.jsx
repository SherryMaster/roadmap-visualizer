import { useState, useEffect } from "react";
import { useEditor } from "../../context/EditorContext";

const ValidationPanel = () => {
  const { currentRoadmap, validationStatus } = useEditor();
  const [detailedValidation, setDetailedValidation] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (currentRoadmap) {
      analyzeRoadmap();
    }
  }, [currentRoadmap]);

  const analyzeRoadmap = () => {
    const analysis = {
      phases: [],
      totalTasks: 0,
      totalPhases: 0,
      warnings: [],
      suggestions: [],
      dependencies: {
        total: 0,
        broken: [],
        circular: [],
      },
    };

    const phases =
      currentRoadmap?.roadmap?.phases || currentRoadmap?.roadmap || [];
    analysis.totalPhases = phases.length;

    phases.forEach((phase) => {
      const phaseAnalysis = {
        phase_id: phase.phase_id,
        phase_title: phase.phase_title,
        taskCount: phase.phase_tasks?.length || 0,
        issues: [],
        warnings: [],
      };

      analysis.totalTasks += phaseAnalysis.taskCount;

      // Check for empty phases
      if (phaseAnalysis.taskCount === 0) {
        phaseAnalysis.warnings.push("Phase has no tasks");
      }

      // Analyze tasks
      if (phase.phase_tasks) {
        phase.phase_tasks.forEach((task) => {
          // Check for missing required fields
          if (!task.task_title?.trim()) {
            phaseAnalysis.issues.push(`Task ${task.task_id}: Missing title`);
          }
          if (!task.task_summary?.trim()) {
            phaseAnalysis.issues.push(`Task ${task.task_id}: Missing summary`);
          }

          // Analyze dependencies
          if (task.task_dependencies) {
            analysis.dependencies.total += task.task_dependencies.length;

            task.task_dependencies.forEach((dep) => {
              // Check if dependency exists
              const depPhase = phases.find((p) => p.phase_id === dep.phase_id);
              if (!depPhase) {
                analysis.dependencies.broken.push({
                  task: `${phase.phase_id}:${task.task_id}`,
                  dependency: `${dep.phase_id}:${dep.task_id}`,
                  reason: "Phase not found",
                });
                return;
              }

              const depTask = depPhase.phase_tasks?.find(
                (t) => t.task_id === dep.task_id
              );
              if (!depTask) {
                analysis.dependencies.broken.push({
                  task: `${phase.phase_id}:${task.task_id}`,
                  dependency: `${dep.phase_id}:${dep.task_id}`,
                  reason: "Task not found",
                });
              }
            });
          }
        });
      }

      analysis.phases.push(phaseAnalysis);
    });

    // Generate suggestions
    if (analysis.totalTasks === 0) {
      analysis.suggestions.push("Add tasks to your roadmap to get started");
    } else if (analysis.totalTasks < 5) {
      analysis.suggestions.push(
        "Consider adding more tasks for a comprehensive roadmap"
      );
    }

    if (analysis.dependencies.broken.length > 0) {
      analysis.suggestions.push(
        "Fix broken dependencies to ensure proper task flow"
      );
    }

    if (analysis.phases.some((p) => p.taskCount > 20)) {
      analysis.suggestions.push(
        "Consider breaking down large phases into smaller, manageable chunks"
      );
    }

    setDetailedValidation(analysis);
  };

  if (!detailedValidation) return null;

  const hasIssues =
    !validationStatus.isValid ||
    detailedValidation.dependencies.broken.length > 0 ||
    detailedValidation.phases.some((p) => p.issues.length > 0);

  const hasWarnings =
    detailedValidation.warnings.length > 0 ||
    detailedValidation.phases.some((p) => p.warnings.length > 0);

  return (
    <div
      className={`rounded-lg border p-4 mb-6 ${
        hasIssues
          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          : hasWarnings
          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
          : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${
              hasIssues
                ? "bg-red-500"
                : hasWarnings
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
          ></div>
          <h3
            className={`font-medium ${
              hasIssues
                ? "text-red-800 dark:text-red-200"
                : hasWarnings
                ? "text-yellow-800 dark:text-yellow-200"
                : "text-green-800 dark:text-green-200"
            }`}
          >
            Roadmap Validation
          </h3>
          <span
            className={`text-sm ${
              hasIssues
                ? "text-red-600 dark:text-red-400"
                : hasWarnings
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {hasIssues ? "Issues Found" : hasWarnings ? "Warnings" : "All Good"}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <span
              className={
                hasIssues
                  ? "text-red-700 dark:text-red-300"
                  : hasWarnings
                  ? "text-yellow-700 dark:text-yellow-300"
                  : "text-green-700 dark:text-green-300"
              }
            >
              {detailedValidation.totalPhases} phases
            </span>
            <span
              className={
                hasIssues
                  ? "text-red-700 dark:text-red-300"
                  : hasWarnings
                  ? "text-yellow-700 dark:text-yellow-300"
                  : "text-green-700 dark:text-green-300"
              }
            >
              {detailedValidation.totalTasks} tasks
            </span>
            <span
              className={
                hasIssues
                  ? "text-red-700 dark:text-red-300"
                  : hasWarnings
                  ? "text-yellow-700 dark:text-yellow-300"
                  : "text-green-700 dark:text-green-300"
              }
            >
              {detailedValidation.dependencies.total} dependencies
            </span>
          </div>

          <svg
            className={`w-5 h-5 transition-transform ${
              isExpanded ? "rotate-90" : ""
            } ${
              hasIssues
                ? "text-red-600 dark:text-red-400"
                : hasWarnings
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Schema Validation Errors */}
          {!validationStatus.isValid && (
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Schema Validation Errors:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                {validationStatus.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Broken Dependencies */}
          {detailedValidation.dependencies.broken.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Broken Dependencies:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                {detailedValidation.dependencies.broken.map((dep, index) => (
                  <li key={index}>
                    Task {dep.task} depends on {dep.dependency} ({dep.reason})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Phase Issues */}
          {detailedValidation.phases.some((p) => p.issues.length > 0) && (
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Task Issues:
              </h4>
              {detailedValidation.phases.map(
                (phase) =>
                  phase.issues.length > 0 && (
                    <div key={phase.phase_id} className="mb-2">
                      <h5 className="font-medium text-red-700 dark:text-red-300">
                        {phase.phase_title}:
                      </h5>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-red-600 dark:text-red-400">
                        {phase.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </div>
          )}

          {/* Warnings */}
          {(detailedValidation.warnings.length > 0 ||
            detailedValidation.phases.some((p) => p.warnings.length > 0)) && (
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Warnings:
              </h4>
              {detailedValidation.warnings.map((warning, index) => (
                <p
                  key={index}
                  className="text-sm text-yellow-700 dark:text-yellow-300"
                >
                  • {warning}
                </p>
              ))}
              {detailedValidation.phases.map(
                (phase) =>
                  phase.warnings.length > 0 && (
                    <div key={phase.phase_id} className="mb-2">
                      <h5 className="font-medium text-yellow-700 dark:text-yellow-300">
                        {phase.phase_title}:
                      </h5>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-yellow-600 dark:text-yellow-400">
                        {phase.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </div>
          )}

          {/* Suggestions */}
          {detailedValidation.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Suggestions:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                {detailedValidation.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* All Good Message */}
          {!hasIssues && !hasWarnings && (
            <div className="text-sm text-green-700 dark:text-green-300">
              ✅ Your roadmap looks great! All validation checks passed.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;
