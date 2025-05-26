import {
  createContext,
  useState,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";

// Create Tooltip Context
const TooltipContext = createContext();

// Custom hook to use the tooltip context
export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within a TooltipProvider");
  }
  return context;
};

// Tooltip Provider component
export const TooltipProvider = ({ children }) => {
  const [tooltipState, setTooltipState] = useState({
    isVisible: false,
    content: null,
    triggerElement: null,
    position: "top",
    maxWidth: "500px",
    className: "",
    delay: 0,
  });

  const timeoutRef = useRef(null);
  const currentTriggerRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const validationIntervalRef = useRef(null);
  const activeTriggerElementsRef = useRef(new Set());

  // Utility function to check if mouse is over element
  const isMouseOverElement = useCallback((element, mouseX, mouseY) => {
    if (!element || !element.getBoundingClientRect) return false;

    try {
      const rect = element.getBoundingClientRect();
      return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      );
    } catch (error) {
      // Element might be detached from DOM
      return false;
    }
  }, []);

  // Validate if tooltip should remain visible
  const validateTooltipVisibility = useCallback(() => {
    if (!tooltipState.isVisible || !currentTriggerRef.current) {
      return;
    }

    const triggerElement = currentTriggerRef.current;
    const { x: mouseX, y: mouseY } = mousePositionRef.current;

    // Check if trigger element is still in DOM
    if (!document.contains(triggerElement)) {
      hideTooltip();
      return;
    }

    // Check if trigger element is still visible
    const computedStyle = window.getComputedStyle(triggerElement);
    if (
      computedStyle.display === "none" ||
      computedStyle.visibility === "hidden" ||
      computedStyle.opacity === "0"
    ) {
      hideTooltip();
      return;
    }

    // Check if mouse is still over the trigger element
    if (!isMouseOverElement(triggerElement, mouseX, mouseY)) {
      hideTooltip();
      return;
    }
  }, [tooltipState.isVisible, isMouseOverElement]);

  // Show tooltip with specified content and options
  const showTooltip = useCallback(
    (triggerElement, content, options = {}) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Don't show if no content or disabled
      if (!content || options.disabled) {
        return;
      }

      // Store current trigger for cleanup
      currentTriggerRef.current = triggerElement;

      const delay = options.delay ?? 0;

      const showTooltipImmediate = () => {
        setTooltipState({
          isVisible: true,
          content,
          triggerElement,
          position: options.position || "top",
          maxWidth: options.maxWidth || "500px",
          className: options.className || "",
          delay,
        });

        // Start continuous validation when tooltip becomes visible
        if (validationIntervalRef.current) {
          clearInterval(validationIntervalRef.current);
        }
        validationIntervalRef.current = setInterval(
          validateTooltipVisibility,
          100
        );
      };

      if (delay > 0) {
        timeoutRef.current = setTimeout(showTooltipImmediate, delay);
      } else {
        showTooltipImmediate();
      }
    },
    [validateTooltipVisibility]
  );

  // Hide tooltip and move it off-screen
  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Stop continuous validation
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = null;
    }

    setTooltipState((prev) => ({
      ...prev,
      isVisible: false,
      triggerElement: null,
    }));

    currentTriggerRef.current = null;
  }, []);

  // Update tooltip content without repositioning
  const updateTooltip = useCallback((content, options = {}) => {
    setTooltipState((prev) => ({
      ...prev,
      content,
      position: options.position || prev.position,
      maxWidth: options.maxWidth || prev.maxWidth,
      className: options.className || prev.className,
    }));
  }, []);

  // Check if a specific trigger is currently active
  const isActiveTrigger = useCallback(
    (triggerElement) => {
      return (
        currentTriggerRef.current === triggerElement && tooltipState.isVisible
      );
    },
    [tooltipState.isVisible]
  );

  // Register a trigger element for tracking
  const registerTrigger = useCallback((triggerElement) => {
    if (triggerElement) {
      activeTriggerElementsRef.current.add(triggerElement);
    }
  }, []);

  // Unregister a trigger element
  const unregisterTrigger = useCallback(
    (triggerElement) => {
      if (triggerElement) {
        activeTriggerElementsRef.current.delete(triggerElement);
        // If this was the active trigger, hide tooltip
        if (currentTriggerRef.current === triggerElement) {
          hideTooltip();
        }
      }
    },
    [hideTooltip]
  );

  // Cleanup function for when trigger elements unmount
  const cleanupTrigger = useCallback(
    (triggerElement) => {
      unregisterTrigger(triggerElement);
    },
    [unregisterTrigger]
  );

  // Global mouse move handler
  const handleGlobalMouseMove = useCallback((event) => {
    mousePositionRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  // Set up global mouse tracking
  useEffect(() => {
    document.addEventListener("mousemove", handleGlobalMouseMove, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);

      // Cleanup intervals on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  }, [handleGlobalMouseMove]);

  // Update validation callback when dependencies change
  useEffect(() => {
    if (tooltipState.isVisible && validationIntervalRef.current) {
      // Restart validation with updated callback
      clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = setInterval(
        validateTooltipVisibility,
        100
      );
    }
  }, [validateTooltipVisibility, tooltipState.isVisible]);

  const value = {
    tooltipState,
    showTooltip,
    hideTooltip,
    updateTooltip,
    isActiveTrigger,
    cleanupTrigger,
    registerTrigger,
    unregisterTrigger,
  };

  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
};

export default TooltipContext;
