import React from "react";

// Skeleton animation styles
const skeletonClass = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

export const EditorSkeleton = () => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <div className={`${skeletonClass} h-6 w-64 mb-2`}></div>
          <div className={`${skeletonClass} h-4 w-32`}></div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`${skeletonClass} h-10 w-24`}></div>
        </div>
      </div>

      {/* Controls Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <div className={`${skeletonClass} h-10 w-32`}></div>
            <div className={`${skeletonClass} h-10 w-24`}></div>
            <div className={`${skeletonClass} h-10 w-20`}></div>
          </div>
          <div className="flex space-x-2">
            <div className={`${skeletonClass} h-8 w-16`}></div>
            <div className={`${skeletonClass} h-8 w-16`}></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className={`${skeletonClass} h-6 w-24 mb-4`}></div>
            <div className={`${skeletonClass} h-32 w-full mb-4`}></div>
            <div className={`${skeletonClass} h-4 w-full mb-2`}></div>
            <div className={`${skeletonClass} h-4 w-3/4`}></div>
          </div>
        </div>

        {/* Task Manager Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className={`${skeletonClass} h-6 w-48 mb-2`}></div>
              <div className={`${skeletonClass} h-4 w-64`}></div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <PhaseSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const PhaseSkeleton = () => (
  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className={`${skeletonClass} h-5 w-5`}></div>
        <div className={`${skeletonClass} h-6 w-48`}></div>
        <div className={`${skeletonClass} h-5 w-16`}></div>
      </div>
      <div className={`${skeletonClass} h-8 w-24`}></div>
    </div>
    <div className="ml-8 space-y-3">
      {[1, 2].map(i => (
        <TaskSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const TaskSkeleton = () => (
  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-3 flex-1">
        <div className={`${skeletonClass} h-4 w-4 mt-1`}></div>
        <div className={`${skeletonClass} h-4 w-4 mt-1`}></div>
        <div className="flex-1">
          <div className={`${skeletonClass} h-5 w-64 mb-2`}></div>
          <div className={`${skeletonClass} h-4 w-full mb-2`}></div>
          <div className="flex space-x-4">
            <div className={`${skeletonClass} h-4 w-16`}></div>
            <div className={`${skeletonClass} h-4 w-20`}></div>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <div className={`${skeletonClass} h-6 w-6`}></div>
        <div className={`${skeletonClass} h-6 w-6`}></div>
      </div>
    </div>
  </div>
);

export const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );
};

export const ProgressBar = ({ progress, text, showPercentage = true }) => (
  <div className="w-full">
    <div className="flex justify-between items-center mb-2">
      {text && <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>}
      {showPercentage && (
        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  </div>
);

export const ProcessingIndicator = ({ steps, currentStep, isComplete = false }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        {isComplete ? "Processing Complete" : "Processing..."}
      </h3>
      {!isComplete && <LoadingSpinner size="sm" text="" />}
    </div>
    
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            index < currentStep 
              ? "bg-green-500 text-white"
              : index === currentStep
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
          }`}>
            {index < currentStep ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-xs font-medium">{index + 1}</span>
            )}
          </div>
          <span className={`text-sm ${
            index <= currentStep 
              ? "text-gray-900 dark:text-white" 
              : "text-gray-500 dark:text-gray-400"
          }`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  actionText = "Get Started"
}) => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 text-gray-300 dark:text-gray-600 mb-4">
      {icon || (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {description}
    </p>
    {action && (
      <button
        onClick={action}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const InlineLoader = ({ text = "Loading..." }) => (
  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
    <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin"></div>
    <span className="text-sm">{text}</span>
  </div>
);

export const SaveIndicator = ({ isSaving, lastSaved, hasUnsavedChanges }) => (
  <div className="flex items-center space-x-2 text-sm">
    {isSaving ? (
      <InlineLoader text="Saving..." />
    ) : hasUnsavedChanges ? (
      <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span>Unsaved changes</span>
      </div>
    ) : lastSaved ? (
      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Saved {lastSaved}</span>
      </div>
    ) : null}
  </div>
);
