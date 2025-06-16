import { useState, useEffect } from "react";

/**
 * Success/Error Toast Notification Component
 */
export const Toast = ({ 
  message, 
  type = "success", 
  isVisible, 
  onClose, 
  duration = 4000,
  position = "top-right" 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2"
  };

  const typeStyles = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-800 dark:text-yellow-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const style = typeStyles[type];

  return (
    <div className={`fixed ${positionClasses[position]} z-50 animate-in slide-in-from-top-2 duration-300`}>
      <div className={`flex items-center p-4 rounded-lg border shadow-lg max-w-md ${style.bg} ${style.border}`}>
        <div className={`flex-shrink-0 ${style.text}`}>
          {style.icon}
        </div>
        <div className={`ml-3 flex-1 ${style.text}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 flex-shrink-0 ${style.text} hover:opacity-75 transition-opacity`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ 
  size = "md", 
  color = "blue", 
  className = "",
  text = null 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const colorClasses = {
    blue: "border-blue-600",
    green: "border-green-600",
    red: "border-red-600",
    yellow: "border-yellow-600",
    purple: "border-purple-600",
    gray: "border-gray-600"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-2">
        <div
          className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
        />
        {text && (
          <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
        )}
      </div>
    </div>
  );
};

/**
 * Progress Bar Component
 */
export const ProgressBar = ({ 
  progress, 
  max = 100, 
  color = "blue", 
  size = "md",
  showPercentage = true,
  className = "" 
}) => {
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
    purple: "bg-purple-600"
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span>{Math.round(percentage)}%</span>
          <span>{progress} / {max}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton Loader Component
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  className = "",
  animate = true 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
            animate ? "animate-pulse" : ""
          }`}
          style={{
            width: `${Math.random() * 40 + 60}%`
          }}
        />
      ))}
    </div>
  );
};

/**
 * Fade In Animation Component
 */
export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 300,
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

/**
 * Slide In Animation Component
 */
export const SlideIn = ({ 
  children, 
  direction = "left", 
  delay = 0,
  duration = 300,
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case "left": return "translateX(-20px)";
        case "right": return "translateX(20px)";
        case "up": return "translateY(-20px)";
        case "down": return "translateY(20px)";
        default: return "translateX(-20px)";
      }
    }
    return "translate(0)";
  };

  return (
    <div
      className={`transition-all ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

/**
 * Pulse Animation Component
 */
export const Pulse = ({ 
  children, 
  color = "blue", 
  intensity = "light",
  className = "" 
}) => {
  const colorClasses = {
    blue: {
      light: "animate-pulse bg-blue-100 dark:bg-blue-900/20",
      medium: "animate-pulse bg-blue-200 dark:bg-blue-900/40",
      strong: "animate-pulse bg-blue-300 dark:bg-blue-900/60"
    },
    green: {
      light: "animate-pulse bg-green-100 dark:bg-green-900/20",
      medium: "animate-pulse bg-green-200 dark:bg-green-900/40",
      strong: "animate-pulse bg-green-300 dark:bg-green-900/60"
    },
    red: {
      light: "animate-pulse bg-red-100 dark:bg-red-900/20",
      medium: "animate-pulse bg-red-200 dark:bg-red-900/40",
      strong: "animate-pulse bg-red-300 dark:bg-red-900/60"
    }
  };

  return (
    <div className={`${colorClasses[color][intensity]} rounded-md p-2 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Success Checkmark Animation
 */
export const SuccessCheckmark = ({ 
  size = "md", 
  className = "",
  animate = true 
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center ${animate ? 'animate-bounce' : ''}`}>
        <svg 
          className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-green-600 dark:text-green-400`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
};

export default {
  Toast,
  LoadingSpinner,
  ProgressBar,
  SkeletonLoader,
  FadeIn,
  SlideIn,
  Pulse,
  SuccessCheckmark
};
