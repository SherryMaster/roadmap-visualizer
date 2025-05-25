import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FileUploadZone from "./FileUploadZone";
import AssemblerProgress from "./AssemblerProgress";
import AssemblerResults from "./AssemblerResults";
import ThemeSelector from "./ThemeSelector";
import SchemaDownloader from "./SchemaDownloader";
import MultiSchemaValidator from "../utils/MultiSchemaValidator";
import RoadmapMerger from "../utils/RoadmapMerger";
import usePageTitle from "../hooks/usePageTitle";

// Import schemas
import skeletonSchema from "../data/roadmap_skeleton_schema.json";
import tasksSchema from "../data/skeleton_tasks_schema.json";
import finalSchema from "../data/schema.json";

const RoadmapAssembler = () => {
  usePageTitle("Roadmap Assembler");

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // File data
  const [skeletonFile, setSkeletonFile] = useState(null);
  const [taskFiles, setTaskFiles] = useState([]);
  const [mergedRoadmap, setMergedRoadmap] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [mergeStats, setMergeStats] = useState(null);

  // Track successful completion of each step
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Schema reference section visibility
  const [showSchemaReference, setShowSchemaReference] = useState(false);

  // Initialize validator
  const [validator] = useState(
    () =>
      new MultiSchemaValidator({
        skeleton: skeletonSchema,
        tasks: tasksSchema,
        final: finalSchema,
      })
  );

  const stepLabels = [
    "Upload Skeleton",
    "Upload Tasks",
    "Validate Files",
    "Merge Roadmap",
    "Complete",
  ];

  const resetAssembler = () => {
    setCurrentStep(0);
    setIsProcessing(false);
    setError(null);
    setSkeletonFile(null);
    setTaskFiles([]);
    setMergedRoadmap(null);
    setValidationResults(null);
    setMergeStats(null);
    setCompletedSteps(new Set());
  };

  const handleSkeletonUpload = (data, file, errorMessage) => {
    if (errorMessage) {
      setError(
        `Skeleton file error: ${errorMessage}. Please check that your file is valid JSON and follows the roadmap_skeleton_schema.json format.`
      );
      setCurrentStep(0); // Ensure we're on the skeleton upload step
      setSkeletonFile(null); // Clear any previous skeleton file
      return;
    }

    if (data) {
      // IMMEDIATE STRICT VALIDATION
      const validationResult = validator.validateSkeleton(data);
      if (!validationResult.isValid) {
        setError(
          `Skeleton validation failed: ${validationResult.errors.join(
            ", "
          )}. Please upload a valid skeleton file.`
        );
        setCurrentStep(0);
        setSkeletonFile(null);
        return;
      }

      // Only set file if validation passes
      setSkeletonFile(data);
      setError(null);
      setCurrentStep(1);
      setCompletedSteps((prev) => new Set([...prev, 0])); // Mark step 0 as completed
    }
  };

  const handleTaskFilesUpload = (dataArray, files, errorMessage) => {
    if (errorMessage) {
      setError(
        `Task files error: ${errorMessage}. Please check that all files are valid JSON and follow the skeleton_tasks_schema.json format.`
      );
      setCurrentStep(1); // Ensure we're on the task files upload step
      setTaskFiles([]); // Clear any previous task files
      return;
    }

    if (dataArray && Array.isArray(dataArray)) {
      // IMMEDIATE STRICT VALIDATION for each task file
      const validationErrors = [];
      dataArray.forEach((taskFile, index) => {
        const validationResult = validator.validateTasks(taskFile);
        if (!validationResult.isValid) {
          validationErrors.push(
            `Task file ${index + 1}: ${validationResult.errors.join(", ")}`
          );
        }
      });

      if (validationErrors.length > 0) {
        setError(
          `Task file validation failed: ${validationErrors.join(
            " | "
          )}. Please upload valid task files.`
        );
        setCurrentStep(1);
        setTaskFiles([]);
        return;
      }

      // Only set files if all validations pass
      setTaskFiles(dataArray);
      setError(null);
      setCurrentStep(2);
      setCompletedSteps((prev) => new Set([...prev, 1])); // Mark step 1 as completed
      // Auto-proceed to validation
      setTimeout(() => validateFiles(dataArray), 500);
    }
  };

  const validateFiles = async (taskFilesData = taskFiles) => {
    setIsProcessing(true);
    setError(null);

    try {
      const results = validator.validateAll({
        skeleton: skeletonFile,
        taskFiles: taskFilesData,
      });

      setValidationResults(results);

      if (results.overall.isValid) {
        setCurrentStep(3);
        setCompletedSteps((prev) => new Set([...prev, 2])); // Mark step 2 as completed
        // Auto-proceed to merge
        setTimeout(() => mergeRoadmap(taskFilesData), 500);
      } else {
        setError(
          `Validation failed: ${results.overall.errors.join(
            ", "
          )}. Please use the "Retry Step" button to upload corrected files.`
        );
      }
    } catch (err) {
      setError(`Validation error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const mergeRoadmap = async (taskFilesData = taskFiles) => {
    setIsProcessing(true);
    setError(null);

    try {
      const merged = RoadmapMerger.merge(skeletonFile, taskFilesData);

      if (!merged) {
        throw new Error("Failed to merge roadmap files");
      }

      // Validate the final merged roadmap
      const finalValidation = validator.validateFinalRoadmap(merged);
      if (!finalValidation.isValid) {
        throw new Error(
          `Final roadmap validation failed: ${finalValidation.errors.join(
            ", "
          )}`
        );
      }

      const stats = RoadmapMerger.getMergeStats(
        skeletonFile,
        taskFilesData,
        merged
      );

      setMergedRoadmap(merged);
      setMergeStats(stats);
      setCurrentStep(4);
      setCompletedSteps((prev) => new Set([...prev, 3])); // Mark step 3 as completed
    } catch (err) {
      setError(
        `Merge error: ${err.message}. Please use the "Retry Step" button to try again or check your files for compatibility issues.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const retryCurrentStep = () => {
    console.log("retryCurrentStep called", {
      currentStep,
      completedSteps: Array.from(completedSteps),
      error,
    });
    setError(null);
    setIsProcessing(false);

    // Find the last successfully completed step
    const lastCompletedStep = Math.max(-1, ...Array.from(completedSteps));

    // Determine where to restart based on the error and completed steps
    let restartStep;

    if (currentStep === 0 || !completedSteps.has(0)) {
      // Error in skeleton upload or skeleton not completed
      restartStep = 0;
      setSkeletonFile(null);
    } else if (currentStep === 1 || !completedSteps.has(1)) {
      // Error in task files upload or task files not completed
      restartStep = 1;
      setTaskFiles([]);
    } else if (currentStep === 2 || !completedSteps.has(2)) {
      // Error in validation - retry validation with existing files
      restartStep = 2;
      if (skeletonFile && taskFiles.length > 0) {
        setTimeout(() => validateFiles(), 100);
        return;
      } else {
        // Files missing, need to go back further
        if (!skeletonFile) {
          restartStep = 0;
          setSkeletonFile(null);
        } else {
          restartStep = 1;
          setTaskFiles([]);
        }
      }
    } else if (currentStep === 3 || !completedSteps.has(3)) {
      // Error in merge - retry merge with existing files
      restartStep = 3;
      if (
        skeletonFile &&
        taskFiles.length > 0 &&
        validationResults?.overall?.isValid
      ) {
        setTimeout(() => mergeRoadmap(), 100);
        return;
      } else {
        // Need to go back to validation
        restartStep = 2;
        if (!skeletonFile || taskFiles.length === 0) {
          restartStep = !skeletonFile ? 0 : 1;
        }
      }
    } else {
      // Unknown error, reset everything
      resetAssembler();
      return;
    }

    // Clear completed steps from the restart point forward
    const newCompletedSteps = new Set();
    for (let step of completedSteps) {
      if (step < restartStep) {
        newCompletedSteps.add(step);
      }
    }
    setCompletedSteps(newCompletedSteps);

    // Reset relevant state based on restart step
    if (restartStep <= 0) {
      setSkeletonFile(null);
      setTaskFiles([]);
      setValidationResults(null);
      setMergedRoadmap(null);
      setMergeStats(null);
    } else if (restartStep <= 1) {
      setTaskFiles([]);
      setValidationResults(null);
      setMergedRoadmap(null);
      setMergeStats(null);
    } else if (restartStep <= 2) {
      setValidationResults(null);
      setMergedRoadmap(null);
      setMergeStats(null);
    } else if (restartStep <= 3) {
      setMergedRoadmap(null);
      setMergeStats(null);
    }

    setCurrentStep(restartStep);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Roadmap Assembler
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Merge skeleton and task files into a complete roadmap
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSchemaReference(!showSchemaReference)}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Schema Reference
            </button>
            <Link
              to="/"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Back to Home
            </Link>
            <ThemeSelector />
          </div>
        </div>

        {/* Schema Reference Section */}
        {showSchemaReference && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <SchemaDownloader variant="full" />
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <AssemblerProgress
            currentStep={currentStep}
            totalSteps={stepLabels.length}
            stepLabels={stepLabels}
            isProcessing={isProcessing}
            error={error}
            onRetry={retryCurrentStep}
            onStartOver={resetAssembler}
          />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {currentStep < 4 && (
            <>
              {/* Step 1: Skeleton Upload */}
              {currentStep >= 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Step 1: Upload Roadmap Skeleton
                  </h2>
                  <div className="text-gray-600 dark:text-gray-400 mb-4">
                    <p className="mb-2">
                      Upload a single JSON file containing the roadmap skeleton
                      structure.
                    </p>
                    <p className="text-sm">
                      Need help? Download the{" "}
                      <SchemaDownloader
                        variant="inline"
                        showTitle={false}
                        className="inline"
                        filter="skeleton"
                      />{" "}
                      for reference.
                    </p>
                  </div>

                  {skeletonFile ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <span className="text-green-800 dark:text-green-200 font-medium">
                              Skeleton file loaded:{" "}
                              {skeletonFile.roadmap_title ||
                                skeletonFile.project_title ||
                                "Untitled"}
                            </span>
                            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                              {skeletonFile.phases?.length || 0} phases found
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSkeletonFile(null);
                            setError(null);
                            setCurrentStep(0);
                            // Remove step 0 and all subsequent steps from completed
                            setCompletedSteps(new Set());
                            // Clear all subsequent data
                            setTaskFiles([]);
                            setValidationResults(null);
                            setMergedRoadmap(null);
                            setMergeStats(null);
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Re-upload
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FileUploadZone
                        onFilesSelected={handleSkeletonUpload}
                        title="Drop skeleton file here"
                        description="Must conform to roadmap_skeleton_schema.json"
                        disabled={false} // Always allow re-upload
                      />
                      <div className="text-center">
                        <SchemaDownloader
                          variant="compact"
                          showTitle={false}
                          className="inline-block"
                          filter="skeleton"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Task Files Upload */}
              {currentStep >= 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Step 2: Upload Task Files
                  </h2>
                  <div className="text-gray-600 dark:text-gray-400 mb-4">
                    <p className="mb-2">
                      Upload one or more JSON files containing task definitions.
                    </p>
                    <p className="text-sm">
                      Need help? Download the{" "}
                      <SchemaDownloader
                        variant="inline"
                        showTitle={false}
                        className="inline"
                        filter="tasks"
                      />{" "}
                      for reference.
                    </p>
                  </div>

                  {taskFiles.length > 0 ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <span className="text-green-800 dark:text-green-200 font-medium">
                              {taskFiles.length} task file
                              {taskFiles.length > 1 ? "s" : ""} loaded
                            </span>
                            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                              {taskFiles.reduce(
                                (sum, file) => sum + (file.tasks?.length || 0),
                                0
                              )}{" "}
                              total tasks found
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setTaskFiles([]);
                            setError(null);
                            setCurrentStep(1);
                            // Remove step 1 and all subsequent steps from completed
                            const newCompleted = new Set();
                            if (completedSteps.has(0)) newCompleted.add(0);
                            setCompletedSteps(newCompleted);
                            // Clear all subsequent data
                            setValidationResults(null);
                            setMergedRoadmap(null);
                            setMergeStats(null);
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Re-upload
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FileUploadZone
                        onFilesSelected={handleTaskFilesUpload}
                        multiple={true}
                        title="Drop task files here"
                        description="Each must conform to skeleton_tasks_schema.json"
                        disabled={false} // Always allow re-upload
                      />
                      <div className="text-center">
                        <SchemaDownloader
                          variant="compact"
                          showTitle={false}
                          className="inline-block"
                          filter="tasks"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 5: Results */}
          {currentStep >= 4 && mergedRoadmap && (
            <AssemblerResults
              mergedRoadmap={mergedRoadmap}
              mergeStats={mergeStats}
              validationResults={validationResults}
              onReset={resetAssembler}
              onDownload={() => console.log("Download completed")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapAssembler;
