import { useState, useCallback } from "react";
import { useEditor } from "../../context/EditorContext";
import FileUploadZone from "../forms/FileUploadZone";
import MultiSchemaValidator from "../../utils/MultiSchemaValidator";
import TaskDistributor from "../../utils/TaskDistributor";
import skeletonTasksSchema from "../../data/skeleton_tasks_schema.json";

// Helper function to provide detailed error messages
const getDetailedErrorMessage = (error, task) => {
  if (!error) return "Unknown error";

  const errorStr = error.toString().toLowerCase();

  if (errorStr.includes("phase") && errorStr.includes("not found")) {
    return `Target phase "${
      task?.phase_id || "Unknown"
    }" does not exist in the roadmap.`;
  }

  if (errorStr.includes("validation failed")) {
    return `Task validation failed: ${error.replace(
      /^.*validation failed:?\s*/i,
      ""
    )}`;
  }

  if (errorStr.includes("invalid task data")) {
    return `Invalid task data: ${error.replace(
      /^.*invalid task data:?\s*/i,
      ""
    )}`;
  }

  if (errorStr.includes("failed to add task")) {
    return `Failed to add task "${
      task?.task_id || "Unknown"
    }". This may be due to missing required fields or data format issues.`;
  }

  // Return the original error if no specific pattern matches
  return error;
};

const EditorTaskUpload = () => {
  const { addTask, addMultipleTasks, currentRoadmap } = useEditor();
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState("");
  const [uploadMode, setUploadMode] = useState("multi-phase"); // "multi-phase" or "single-phase"

  // Get available phases
  const phases =
    currentRoadmap?.roadmap?.phases || currentRoadmap?.roadmap || [];

  const handleFileUpload = useCallback(
    async (fileContents, fileObjects, errorMessage) => {
      // Handle error case
      if (errorMessage) {
        setUploadStatus({
          type: "error",
          message: `Upload failed: ${errorMessage}`,
        });
        return;
      }

      if (
        !fileContents ||
        (Array.isArray(fileContents) && fileContents.length === 0)
      )
        return;

      // Check requirements based on upload mode
      if (uploadMode === "single-phase" && !selectedPhase) {
        setUploadStatus({
          type: "error",
          message:
            "Please select a target phase before uploading tasks in single-phase mode.",
        });
        return;
      }

      setIsProcessing(true);
      setUploadStatus(null);

      try {
        const validator = new MultiSchemaValidator({
          tasks: skeletonTasksSchema,
        });

        const allTasks = [];
        const fileResults = [];

        // Ensure we have arrays to work with
        const contentArray = Array.isArray(fileContents)
          ? fileContents
          : [fileContents];
        const fileArray = Array.isArray(fileObjects)
          ? fileObjects
          : [fileObjects];

        // Process all files and collect tasks
        for (let i = 0; i < contentArray.length; i++) {
          const taskData = contentArray[i];
          const fileObj = fileArray[i];
          const fileName = fileObj?.name || `file_${i + 1}.json`;

          try {
            // Validate the task file
            const validation = validator.validateTasks(taskData);
            if (!validation.isValid) {
              fileResults.push({
                fileName,
                success: false,
                error: `Validation failed: ${validation.errors.join(", ")}`,
              });
              continue;
            }

            if (taskData.tasks && Array.isArray(taskData.tasks)) {
              // Process tasks based on upload mode
              const processedTasks = taskData.tasks.map((task) => {
                if (uploadMode === "single-phase") {
                  // Override phase_id with selected phase
                  return { ...task, phase_id: selectedPhase };
                } else {
                  // Keep original phase_id for multi-phase mode
                  return task;
                }
              });

              allTasks.push(...processedTasks);
              fileResults.push({
                fileName,
                success: true,
                tasksFound: taskData.tasks.length,
              });
            } else {
              fileResults.push({
                fileName,
                success: false,
                error: "File does not contain a valid tasks array",
              });
            }
          } catch (error) {
            fileResults.push({
              fileName,
              success: false,
              error: `File processing error: ${error.message}`,
            });
          }
        }

        if (allTasks.length === 0) {
          setUploadStatus({
            type: "error",
            message: "No valid tasks found in uploaded files.",
            details: fileResults,
          });
          return;
        }

        // Handle task distribution based on mode
        if (uploadMode === "multi-phase") {
          // Use TaskDistributor for multi-phase distribution
          const distributionResult = TaskDistributor.distributeTasksToPhases(
            allTasks,
            phases
          );

          const phaseResults = [];
          let totalSuccessCount = 0;
          let totalAttemptedCount = 0;

          if (
            distributionResult.success ||
            distributionResult.stats.distributedCount > 0
          ) {
            // Collect ALL tasks from ALL phases into a single batch
            const allTasksForBatch = [];
            for (const [phaseId, phaseData] of Object.entries(
              distributionResult.distributedTasks
            )) {
              if (phaseData.tasks.length > 0) {
                allTasksForBatch.push(
                  ...phaseData.tasks.map((task) => ({
                    phaseId,
                    taskData: task,
                  }))
                );
              }
            }

            // Process all tasks in a single batch operation
            if (allTasksForBatch.length > 0) {
              const results = addMultipleTasks(allTasksForBatch);

              // Group results by phase for reporting
              let resultIndex = 0;
              for (const [phaseId, phaseData] of Object.entries(
                distributionResult.distributedTasks
              )) {
                if (phaseData.tasks.length > 0) {
                  const phaseResults_slice = results.slice(
                    resultIndex,
                    resultIndex + phaseData.tasks.length
                  );
                  resultIndex += phaseData.tasks.length;

                  const successCount = phaseResults_slice.filter(
                    (r) => r.success
                  ).length;
                  const failedTasks = phaseResults_slice.filter(
                    (r) => !r.success
                  );
                  const overrideCount = phaseResults_slice.filter(
                    (r) => r.success && r.isOverride
                  ).length;
                  const addCount = successCount - overrideCount;

                  totalSuccessCount += successCount;
                  totalAttemptedCount += phaseResults_slice.length;

                  // Create detailed phase result with override information
                  let message;
                  if (successCount === phaseResults_slice.length) {
                    if (overrideCount > 0 && addCount > 0) {
                      message = `${addCount}/${phaseResults_slice.length} tasks added successfully, ${overrideCount} tasks overridden`;
                    } else if (overrideCount > 0) {
                      message = `${overrideCount}/${phaseResults_slice.length} tasks overridden successfully`;
                    } else {
                      message = `${successCount}/${phaseResults_slice.length} tasks added successfully`;
                    }
                  } else {
                    if (overrideCount > 0) {
                      message = `${addCount}/${phaseResults_slice.length} tasks added successfully, ${overrideCount} tasks overridden`;
                    } else {
                      message = `${successCount}/${phaseResults_slice.length} tasks added successfully`;
                    }
                  }

                  phaseResults.push({
                    type:
                      successCount === phaseResults_slice.length
                        ? "success"
                        : "error",
                    phase: phaseData.phase_title,
                    message,
                    taskIds: phaseData.tasks
                      .slice(0, successCount)
                      .map((task) => task.task_id || "Unknown"),
                    errors: failedTasks.map((r, index) => {
                      const failedTask = phaseData.tasks[successCount + index];
                      return {
                        taskId: failedTask?.task_id || "Unknown",
                        error: getDetailedErrorMessage(r.error, failedTask),
                      };
                    }),
                  });
                }
              }
            }
          }

          // Combine distribution results with actual addition results
          const formattedResult =
            TaskDistributor.formatForUI(distributionResult);

          // Update the formatted result with actual addition results
          const combinedDetails = [...phaseResults];

          // Add orphaned tasks if any
          if (distributionResult.orphanedTasks.length > 0) {
            combinedDetails.push({
              type: "error",
              phase: "Orphaned Tasks",
              message: `${distributionResult.orphanedTasks.length} tasks could not be distributed`,
              errors: distributionResult.orphanedTasks.map((task) => ({
                taskId: task.task_id || "Unknown",
                error: task.error,
              })),
            });
          }

          setUploadStatus({
            type: totalSuccessCount === allTasks.length ? "success" : "warning",
            message: `Added ${totalSuccessCount}/${
              allTasks.length
            } tasks across ${
              phaseResults.filter(
                (p) =>
                  p.type === "success" ||
                  (p.type === "error" && p.taskIds?.length > 0)
              ).length
            } phases`,
            details: combinedDetails,
            stats: {
              ...formattedResult.stats,
              actualSuccessCount: totalSuccessCount,
              actualAttemptedCount: totalAttemptedCount,
            },
          });
        } else {
          // Single-phase mode - add all tasks to selected phase
          const results = addMultipleTasks(
            allTasks.map((task) => ({ phaseId: selectedPhase, taskData: task }))
          );

          const successCount = results.filter((r) => r.success).length;
          const overrideCount = results.filter(
            (r) => r.success && r.isOverride
          ).length;
          const addCount = successCount - overrideCount;

          let message;
          if (overrideCount > 0 && addCount > 0) {
            message = `Added ${addCount}/${
              allTasks.length
            } tasks, overridden ${overrideCount} tasks in ${
              phases.find((p) => p.phase_id === selectedPhase)?.phase_title ||
              selectedPhase
            }.`;
          } else if (overrideCount > 0) {
            message = `Overridden ${overrideCount}/${
              allTasks.length
            } tasks in ${
              phases.find((p) => p.phase_id === selectedPhase)?.phase_title ||
              selectedPhase
            }.`;
          } else {
            message = `Added ${successCount}/${allTasks.length} tasks to ${
              phases.find((p) => p.phase_id === selectedPhase)?.phase_title ||
              selectedPhase
            }.`;
          }

          setUploadStatus({
            type: successCount === allTasks.length ? "success" : "warning",
            message,
            details: fileResults,
          });
        }
      } catch (error) {
        setUploadStatus({
          type: "error",
          message: `Upload failed: ${error.message}`,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [addTask, addMultipleTasks, selectedPhase, uploadMode, phases]
  );

  const handlePhaseChange = (e) => {
    setSelectedPhase(e.target.value);
    setUploadStatus(null);
  };

  const clearStatus = () => {
    setUploadStatus(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add Tasks
      </h3>

      {/* Upload Mode Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload Mode
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="multi-phase"
              checked={uploadMode === "multi-phase"}
              onChange={(e) => setUploadMode(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Multi-Phase (Auto-distribute)
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="single-phase"
              checked={uploadMode === "single-phase"}
              onChange={(e) => setUploadMode(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Single Phase
            </span>
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {uploadMode === "multi-phase"
            ? "Tasks will be automatically distributed to phases based on their phase_id field"
            : "All tasks will be added to the selected phase, overriding their phase_id"}
        </p>
      </div>

      {/* Phase Selection (only for single-phase mode) */}
      {uploadMode === "single-phase" && (
        <div className="mb-4">
          <label
            htmlFor="phase-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Target Phase
          </label>
          <select
            id="phase-select"
            value={selectedPhase}
            onChange={handlePhaseChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a phase...</option>
            {phases.map((phase) => (
              <option key={phase.phase_id} value={phase.phase_id}>
                {phase.phase_title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* File Upload Zone */}
      <FileUploadZone
        onFilesSelected={handleFileUpload}
        accept=".json"
        multiple={true}
        disabled={
          (uploadMode === "single-phase" && !selectedPhase) || isProcessing
        }
        title="Upload Task Files"
        description={
          uploadMode === "multi-phase"
            ? "Drop JSON task files here or click to browse"
            : selectedPhase
            ? "Drop JSON task files here or click to browse"
            : "Select a target phase first"
        }
      />

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mt-4 flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-blue-700 dark:text-blue-300">
            Processing task files...
          </span>
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus && (
        <div
          className={`mt-4 p-4 rounded-md ${
            uploadStatus.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : uploadStatus.type === "warning"
              ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p
                className={`font-medium ${
                  uploadStatus.type === "success"
                    ? "text-green-800 dark:text-green-200"
                    : uploadStatus.type === "warning"
                    ? "text-yellow-800 dark:text-yellow-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                {uploadStatus.message}
              </p>

              {/* Detailed Results */}
              {uploadStatus.details && uploadStatus.details.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadStatus.details.map((result, index) => (
                    <div key={index} className="text-sm">
                      {result.fileName ? (
                        // File-level result
                        <>
                          <span className="font-medium">
                            {result.fileName}:
                          </span>
                          {result.success ? (
                            <span className="text-green-700 dark:text-green-300 ml-2">
                              ✓ {result.tasksAdded || result.tasksFound} task(s)
                              processed
                            </span>
                          ) : (
                            <span className="text-red-700 dark:text-red-300 ml-2">
                              ✗ {result.error}
                            </span>
                          )}
                        </>
                      ) : (
                        // Phase-level result (multi-phase mode)
                        <div
                          className={`p-2 rounded ${
                            result.type === "success"
                              ? "bg-green-50 dark:bg-green-900/20"
                              : "bg-red-50 dark:bg-red-900/20"
                          }`}
                        >
                          <span className="font-medium">{result.phase}:</span>
                          <span
                            className={`ml-2 ${
                              result.type === "success"
                                ? "text-green-700 dark:text-green-300"
                                : "text-red-700 dark:text-red-300"
                            }`}
                          >
                            {result.message}
                          </span>
                          {result.taskIds && (
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                              Tasks: {result.taskIds.join(", ")}
                            </div>
                          )}
                          {result.errors && (
                            <div className="mt-1 space-y-1">
                              {result.errors.map((error, errorIndex) => (
                                <div
                                  key={errorIndex}
                                  className="text-xs text-red-600 dark:text-red-400"
                                >
                                  • {error.taskId}: {error.error}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Distribution Statistics (multi-phase mode) */}
              {uploadStatus.stats && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Distribution Summary:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <div>Total Tasks: {uploadStatus.stats.totalTasks}</div>
                    <div>Success Rate: {uploadStatus.stats.successRate}%</div>
                    <div>
                      Distributed: {uploadStatus.stats.distributedCount}
                    </div>
                    <div>
                      Phases Affected: {uploadStatus.stats.phasesAffected}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={clearStatus}
              className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-2">
          <strong>Supported format:</strong> JSON files with task arrays
          following the skeleton tasks schema.
        </p>
        {uploadMode === "multi-phase" ? (
          <div>
            <p className="mb-1">
              <strong>Multi-Phase Mode:</strong> Tasks will be automatically
              distributed to their respective phases based on the{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                phase_id
              </code>{" "}
              field in each task.
            </p>
            <p>
              • Supports task files containing tasks for multiple phases
              <br />
              • Validates that all referenced phases exist in the roadmap
              <br />• Provides detailed distribution statistics and error
              reporting
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-1">
              <strong>Single-Phase Mode:</strong> All tasks will be added to the
              selected phase, overriding their original{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                phase_id
              </code>
              .
            </p>
            <p>
              • Useful for adding tasks from different sources to a specific
              phase
              <br />• Task IDs will be validated for uniqueness within the
              target phase
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorTaskUpload;
