import { useState, useEffect } from "react";

const AssemblerProgress = ({
  currentStep,
  totalSteps,
  stepLabels = [],
  isProcessing = false,
  error = null,
  onRetry = null,
  onStartOver = null,
}) => {
  const [animatedStep, setAnimatedStep] = useState(0);

  useEffect(() => {
    // Animate step progression
    const timer = setTimeout(() => {
      setAnimatedStep(currentStep);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const getStepStatus = (stepIndex) => {
    if (error && stepIndex === currentStep) return "error";
    if (stepIndex < animatedStep) return "completed";
    if (stepIndex === animatedStep && isProcessing) return "processing";
    if (stepIndex === animatedStep) return "current";
    return "pending";
  };

  const getStepIcon = (stepIndex, status) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "processing":
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case "current":
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {stepIndex + 1}
            </span>
          </div>
        );
      case "error":
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
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
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
              {stepIndex + 1}
            </span>
          </div>
        );
    }
  };

  const getStepLineClasses = (stepIndex) => {
    const isCompleted = stepIndex < animatedStep;
    const baseClasses =
      "flex-1 h-1 mx-4 rounded-full transition-all duration-500";

    if (isCompleted) {
      return `${baseClasses} bg-green-500`;
    } else {
      return `${baseClasses} bg-gray-300 dark:bg-gray-600`;
    }
  };

  const getStepTextClasses = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400 font-medium";
      case "processing":
      case "current":
        return "text-blue-600 dark:text-blue-400 font-medium";
      case "error":
        return "text-red-600 dark:text-red-400 font-medium";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center mb-8">
        {Array.from({ length: totalSteps }, (_, index) => {
          const status = getStepStatus(index);
          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {getStepIcon(index, status)}
                <span className={`mt-2 text-sm ${getStepTextClasses(status)}`}>
                  {stepLabels[index] || `Step ${index + 1}`}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div className={getStepLineClasses(index)} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {error ? (
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.062 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h3 className="text-lg font-semibold">
                Error in {stepLabels[currentStep] || `Step ${currentStep + 1}`}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onRetry && (
                <button
                  onClick={() => {
                    console.log("Retry button clicked"); // Debug log
                    onRetry();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Restart from Last Success
                </button>
              )}
              {onStartOver && (
                <button
                  onClick={() => {
                    console.log("Start Over button clicked"); // Debug log
                    onStartOver();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Start Over
                </button>
              )}
            </div>
          </div>
        ) : isProcessing ? (
          <div className="text-center">
            <div className="text-blue-600 dark:text-blue-400 mb-4">
              <div className="w-12 h-12 mx-auto mb-2 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-lg font-semibold">
                Processing{" "}
                {stepLabels[currentStep] || `Step ${currentStep + 1}`}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process your files...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-600 dark:text-green-400 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
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
              <h3 className="text-lg font-semibold">
                {currentStep >= totalSteps
                  ? "All Steps Complete!"
                  : `Ready for ${
                      stepLabels[currentStep] || `Step ${currentStep + 1}`
                    }`}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {currentStep >= totalSteps
                ? "Your roadmap has been successfully assembled and is ready for download."
                : "Continue with the next step to proceed."}
            </p>
          </div>
        )}
      </div>

      {/* Progress Percentage */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Progress: {Math.round((animatedStep / totalSteps) * 100)}%
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(animatedStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AssemblerProgress;
