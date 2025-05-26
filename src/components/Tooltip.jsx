import useTooltipTrigger from "../hooks/useTooltipTrigger";

/**
 * Backward compatible Tooltip component that uses the singleton tooltip system
 * Maintains the same API as the original Tooltip component
 */
const Tooltip = ({
  children,
  content,
  position = "top",
  maxWidth = "500px",
  delay = 0,
  disabled = false,
  className = "",
}) => {
  // Use the singleton tooltip system
  const { triggerRef, triggerProps } = useTooltipTrigger(content, {
    position,
    maxWidth,
    delay,
    disabled,
    className,
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
