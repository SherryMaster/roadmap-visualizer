import useTooltipTrigger from "../hooks/useTooltipTrigger";

/**
 * Enhanced Tooltip component with professional styling variants
 * Provides additional styling options while maintaining backward compatibility
 */
const EnhancedTooltip = ({
  children,
  content,
  position = "top",
  maxWidth = "500px",
  delay = 0,
  disabled = false,
  className = "",
  variant = "default",
  showArrow = true,
  interactive = false,
}) => {
  // Enhanced styling variants
  const getVariantClasses = (variant) => {
    const variants = {
      default: "",
      
      // Professional glass effect
      glass: `
        bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl backdrop-saturate-200
        border border-white/20 dark:border-gray-700/30
        shadow-2xl shadow-gray-900/20 dark:shadow-black/40
        ring-1 ring-gray-900/5 dark:ring-white/5
      `,
      
      // Elegant minimal style
      minimal: `
        bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-lg
        border border-gray-200/60 dark:border-gray-600/60
        shadow-lg shadow-gray-900/10 dark:shadow-black/20
        text-gray-800 dark:text-gray-200
      `,
      
      // Rich content style
      rich: `
        bg-white dark:bg-gray-900 backdrop-blur-xl
        border border-gray-200 dark:border-gray-700
        shadow-2xl shadow-gray-900/25 dark:shadow-black/50
        ring-1 ring-gray-900/10 dark:ring-white/10
        p-6
      `,
      
      // Success/positive feedback
      success: `
        bg-green-50/95 dark:bg-green-900/20 backdrop-blur-xl
        border border-green-200/80 dark:border-green-700/50
        shadow-xl shadow-green-900/20 dark:shadow-green-900/30
        text-green-800 dark:text-green-200
        ring-1 ring-green-900/10 dark:ring-green-400/20
      `,
      
      // Warning/attention
      warning: `
        bg-amber-50/95 dark:bg-amber-900/20 backdrop-blur-xl
        border border-amber-200/80 dark:border-amber-700/50
        shadow-xl shadow-amber-900/20 dark:shadow-amber-900/30
        text-amber-800 dark:text-amber-200
        ring-1 ring-amber-900/10 dark:ring-amber-400/20
      `,
      
      // Error/critical
      error: `
        bg-red-50/95 dark:bg-red-900/20 backdrop-blur-xl
        border border-red-200/80 dark:border-red-700/50
        shadow-xl shadow-red-900/20 dark:shadow-red-900/30
        text-red-800 dark:text-red-200
        ring-1 ring-red-900/10 dark:ring-red-400/20
      `,
      
      // Info/neutral
      info: `
        bg-blue-50/95 dark:bg-blue-900/20 backdrop-blur-xl
        border border-blue-200/80 dark:border-blue-700/50
        shadow-xl shadow-blue-900/20 dark:shadow-blue-900/30
        text-blue-800 dark:text-blue-200
        ring-1 ring-blue-900/10 dark:ring-blue-400/20
      `,
    };

    return variants[variant] || variants.default;
  };

  // Enhanced options for the tooltip system
  const enhancedOptions = {
    position,
    maxWidth,
    delay,
    disabled,
    className: `${getVariantClasses(variant)} ${className}`.trim(),
    showArrow,
    interactive,
  };

  // Use the singleton tooltip system
  const { triggerRef, triggerProps } = useTooltipTrigger(content, enhancedOptions);

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

// Convenience components for common use cases
export const GlassTooltip = (props) => (
  <EnhancedTooltip {...props} variant="glass" />
);

export const MinimalTooltip = (props) => (
  <EnhancedTooltip {...props} variant="minimal" />
);

export const RichTooltip = (props) => (
  <EnhancedTooltip {...props} variant="rich" maxWidth="600px" />
);

export const SuccessTooltip = (props) => (
  <EnhancedTooltip {...props} variant="success" />
);

export const WarningTooltip = (props) => (
  <EnhancedTooltip {...props} variant="warning" />
);

export const ErrorTooltip = (props) => (
  <EnhancedTooltip {...props} variant="error" />
);

export const InfoTooltip = (props) => (
  <EnhancedTooltip {...props} variant="info" />
);

export default EnhancedTooltip;
