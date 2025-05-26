import { useRef, useEffect } from "react";
import { useTooltip } from "../context/TooltipContext";

/**
 * Custom hook for creating tooltip triggers
 * @param {string|JSX.Element} content - Tooltip content
 * @param {Object} options - Tooltip options
 * @returns {Object} - Trigger props and ref
 */
const useTooltipTrigger = (content, options = {}) => {
  const { showTooltip, hideTooltip, registerTrigger, unregisterTrigger } =
    useTooltip();
  const triggerRef = useRef(null);

  // Register trigger element when ref is set
  useEffect(() => {
    if (triggerRef.current) {
      registerTrigger(triggerRef.current);
    }
  }, [registerTrigger]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (triggerRef.current) {
        unregisterTrigger(triggerRef.current);
      }
    };
  }, [unregisterTrigger]);

  // Event handlers
  const handleMouseEnter = () => {
    if (triggerRef.current && content && !options.disabled) {
      showTooltip(triggerRef.current, content, options);
    }
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  const handleFocus = () => {
    if (triggerRef.current && content && !options.disabled) {
      showTooltip(triggerRef.current, content, options);
    }
  };

  const handleBlur = () => {
    hideTooltip();
  };

  // Return trigger props and ref
  return {
    triggerRef,
    triggerProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      className: "cursor-help",
    },
  };
};

export default useTooltipTrigger;
