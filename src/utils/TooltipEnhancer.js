/**
 * Tooltip Enhancement Utility
 * 
 * This utility provides strategic tooltip content for various UI elements
 * in the roadmap visualizer application. It follows the user's preferences
 * for professional, concise tooltips that enhance user experience.
 */

/**
 * Navigation and Breadcrumb Tooltips
 */
export const navigationTooltips = {
  home: "Return to homepage and roadmap collection",
  roadmapView: "View the complete roadmap with all phases and tasks",
  phaseView: "Focus on this specific phase and its tasks",
  editMode: "Edit roadmap content, add tasks, and modify structure",
  assembler: "Create new roadmaps by combining multiple components",
  
  // Breadcrumb specific
  breadcrumbSeparator: "Navigation path - click any item to navigate",
};

/**
 * Editor Control Tooltips
 */
export const editorTooltips = {
  save: {
    enabled: "Save all changes to the roadmap",
    disabled: {
      noChanges: "No changes to save",
      invalid: "Fix validation errors before saving",
    }
  },
  preview: {
    edit: "Switch back to edit mode to make changes",
    preview: "Preview how the roadmap will look to users"
  },
  cancel: "Cancel editing and return to roadmap view without saving changes",
  undo: {
    enabled: "Undo the last action",
    disabled: "No actions to undo"
  },
  redo: {
    enabled: "Redo the last undone action", 
    disabled: "No actions to redo"
  },
  reset: {
    enabled: "Reset all changes back to the last saved state",
    disabled: "No changes to reset"
  }
};

/**
 * Status Indicator Tooltips
 */
export const statusTooltips = {
  modified: {
    true: "The roadmap has unsaved changes",
    false: "All changes have been saved"
  },
  validation: {
    valid: "The roadmap structure is valid",
    invalid: "There are validation errors that need to be fixed"
  },
  progress: {
    completed: "Task completed - click to mark as incomplete",
    incomplete: "Task not completed - click to mark as complete",
    percentage: (completed, total) => `${completed} of ${total} tasks completed`
  }
};

/**
 * Form Control Tooltips
 */
export const formTooltips = {
  taskTitle: "Enter a clear, descriptive title for this task",
  taskSummary: "Provide a brief overview of what this task involves",
  difficulty: "Rate the complexity level from 1 (beginner) to 5 (expert)",
  estimatedTime: "Estimate how long this task typically takes to complete",
  prerequisites: "List any skills or knowledge needed before starting this task",
  dependencies: "Select other tasks that must be completed first",
  tags: "Add relevant keywords to help categorize and search for this task",
  priority: "Set the importance level of this task within the phase",
  
  // Resource links
  resourceType: "Choose the type of resource (documentation, tutorial, tool, etc.)",
  resourceUrl: "Enter the web address for this resource",
  resourceTitle: "Give this resource a descriptive name",
  essential: "Mark if this resource is required vs. optional for task completion"
};

/**
 * Interactive Element Tooltips
 */
export const interactionTooltips = {
  expand: "Click to expand and view details",
  collapse: "Click to collapse and hide details", 
  sort: "Click to sort items by this criteria",
  filter: "Click to filter items based on this option",
  search: "Search through tasks, phases, and content",
  clearSearch: "Clear search and show all phases and tasks",
  
  // Drag and drop
  dragHandle: "Drag to reorder this item",
  dropZone: "Drop items here to reorder or move them",
  
  // File operations
  upload: "Upload a roadmap JSON file to start tracking progress",
  download: "Download the current roadmap as a JSON file",
  share: "Share this roadmap URL with others or copy to clipboard",
  
  // Theme and settings
  themeLight: "Switch to light theme for better visibility in bright environments",
  themeDark: "Switch to dark theme for reduced eye strain in low light",
  themeSystem: "Use your system's theme preference automatically"
};

/**
 * Data Visualization Tooltips
 */
export const visualizationTooltips = {
  progressBar: "Visual representation of completion progress",
  difficultyIndicator: "Shows the complexity level of this task",
  timeEstimate: "Estimated time required to complete this task",
  dependencyGraph: "Shows relationships between tasks and their dependencies",
  
  // Charts and metrics
  completionRate: "Percentage of tasks completed in this phase",
  totalTasks: "Total number of tasks in your roadmap collection",
  averageDifficulty: "Average complexity level across all tasks"
};

/**
 * Accessibility Tooltips
 */
export const accessibilityTooltips = {
  keyboardShortcut: (shortcut) => `Keyboard shortcut: ${shortcut}`,
  screenReader: "This element provides additional context for screen readers",
  focusIndicator: "Use Tab to navigate, Enter to activate",
  skipLink: "Skip to main content area"
};

/**
 * Error and Validation Tooltips
 */
export const errorTooltips = {
  required: "This field is required",
  invalid: "Please enter a valid value",
  tooLong: "This value is too long",
  tooShort: "This value is too short",
  duplicate: "This value already exists",
  networkError: "Network connection issue - please try again",
  validationError: "Please fix the highlighted errors before proceeding"
};

/**
 * Helper function to get contextual tooltip content
 */
export const getTooltipContent = (category, key, context = {}) => {
  const tooltipMap = {
    navigation: navigationTooltips,
    editor: editorTooltips,
    status: statusTooltips,
    form: formTooltips,
    interaction: interactionTooltips,
    visualization: visualizationTooltips,
    accessibility: accessibilityTooltips,
    error: errorTooltips
  };

  const categoryTooltips = tooltipMap[category];
  if (!categoryTooltips) return null;

  const tooltip = categoryTooltips[key];
  if (typeof tooltip === 'function') {
    return tooltip(context);
  }
  
  if (typeof tooltip === 'object' && context.state) {
    return tooltip[context.state];
  }
  
  return tooltip;
};

/**
 * Tooltip configuration presets for common use cases
 */
export const tooltipPresets = {
  // Standard button tooltip
  button: {
    position: "bottom",
    maxWidth: "250px"
  },
  
  // Icon-only element tooltip
  icon: {
    position: "top", 
    maxWidth: "200px"
  },
  
  // Form field tooltip
  field: {
    position: "right",
    maxWidth: "300px"
  },
  
  // Status indicator tooltip
  status: {
    position: "top",
    maxWidth: "200px"
  },
  
  // Navigation element tooltip
  navigation: {
    position: "bottom",
    maxWidth: "250px"
  },
  
  // Rich content tooltip
  rich: {
    position: "top",
    maxWidth: "400px"
  }
};

export default {
  getTooltipContent,
  tooltipPresets,
  navigationTooltips,
  editorTooltips,
  statusTooltips,
  formTooltips,
  interactionTooltips,
  visualizationTooltips,
  accessibilityTooltips,
  errorTooltips
};
