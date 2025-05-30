import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Enhanced Tooltip Component with Smart Positioning
 */
export const Tooltip = ({ 
  children, 
  content, 
  position = "top", 
  delay = 0,
  maxWidth = "300px",
  className = "",
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (disabled) return;
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        updatePosition();
      }, delay);
    } else {
      setIsVisible(true);
      updatePosition();
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let newPosition = position;

    // Check if tooltip would go outside viewport and adjust
    switch (position) {
      case "top":
        if (triggerRect.top - tooltipRect.height < 10) {
          newPosition = "bottom";
        }
        break;
      case "bottom":
        if (triggerRect.bottom + tooltipRect.height > viewport.height - 10) {
          newPosition = "top";
        }
        break;
      case "left":
        if (triggerRect.left - tooltipRect.width < 10) {
          newPosition = "right";
        }
        break;
      case "right":
        if (triggerRect.right + tooltipRect.width > viewport.width - 10) {
          newPosition = "left";
        }
        break;
    }

    setActualPosition(newPosition);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipStyles = () => {
    if (!triggerRef.current) return {};

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const styles = {
      position: "fixed",
      zIndex: 9999,
      maxWidth,
      pointerEvents: "none"
    };

    switch (actualPosition) {
      case "top":
        styles.bottom = window.innerHeight - triggerRect.top + 8;
        styles.left = triggerRect.left + triggerRect.width / 2;
        styles.transform = "translateX(-50%)";
        break;
      case "bottom":
        styles.top = triggerRect.bottom + 8;
        styles.left = triggerRect.left + triggerRect.width / 2;
        styles.transform = "translateX(-50%)";
        break;
      case "left":
        styles.right = window.innerWidth - triggerRect.left + 8;
        styles.top = triggerRect.top + triggerRect.height / 2;
        styles.transform = "translateY(-50%)";
        break;
      case "right":
        styles.left = triggerRect.right + 8;
        styles.top = triggerRect.top + triggerRect.height / 2;
        styles.transform = "translateY(-50%)";
        break;
    }

    return styles;
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 transform rotate-45";
    
    switch (actualPosition) {
      case "top":
        return `${baseClasses} -bottom-1 left-1/2 -translate-x-1/2`;
      case "bottom":
        return `${baseClasses} -top-1 left-1/2 -translate-x-1/2`;
      case "left":
        return `${baseClasses} -right-1 top-1/2 -translate-y-1/2`;
      case "right":
        return `${baseClasses} -left-1 top-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  const tooltip = isVisible && (
    <div
      ref={tooltipRef}
      style={getTooltipStyles()}
      className={`bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg shadow-lg transition-opacity duration-200 ${className}`}
    >
      <div className={getArrowClasses()} />
      {content}
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
};

/**
 * Help Icon with Tooltip
 */
export const HelpIcon = ({ 
  content, 
  size = "sm",
  className = "" 
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <Tooltip content={content} position="top" delay={200}>
      <svg 
        className={`${sizeClasses[size]} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors ${className}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </Tooltip>
  );
};

/**
 * Info Panel Component
 */
export const InfoPanel = ({ 
  title, 
  children, 
  type = "info",
  collapsible = false,
  defaultExpanded = true,
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const typeStyles = {
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    tip: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
    }
  };

  const style = typeStyles[type];

  return (
    <div className={`border rounded-lg ${style.bg} ${style.border} ${className}`}>
      <div 
        className={`flex items-center p-3 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className={`flex-shrink-0 ${style.text}`}>
          {style.icon}
        </div>
        <h4 className={`ml-2 font-medium ${style.text}`}>
          {title}
        </h4>
        {collapsible && (
          <div className={`ml-auto ${style.text}`}>
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
      {isExpanded && (
        <div className={`px-3 pb-3 ${style.text}`}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Step-by-Step Guide Component
 */
export const StepGuide = ({ 
  steps, 
  currentStep = 0,
  onStepClick = null,
  className = "" 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = onStepClick && typeof onStepClick === 'function';

        return (
          <div 
            key={index}
            className={`flex items-start space-x-3 ${isClickable ? 'cursor-pointer' : ''}`}
            onClick={isClickable ? () => onStepClick(index) : undefined}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              isCompleted 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : isActive
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <div className="flex-1">
              <h5 className={`font-medium ${
                isActive 
                  ? 'text-blue-900 dark:text-blue-100'
                  : isCompleted
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {step.title}
              </h5>
              {step.description && (
                <p className={`text-sm mt-1 ${
                  isActive 
                    ? 'text-blue-700 dark:text-blue-300'
                    : isCompleted
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Quick Tips Component
 */
export const QuickTips = ({ 
  tips, 
  title = "Quick Tips",
  className = "" 
}) => {
  return (
    <InfoPanel title={title} type="tip" collapsible={true} className={className}>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start space-x-2">
            <svg className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">{tip}</span>
          </li>
        ))}
      </ul>
    </InfoPanel>
  );
};

/**
 * Keyboard Shortcuts Help
 */
export const KeyboardShortcuts = ({ 
  shortcuts, 
  title = "Keyboard Shortcuts",
  className = "" 
}) => {
  return (
    <InfoPanel title={title} type="info" collapsible={true} className={className}>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm">{shortcut.description}</span>
            <div className="flex space-x-1">
              {shortcut.keys.map((key, keyIndex) => (
                <kbd 
                  key={keyIndex}
                  className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </InfoPanel>
  );
};

export default {
  Tooltip,
  HelpIcon,
  InfoPanel,
  StepGuide,
  QuickTips,
  KeyboardShortcuts
};
