import { useState } from "react";
import { Link } from "react-router-dom";
import FileUploadZone from "../forms/FileUploadZone";
import AssemblerProgress from "./AssemblerProgress";
import AssemblerResults from "./AssemblerResults";
import PageLayout from "../layout/PageLayout";
import SchemaDownloader from "./SchemaDownloader";
import MultiSchemaValidator from "../../utils/MultiSchemaValidator";
import RoadmapMerger from "../../utils/RoadmapMerger";
import usePageTitle from "../../hooks/usePageTitle";
import Tooltip from "../tooltips/Tooltip";

// Import schemas
import skeletonSchema from "../../data/roadmap_skeleton_schema.json";
import tasksSchema from "../../data/skeleton_tasks_schema.json";
import finalSchema from "../../data/schema.json";

// Modern SVG Icons
const Icons = {
  Upload: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
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
  ),
  Document: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  Folder: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
  Refresh: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  Download: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
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
  ),
  Home: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  Cog: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  X: ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
};

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

  const handleSkeletonUpload = (data, _file, errorMessage) => {
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

  const handleTaskFilesUpload = (dataArray, _files, errorMessage) => {
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

    // Find the last successfully completed step (for potential future use)
    // const lastCompletedStep = Math.max(-1, ...Array.from(completedSteps));

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

  // Create subtitle with stats
  const subtitle =
    skeletonFile || taskFiles.length > 0 ? (
      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        {skeletonFile && (
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Skeleton loaded</span>
          </div>
        )}
        {taskFiles.length > 0 && (
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{taskFiles.length} task files</span>
          </div>
        )}
        {mergedRoadmap && (
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Roadmap ready</span>
          </div>
        )}
      </div>
    ) : (
      "Professional roadmap construction from modular components"
    );

  // Create action buttons
  const actionButtons = (
    <div className="flex flex-col space-y-3 sm:space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Assembler Tools
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Schema documentation and navigation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
        <Tooltip
          content="View schema documentation and download reference files"
          position="top"
          maxWidth="280px"
        >
          <button
            onClick={() => setShowSchemaReference(!showSchemaReference)}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md ${
              showSchemaReference
                ? "bg-blue-600 text-white"
                : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            }`}
          >
            <Icons.Download className="w-5 h-5 flex-shrink-0" />
            <span>Schema Reference</span>
          </button>
        </Tooltip>

        <Tooltip
          content="Return to homepage and roadmap collection"
          position="top"
          maxWidth="250px"
        >
          <Link
            to="/"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md"
          >
            <Icons.Home className="w-5 h-5 flex-shrink-0" />
            <span>Back to Home</span>
          </Link>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Roadmap Assembler"
      subtitle={subtitle}
      showBreadcrumb={true}
      breadcrumbProps={{
        roadmapTitle: "Assembler",
        currentPhase: null,
      }}
      actions={actionButtons}
    >
      {/* Compact Schema Reference Section */}
      {showSchemaReference && (
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
              <Icons.Document className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Schema Documentation
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Download reference files and view format specifications
              </p>
            </div>
          </div>
          <SchemaDownloader variant="compact" />
        </div>
      )}

      {/* Compact Progress Indicator */}
      <div className="mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {currentStep + 1}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Assembly Progress
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {stepLabels[currentStep] || `Step ${currentStep + 1}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {Math.round((currentStep / (stepLabels.length - 1)) * 100)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Complete
              </div>
            </div>
          </div>

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
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {currentStep < 4 && (
          <>
            {/* Step 1: Compact Skeleton Upload */}
            {currentStep >= 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center shadow-sm">
                    <Icons.Document className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Step 1: Upload Roadmap Skeleton
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      Foundation structure defining phases and roadmap metadata
                    </p>
                  </div>
                  {skeletonFile && (
                    <div className="flex items-center space-x-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Icons.CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 text-xs font-medium">
                        Loaded
                      </span>
                    </div>
                  )}
                </div>

                {skeletonFile ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                          <Icons.CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-green-800 dark:text-green-200 font-semibold text-lg">
                            {skeletonFile.roadmap_title ||
                              skeletonFile.project_title ||
                              "Untitled Roadmap"}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center space-x-4 text-sm text-green-700 dark:text-green-300">
                              <span className="flex items-center space-x-1">
                                <Icons.Folder className="w-4 h-4" />
                                <span>
                                  {skeletonFile.phases?.length || 0} phases
                                </span>
                              </span>
                              {skeletonFile.description && (
                                <span className="flex items-center space-x-1">
                                  <Icons.Document className="w-4 h-4" />
                                  <span>Description included</span>
                                </span>
                              )}
                            </div>
                            {skeletonFile.description && (
                              <p className="text-green-600 dark:text-green-400 text-sm mt-2 line-clamp-2">
                                {skeletonFile.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Tooltip
                        content="Upload a different skeleton file and restart the process"
                        position="left"
                        maxWidth="280px"
                      >
                        <button
                          onClick={() => {
                            setSkeletonFile(null);
                            setError(null);
                            setCurrentStep(0);
                            setCompletedSteps(new Set());
                            setTaskFiles([]);
                            setValidationResults(null);
                            setMergedRoadmap(null);
                            setMergeStats(null);
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                        >
                          <Icons.Refresh className="w-4 h-4 mr-2" />
                          Re-upload
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Icons.Document className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                            Skeleton File Requirements
                          </p>
                          <p className="text-blue-700 dark:text-blue-300 mb-2">
                            Upload a JSON file containing the roadmap structure
                            with phases and metadata.
                          </p>
                          <p className="text-blue-600 dark:text-blue-400 text-xs">
                            Need help? Download the{" "}
                            <SchemaDownloader
                              variant="inline"
                              showTitle={false}
                              className="inline font-medium underline hover:no-underline"
                              filter="skeleton"
                            />{" "}
                            for format specifications.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FileUploadZone
                      onFilesSelected={handleSkeletonUpload}
                      title="Drop skeleton file here"
                      description="Must conform to roadmap_skeleton_schema.json"
                      disabled={false}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Enhanced Task Files Upload */}
            {currentStep >= 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-glow transition-all duration-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                    <Icons.Folder className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Step 2: Upload Task Files
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Detailed task definitions and implementation guidance
                    </p>
                  </div>
                  {taskFiles.length > 0 && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <Icons.CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                        {taskFiles.length} file
                        {taskFiles.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {taskFiles.length > 0 ? (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5 animate-fade-in">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                          <Icons.CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-purple-800 dark:text-purple-200 font-semibold text-lg">
                            {taskFiles.length} Task File
                            {taskFiles.length > 1 ? "s" : ""} Loaded
                          </h3>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center space-x-4 text-sm text-purple-700 dark:text-purple-300">
                              <span className="flex items-center space-x-1">
                                <Icons.Document className="w-4 h-4" />
                                <span>
                                  {taskFiles.reduce(
                                    (sum, file) =>
                                      sum + (file.tasks?.length || 0),
                                    0
                                  )}{" "}
                                  total tasks
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Icons.Folder className="w-4 h-4" />
                                <span>Multiple phases covered</span>
                              </span>
                            </div>

                            {/* File breakdown */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                              {taskFiles.slice(0, 4).map((file, index) => (
                                <div
                                  key={index}
                                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Icons.Document className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      File {index + 1}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {file.tasks?.length || 0} tasks
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {taskFiles.length > 4 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700 flex items-center justify-center">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    +{taskFiles.length - 4} more files
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Tooltip
                        content="Upload different task files and restart from this step"
                        position="left"
                        maxWidth="280px"
                      >
                        <button
                          onClick={() => {
                            setTaskFiles([]);
                            setError(null);
                            setCurrentStep(1);
                            const newCompleted = new Set();
                            if (completedSteps.has(0)) newCompleted.add(0);
                            setCompletedSteps(newCompleted);
                            setValidationResults(null);
                            setMergedRoadmap(null);
                            setMergeStats(null);
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                        >
                          <Icons.Refresh className="w-4 h-4 mr-2" />
                          Re-upload
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Icons.Folder className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-purple-800 dark:text-purple-200 font-medium mb-1">
                            Task Files Requirements
                          </p>
                          <p className="text-purple-700 dark:text-purple-300 mb-2">
                            Upload one or more JSON files containing detailed
                            task definitions and implementation guidance.
                          </p>
                          <p className="text-purple-600 dark:text-purple-400 text-xs">
                            Need help? Download the{" "}
                            <SchemaDownloader
                              variant="inline"
                              showTitle={false}
                              className="inline font-medium underline hover:no-underline"
                              filter="tasks"
                            />{" "}
                            for format specifications.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FileUploadZone
                      onFilesSelected={handleTaskFilesUpload}
                      multiple={true}
                      title="Drop task files here"
                      description="Each must conform to skeleton_tasks_schema.json"
                      disabled={false}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 5: Enhanced Results */}
        {currentStep >= 4 && mergedRoadmap && (
          <div className="animate-fade-in">
            <AssemblerResults
              mergedRoadmap={mergedRoadmap}
              mergeStats={mergeStats}
              validationResults={validationResults}
              onReset={resetAssembler}
              onDownload={() => console.log("Download completed")}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default RoadmapAssembler;
