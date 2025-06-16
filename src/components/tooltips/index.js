/**
 * Enhanced Tooltip System - Main Export File
 *
 * This file provides a centralized export for all tooltip-related components
 * and utilities in the enhanced tooltip system.
 */

// Core tooltip components
export { default as Tooltip } from "./Tooltip";
export { default as GlobalTooltip } from "./GlobalTooltip";

// Enhanced tooltip variants
export {
  default as EnhancedTooltip,
  GlassTooltip,
  MinimalTooltip,
  RichTooltip,
  SuccessTooltip,
  WarningTooltip,
  ErrorTooltip,
  InfoTooltip,
} from "./EnhancedTooltip";

// Tooltip content components
export {
  BasicTooltipContent,
  RichTooltipContent,
  StatusTooltipContent,
  ShortcutTooltipContent,
  ProgressTooltipContent,
  default as TooltipContent,
} from "./TooltipContent";

// Context and hooks
export { TooltipProvider, useTooltip } from "../../context/TooltipContext";
export { default as useTooltipTrigger } from "../../hooks/useTooltipTrigger";

// Utilities and enhancers
export { default as TooltipEnhancer } from "../../utils/TooltipEnhancer";

// Audit and development tools
export { TooltipAudit, TooltipCoverageReport } from "./TooltipAudit";

// Showcase component for development and testing
export { default as TooltipShowcase } from "./TooltipShowcase";

// Legacy components for backward compatibility
export { LegacyTooltip } from "../feedback/ContextualHelp";

/**
 * Quick access to commonly used tooltip configurations
 */
export const tooltipPresets = {
  // Standard configurations
  default: { position: "top", maxWidth: "500px" },
  compact: { position: "top", maxWidth: "250px" },
  wide: { position: "top", maxWidth: "600px" },

  // Position-based presets
  topLeft: { position: "top", maxWidth: "400px" },
  topRight: { position: "top", maxWidth: "400px" },
  bottomLeft: { position: "bottom", maxWidth: "400px" },
  bottomRight: { position: "bottom", maxWidth: "400px" },

  // Use case specific presets
  button: { position: "bottom", maxWidth: "250px" },
  icon: { position: "top", maxWidth: "200px" },
  form: { position: "right", maxWidth: "300px" },
  status: { position: "top", maxWidth: "200px" },
  navigation: { position: "bottom", maxWidth: "250px" },
  help: { position: "top", maxWidth: "400px" },

  // Rich content presets
  richContent: { position: "top", maxWidth: "500px" },
  detailedHelp: { position: "right", maxWidth: "600px" },
  tutorial: { position: "bottom", maxWidth: "450px" },
};

/**
 * Utility function to create tooltip content quickly
 */
export const createTooltipContent = {
  basic: (title, description, icon) => ({
    component: BasicTooltipContent,
    props: { title, description, icon },
  }),

  status: (status, message, details, timestamp) => ({
    component: StatusTooltipContent,
    props: { status, message, details, timestamp },
  }),

  shortcut: (action, shortcuts, description) => ({
    component: ShortcutTooltipContent,
    props: { action, shortcuts, description },
  }),

  progress: (label, current, total, details) => ({
    component: ProgressTooltipContent,
    props: {
      label,
      current,
      total,
      percentage: Math.round((current / total) * 100),
      details,
    },
  }),

  rich: (title, description, sections, footer, icon, badge) => ({
    component: RichTooltipContent,
    props: { title, description, sections, footer, icon, badge },
  }),
};

/**
 * Common tooltip content templates
 */
export const tooltipTemplates = {
  // Navigation tooltips
  home: "Return to homepage and roadmap collection",
  back: "Go back to the previous page",
  forward: "Go forward to the next page",
  refresh: "Refresh the current page",

  // Action tooltips
  save: "Save your changes",
  cancel: "Cancel and discard changes",
  delete: "Delete this item permanently",
  edit: "Edit this item",
  copy: "Copy to clipboard",
  share: "Share this content",

  // Status tooltips
  loading: "Loading content...",
  success: "Operation completed successfully",
  error: "An error occurred",
  warning: "Please review before proceeding",

  // Form tooltips
  required: "This field is required",
  optional: "This field is optional",
  invalid: "Please enter a valid value",

  // Help tooltips
  moreInfo: "Click for more information",
  documentation: "View documentation",
  tutorial: "Start interactive tutorial",
  support: "Contact support for help",
};

/**
 * Accessibility helpers for tooltips
 */
export const tooltipA11y = {
  // ARIA attributes for better accessibility
  getAriaAttributes: (content, id) => ({
    "aria-describedby": id,
    "aria-label":
      typeof content === "string"
        ? content
        : "Additional information available",
  }),

  // Keyboard navigation helpers
  keyboardShortcuts: {
    escape: "Press Escape to close tooltip",
    tab: "Use Tab to navigate between elements",
    enter: "Press Enter to activate",
    space: "Press Space to activate",
  },

  // Screen reader friendly content
  screenReaderText: {
    tooltip: "Tooltip",
    additionalInfo: "Additional information",
    help: "Help information",
    status: "Status information",
  },
};

export default {
  // Components
  Tooltip,
  EnhancedTooltip,
  TooltipContent,

  // Utilities
  tooltipPresets,
  createTooltipContent,
  tooltipTemplates,
  tooltipA11y,
};
