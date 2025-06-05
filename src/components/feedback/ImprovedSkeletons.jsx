import React from "react";

// Base skeleton animation class
const skeletonClass = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";

// Shimmer effect for more polished loading
const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export const TaskSkeleton = ({ className = "" }) => (
  <div className={`border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3 ${className}`}>
    {/* Task header */}
    <div className="flex items-start justify-between">
      <div className={`${skeletonClass} ${shimmerClass} h-5 w-3/4`}></div>
      <div className={`${skeletonClass} ${shimmerClass} h-6 w-16 rounded-full`}></div>
    </div>
    
    {/* Task description */}
    <div className="space-y-2">
      <div className={`${skeletonClass} ${shimmerClass} h-4 w-full`}></div>
      <div className={`${skeletonClass} ${shimmerClass} h-4 w-4/5`}></div>
    </div>
    
    {/* Task metadata */}
    <div className="flex items-center space-x-4 pt-2">
      <div className={`${skeletonClass} ${shimmerClass} h-4 w-20`}></div>
      <div className={`${skeletonClass} ${shimmerClass} h-4 w-16`}></div>
      <div className={`${skeletonClass} ${shimmerClass} h-4 w-24`}></div>
    </div>
  </div>
);

export const PhaseSkeleton = ({ taskCount = 3, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
    {/* Phase Header - Fixed height to prevent layout shift */}
    <div className="p-6 border-b border-gray-200 dark:border-gray-700" style={{ minHeight: '120px' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`${skeletonClass} ${shimmerClass} h-8 w-20 rounded-full`}></div>
          <div className={`${skeletonClass} ${shimmerClass} h-6 w-48`}></div>
        </div>
        <div className={`${skeletonClass} ${shimmerClass} h-8 w-8 rounded-full`}></div>
      </div>
      
      {/* Phase description */}
      <div className="space-y-2 mb-4">
        <div className={`${skeletonClass} ${shimmerClass} h-4 w-full`}></div>
        <div className={`${skeletonClass} ${shimmerClass} h-4 w-3/4`}></div>
      </div>
      
      {/* Progress bar */}
      <div className="flex items-center space-x-3">
        <div className={`${skeletonClass} ${shimmerClass} h-2 flex-1 rounded-full`}></div>
        <div className={`${skeletonClass} ${shimmerClass} h-4 w-16`}></div>
      </div>
    </div>

    {/* Phase Tasks - Fixed height container */}
    <div className="p-6" style={{ minHeight: `${taskCount * 120 + 40}px` }}>
      <div className="space-y-4">
        {Array.from({ length: taskCount }).map((_, index) => (
          <TaskSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

export const RoadmapHeaderSkeleton = ({ className = "" }) => (
  <div className={`mb-8 ${className}`}>
    {/* Title */}
    <div className={`${skeletonClass} ${shimmerClass} h-8 w-3/4 mb-4`}></div>
    
    {/* Description */}
    <div className="space-y-2 mb-4">
      <div className={`${skeletonClass} ${shimmerClass} h-4 w-full`}></div>
      <div className={`${skeletonClass} ${shimmerClass} h-4 w-2/3`}></div>
    </div>
    
    {/* Tags */}
    <div className="flex flex-wrap gap-2">
      <div className={`${skeletonClass} ${shimmerClass} h-6 w-16`}></div>
      <div className={`${skeletonClass} ${shimmerClass} h-6 w-20`}></div>
      <div className={`${skeletonClass} ${shimmerClass} h-6 w-14`}></div>
    </div>
  </div>
);

export const LoadingIndicator = ({ 
  message = "Loading...", 
  progress = null,
  className = "" 
}) => (
  <div className={`flex items-center space-x-3 text-blue-600 dark:text-blue-400 ${className}`}>
    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-sm font-medium">{message}</span>
    {progress !== null && (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {progress}%
      </span>
    )}
  </div>
);

export const ProgressiveLoadingContainer = ({ 
  children, 
  isLoading, 
  skeleton, 
  className = "",
  fadeInDuration = "duration-300"
}) => (
  <div className={`relative ${className}`}>
    {/* Skeleton layer */}
    <div 
      className={`transition-opacity ${fadeInDuration} ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {skeleton}
    </div>
    
    {/* Content layer */}
    <div 
      className={`transition-opacity ${fadeInDuration} ${
        isLoading ? 'opacity-0 absolute inset-0' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  </div>
);

export const PhaseLoadingState = ({ 
  phase, 
  isLoading, 
  children,
  taskCount = 3 
}) => (
  <ProgressiveLoadingContainer
    isLoading={isLoading}
    skeleton={<PhaseSkeleton taskCount={taskCount} />}
    className="mb-6"
  >
    {children}
  </ProgressiveLoadingContainer>
);

// Enhanced loading states with better UX
export const SmartLoadingIndicator = ({ 
  loadedCount, 
  totalCount, 
  currentItem = null,
  error = null,
  className = ""
}) => {
  const progress = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0;
  
  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
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
            Loading Content
          </span>
        </div>
        <span className="text-sm text-blue-700 dark:text-blue-300">
          {loadedCount}/{totalCount} loaded
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-3">
        <div 
          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Current Loading Status */}
      {currentItem && !error && (
        <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading {currentItem}...</span>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>Error: {error}</span>
        </div>
      )}
    </div>
  );
};

export default {
  TaskSkeleton,
  PhaseSkeleton,
  RoadmapHeaderSkeleton,
  LoadingIndicator,
  ProgressiveLoadingContainer,
  PhaseLoadingState,
  SmartLoadingIndicator,
};
