import { useState, useRef, useEffect } from "react";

const Tooltip = ({
  children,
  content,
  position = "top",
  maxWidth = "300px",
  delay = 300,
  disabled = false,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  // Don't render tooltip if disabled or no content
  if (disabled || !content) {
    return children;
  }

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate optimal position after showing
      calculatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let newPosition = position;

    // Check if tooltip fits in the preferred position with more generous margins
    if (position === "top" && triggerRect.top - tooltipRect.height < 20) {
      newPosition = "bottom";
    } else if (
      position === "bottom" &&
      triggerRect.bottom + tooltipRect.height > viewportHeight - 20
    ) {
      newPosition = "top";
    } else if (
      position === "left" &&
      triggerRect.left - tooltipRect.width < 20
    ) {
      newPosition = "right";
    } else if (
      position === "right" &&
      triggerRect.right + tooltipRect.width > viewportWidth - 20
    ) {
      newPosition = "left";
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

  const getTooltipClasses = () => {
    const baseClasses = `
      absolute z-50 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800
      rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 pointer-events-none
      ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
    `;

    const positionClasses = {
      top: "bottom-full left-1/2 transform -translate-x-1/2 mb-3",
      bottom: "top-full left-1/2 transform -translate-x-1/2 mt-3",
      left: "right-full top-1/2 transform -translate-y-1/2 mr-3",
      right: "left-full top-1/2 transform -translate-y-1/2 ml-3",
    };

    return `${baseClasses} ${positionClasses[actualPosition]} ${className}`;
  };

  const getArrowClasses = () => {
    const arrowClasses = {
      top: "absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-800",
      bottom:
        "absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-white dark:border-b-gray-800",
      left: "absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-white dark:border-l-gray-800",
      right:
        "absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-white dark:border-r-gray-800",
    };

    return arrowClasses[actualPosition];
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={getTooltipClasses()}
          style={{
            maxWidth: `min(${maxWidth}, calc(100vw - 40px))`,
            minWidth: "300px",
          }}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {content}
          <div className={getArrowClasses()} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
