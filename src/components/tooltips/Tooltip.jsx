import useTooltipTrigger from "../../hooks/useTooltipTrigger";

/**
 * Enhanced Tooltip component that uses the singleton tooltip system
 * Maintains backward compatibility while providing enhanced styling and animations
 */
const Tooltip = ({
  children,
  content,
  position = "top",
  maxWidth = "500px",
  delay = 0,
  disabled = false,
  className = "",
  variant = "default",
  showAnimation = true,
}) => {
  // Enhanced styling based on variant
  const getEnhancedClassName = () => {
    let enhancedClass = className;

    if (showAnimation) {
      enhancedClass += " tooltip-content-enter";
    }

    // Add subtle enhancements for better visual appeal
    if (!className.includes("bg-") && variant === "default") {
      enhancedClass += " enhanced-tooltip-default";
    }

    return enhancedClass.trim();
  };

  // Use the singleton tooltip system with enhanced options
  const { triggerRef, triggerProps } = useTooltipTrigger(content, {
    position,
    maxWidth,
    delay,
    disabled,
    className: getEnhancedClassName(),
  });

  // Don't render tooltip if disabled or no content
  if (disabled || !content) {
    return children;
  }

  return (
    <div ref={triggerRef} {...triggerProps}>
      {children}
    </div>
  );
};

export default Tooltip;
