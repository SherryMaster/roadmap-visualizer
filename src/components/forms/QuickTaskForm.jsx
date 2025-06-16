import { useState, useRef, useEffect } from "react";
import { useEditor } from "../../context/EditorContext";
import {
  Toast,
  LoadingSpinner,
  SuccessCheckmark,
  FadeIn,
} from "../ui/VisualFeedback";
import { HelpIcon, QuickTips } from "../feedback/ContextualHelp";

const QuickTaskForm = ({ phaseId, phaseTitle, onCancel, onSuccess }) => {
  const { addTask, currentRoadmap } = useEditor();
  const [formData, setFormData] = useState({
    task_title: "",
    task_summary: "",
    task_priority: "mid",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const titleInputRef = useRef(null);

  // Focus on title input when component mounts
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Generate smart defaults
  const generateTaskId = (title) => {
    if (!title) return "";

    // Get existing task count for this phase
    const phases =
      currentRoadmap?.roadmap?.phases || currentRoadmap?.roadmap || [];
    const currentPhase = phases.find((p) => p.phase_id === phaseId);
    const taskCount = currentPhase?.phase_tasks?.length || 0;

    // Create task ID based on phase and task number
    const taskNumber = taskCount + 1;
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 20);

    return `${phaseId}T${taskNumber}_${cleanTitle}`;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.task_title.trim()) {
      newErrors.task_title = "Task title is required";
    }

    if (!formData.task_summary.trim()) {
      newErrors.task_summary = "Task summary is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Generate complete task data with smart defaults
      const taskData = {
        phase_id: phaseId,
        task_id: generateTaskId(formData.task_title),
        task_difficulty: "normal",
        task_title: formData.task_title.trim(),
        task_summary: formData.task_summary.trim(),
        task_detail: {
          content: `Detailed description for ${formData.task_title}`,
          format: "markdown",
        },
        code_blocks: [],
        difficulty_reason: "Standard task complexity",
        prerequisites_needed: [],
        task_dependencies: [],
        est_time: {
          min_time: { amount: 30, unit: "minutes" },
          max_time: { amount: 1, unit: "hours" },
          factors_affecting_time: ["Experience level", "Available resources"],
        },
        resource_links: [],
        task_priority: formData.task_priority,
        task_tags: ["manual-add"],
        task_number: 1, // Will be updated by the editor
      };

      const result = addTask(phaseId, taskData);

      if (result.success) {
        // Show success animation
        setShowSuccess(true);

        // Determine message based on whether it was an override or new task
        const message = result.isOverride
          ? `Task "${taskData.task_title}" overridden successfully!`
          : `Task "${taskData.task_title}" created successfully!`;

        setShowToast({
          type: "success",
          message,
        });

        // Wait for animation then callback
        setTimeout(() => {
          onSuccess?.(taskData, result);
          // Reset form
          setFormData({
            task_title: "",
            task_summary: "",
            task_priority: "mid",
          });
          setShowSuccess(false);
        }, 1500);
      } else {
        setErrors({ general: result.error || "Failed to create task" });
        setShowToast({
          type: "error",
          message: result.error || "Failed to create task",
        });
      }
    } catch (error) {
      setErrors({ general: error.message });
      setShowToast({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onCancel?.();
    }
  };

  const quickTips = [
    "Use clear, action-oriented task titles (e.g., 'Setup development environment')",
    "Keep summaries concise but descriptive",
    "Set priority based on task importance and dependencies",
    "Press Tab to navigate between fields quickly",
  ];

  return (
    <>
      <FadeIn className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Add New Task to {phaseTitle}
            </h4>
            <HelpIcon content="Quick task creation form. Fill in the basic details to create a task with smart defaults." />
          </div>
          <div className="flex items-center space-x-2">
            {showSuccess && <SuccessCheckmark size="sm" />}
            <button
              onClick={onCancel}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              title="Cancel"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          {/* General Error */}
          {errors.general && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded text-sm">
              {errors.general}
            </div>
          )}

          {/* Task Title */}
          <div className="mb-3">
            <label
              htmlFor="quick-task-title"
              className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1"
            >
              Task Title *
            </label>
            <input
              ref={titleInputRef}
              id="quick-task-title"
              type="text"
              value={formData.task_title}
              onChange={(e) => handleInputChange("task_title", e.target.value)}
              placeholder="Enter a clear, descriptive task title"
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.task_title
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.task_title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.task_title}
              </p>
            )}
          </div>

          {/* Task Summary */}
          <div className="mb-3">
            <label
              htmlFor="quick-task-summary"
              className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1"
            >
              Task Summary *
            </label>
            <textarea
              id="quick-task-summary"
              value={formData.task_summary}
              onChange={(e) =>
                handleInputChange("task_summary", e.target.value)
              }
              placeholder="Briefly describe what this task involves"
              rows={2}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.task_summary
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.task_summary && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.task_summary}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label
              htmlFor="quick-task-priority"
              className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1"
            >
              Priority
            </label>
            <select
              id="quick-task-priority"
              value={formData.task_priority}
              onChange={(e) =>
                handleInputChange("task_priority", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="mid">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Press Escape to cancel
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-4">
          <QuickTips tips={quickTips} title="Quick Task Creation Tips" />
        </div>
      </FadeIn>

      {/* Toast Notifications */}
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          isVisible={!!showToast}
          onClose={() => setShowToast(null)}
          position="top-right"
        />
      )}
    </>
  );
};

export default QuickTaskForm;
