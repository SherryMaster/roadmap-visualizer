import React from "react";

// Skeleton animation styles
const skeletonClass = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

export const RoadmapHeaderSkeleton = () => (
  <div className="mb-8">
    <div className={`${skeletonClass} h-8 w-3/4 mb-4`}></div>
    <div className={`${skeletonClass} h-4 w-full mb-2`}></div>
    <div className={`${skeletonClass} h-4 w-2/3 mb-4`}></div>
    <div className="flex flex-wrap gap-2">
      <div className={`${skeletonClass} h-6 w-16`}></div>
      <div className={`${skeletonClass} h-6 w-20`}></div>
      <div className={`${skeletonClass} h-6 w-14`}></div>
    </div>
  </div>
);

export const PhaseSkeleton = ({ showTasks = true, taskCount = 3 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
    {/* Phase Header */}
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`${skeletonClass} h-6 w-1/2`}></div>
        <div className={`${skeletonClass} h-8 w-8 rounded-full`}></div>
      </div>
      <div className={`${skeletonClass} h-4 w-full mb-2`}></div>
      <div className={`${skeletonClass} h-4 w-3/4`}></div>
    </div>

    {/* Phase Tasks */}
    {showTasks && (
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: taskCount }).map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </div>
      </div>
    )}
  </div>
);

export const TaskSkeleton = () => (
  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
    <div className="flex items-start justify-between mb-3">
      <div className={`${skeletonClass} h-5 w-2/3`}></div>
      <div className={`${skeletonClass} h-6 w-16 rounded-full`}></div>
    </div>
    <div className={`${skeletonClass} h-4 w-full mb-2`}></div>
    <div className={`${skeletonClass} h-4 w-4/5 mb-3`}></div>
    <div className="flex items-center space-x-4">
      <div className={`${skeletonClass} h-4 w-20`}></div>
      <div className={`${skeletonClass} h-4 w-16`}></div>
      <div className={`${skeletonClass} h-4 w-24`}></div>
    </div>
  </div>
);

export const PhaseLoadingSkeleton = ({ phaseCount = 3 }) => (
  <div className="space-y-6">
    {Array.from({ length: phaseCount }).map((_, index) => (
      <PhaseSkeleton key={index} showTasks={true} taskCount={2} />
    ))}
  </div>
);

export const ProgressiveLoadingIndicator = ({ 
  loadedPhases, 
  totalPhases, 
  currentlyLoading = null,
  error = null 
}) => (
  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <svg 
          className="w-5 h-5 text-blue-600 dark:text-blue-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Loading Roadmap Content
        </span>
      </div>
      <span className="text-sm text-blue-700 dark:text-blue-300">
        {loadedPhases}/{totalPhases} phases loaded
      </span>
    </div>
    
    {/* Progress Bar */}
    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-3">
      <div 
        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${(loadedPhases / totalPhases) * 100}%` }}
      ></div>
    </div>
    
    {/* Current Loading Status */}
    {currentlyLoading && (
      <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading {currentlyLoading}...</span>
      </div>
    )}
    
    {/* Error State */}
    {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 mt-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>Error loading some content: {error}</span>
      </div>
    )}
  </div>
);

export const RoadmapFullSkeleton = ({ phaseCount = 4 }) => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <RoadmapHeaderSkeleton />
      <PhaseLoadingSkeleton phaseCount={phaseCount} />
    </div>
  </div>
);

export default {
  RoadmapHeaderSkeleton,
  PhaseSkeleton,
  TaskSkeleton,
  PhaseLoadingSkeleton,
  ProgressiveLoadingIndicator,
  RoadmapFullSkeleton,
};
