import { useState, useEffect } from "react";
import { useEditor } from "../context/EditorContext";
import { useModalAccessibility } from "../hooks/useAccessibility";
import DependencyManager from "./DependencyManager";
import TaskTemplateSelector from "./TaskTemplateSelector";

const TaskFormModal = ({
  isOpen,
  onClose,
  phaseId,
  phaseTitle,
  initialData = null,
}) => {
  const { addTask, replaceTask, currentRoadmap } = useEditor();
  const { modalRef } = useModalAccessibility(isOpen);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    task_title: "",
    task_summary: "",
    task_priority: "mid",
    task_tags: [],
    task_dependencies: [],
    resource_links: [],
    est_time: {
      min_time: { amount: 30, unit: "minutes" },
      max_time: { amount: 1, unit: "hours" },
      factors_affecting_time: ["Experience level"],
    },
    task_detail: {
      content: "",
      format: "markdown",
    },
    difficulty_reason: "",
    prerequisites_needed: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        task_title: initialData.task_title || "",
        task_summary: initialData.task_summary || "",
        task_priority: initialData.task_priority || "mid",
        task_tags: initialData.task_tags || [],
        task_dependencies: initialData.task_dependencies || [],
        resource_links: initialData.resource_links || [],
        est_time: initialData.est_time || {
          min_time: { amount: 30, unit: "minutes" },
          max_time: { amount: 1, unit: "hours" },
          factors_affecting_time: ["Experience level"],
        },
        task_detail: initialData.task_detail || {
          content: "",
          format: "markdown",
        },
        difficulty_reason: initialData.difficulty_reason || "",
        prerequisites_needed: initialData.prerequisites_needed || [],
      });
    } else if (isOpen) {
      // Reset form for new task
      setFormData({
        task_title: "",
        task_summary: "",
        task_priority: "mid",
        task_tags: [],
        task_dependencies: [],
        resource_links: [],
        est_time: {
          min_time: { amount: 30, unit: "minutes" },
          max_time: { amount: 1, unit: "hours" },
          factors_affecting_time: ["Experience level"],
        },
        task_detail: {
          content: "",
          format: "markdown",
        },
        difficulty_reason: "",
        prerequisites_needed: [],
      });
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const generateTaskId = (title) => {
    if (!title) return "";

    const phases =
      currentRoadmap?.roadmap?.phases || currentRoadmap?.roadmap || [];
    const currentPhase = phases.find((p) => p.phase_id === phaseId);
    const taskCount = currentPhase?.phase_tasks?.length || 0;

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

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleNestedInputChange = (parentField, childField, value) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value,
      },
    }));
  };

  const handleArrayAdd = (field, defaultValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleArrayUpdate = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleTemplateSelect = (templateData, customize = false) => {
    setFormData((prev) => ({
      ...prev,
      task_title: templateData.task_title,
      task_summary: templateData.task_summary,
      task_priority: templateData.task_priority,
      task_tags: templateData.task_tags || [],
      task_dependencies: templateData.task_dependencies || [],
      resource_links: templateData.resource_links || [],
      est_time: templateData.est_time || prev.est_time,
      task_detail: templateData.task_detail || prev.task_detail,
      difficulty_reason:
        templateData.difficulty_reason || prev.difficulty_reason,
      prerequisites_needed: templateData.prerequisites_needed || [],
    }));

    if (!customize) {
      // If not customizing, go directly to final step
      setCurrentStep(3);
    }
  };

  const handleDependenciesChange = (newDependencies) => {
    setFormData((prev) => ({
      ...prev,
      task_dependencies: newDependencies,
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.task_title.trim()) {
        newErrors.task_title = "Task title is required";
      }
      if (!formData.task_summary.trim()) {
        newErrors.task_summary = "Task summary is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        phase_id: phaseId,
        task_id: isEditing
          ? initialData.task_id
          : generateTaskId(formData.task_title),
        task_difficulty: "normal",
        task_title: formData.task_title.trim(),
        task_summary: formData.task_summary.trim(),
        task_detail: formData.task_detail,
        code_blocks: [],
        difficulty_reason:
          formData.difficulty_reason || "Standard task complexity",
        prerequisites_needed: formData.prerequisites_needed,
        task_dependencies: formData.task_dependencies,
        est_time: formData.est_time,
        resource_links: formData.resource_links,
        task_priority: formData.task_priority,
        task_tags: formData.task_tags,
        task_number: isEditing ? initialData.task_number : 1,
      };

      let result;
      if (isEditing) {
        result = replaceTask(phaseId, initialData.task_id, taskData);
      } else {
        result = addTask(phaseId, taskData);
      }

      if (result.success) {
        onClose();
      } else {
        setErrors({
          general:
            result.error || `Failed to ${isEditing ? "update" : "create"} task`,
        });
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Title, summary, and priority",
    },
    {
      number: 2,
      title: "Details",
      description: "Time estimates and resources",
    },
    { number: 3, title: "Advanced", description: "Dependencies and tags" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? "Edit Task" : "Create New Task"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {phaseTitle}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="inline-flex items-center px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  title="Use template"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Templates
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
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

          {/* Progress Steps */}
          <div className="mt-4 flex items-center space-x-4">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.number
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {step.number}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                {step.number < steps.length && (
                  <div
                    className={`w-8 h-0.5 ml-4 ${
                      currentStep > step.number
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.task_title}
                  onChange={(e) =>
                    handleInputChange("task_title", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.task_title
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter a clear, descriptive task title"
                />
                {errors.task_title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.task_title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Summary *
                </label>
                <textarea
                  value={formData.task_summary}
                  onChange={(e) =>
                    handleInputChange("task_summary", e.target.value)
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.task_summary
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Describe what this task involves and what the user will accomplish"
                />
                {errors.task_summary && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.task_summary}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
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
            </div>
          )}

          {/* Step 2: Time Estimates and Resources */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Time Estimation */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Time Estimation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Minimum Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Time
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={formData.est_time.min_time.amount}
                        onChange={(e) =>
                          handleNestedInputChange("est_time", "min_time", {
                            ...formData.est_time.min_time,
                            amount: parseInt(e.target.value) || 1,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={formData.est_time.min_time.unit}
                        onChange={(e) =>
                          handleNestedInputChange("est_time", "min_time", {
                            ...formData.est_time.min_time,
                            unit: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                      </select>
                    </div>
                  </div>

                  {/* Maximum Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Time
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={formData.est_time.max_time.amount}
                        onChange={(e) =>
                          handleNestedInputChange("est_time", "max_time", {
                            ...formData.est_time.max_time,
                            amount: parseInt(e.target.value) || 1,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={formData.est_time.max_time.unit}
                        onChange={(e) =>
                          handleNestedInputChange("est_time", "max_time", {
                            ...formData.est_time.max_time,
                            unit: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Factors Affecting Time */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Factors Affecting Time
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.est_time.factors_affecting_time.map(
                      (factor, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                        >
                          {factor}
                          <button
                            onClick={() => {
                              const newFactors =
                                formData.est_time.factors_affecting_time.filter(
                                  (_, i) => i !== index
                                );
                              handleNestedInputChange(
                                "est_time",
                                "factors_affecting_time",
                                newFactors
                              );
                            }}
                            className="ml-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                          >
                            <svg
                              className="w-3 h-3"
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
                        </span>
                      )
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a factor (e.g., Experience level, Available tools)..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          e.preventDefault();
                          const newFactors = [
                            ...formData.est_time.factors_affecting_time,
                            e.target.value.trim(),
                          ];
                          handleNestedInputChange(
                            "est_time",
                            "factors_affecting_time",
                            newFactors
                          );
                          e.target.value = "";
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input =
                          e.target.parentElement.querySelector("input");
                        if (input.value.trim()) {
                          const newFactors = [
                            ...formData.est_time.factors_affecting_time,
                            input.value.trim(),
                          ];
                          handleNestedInputChange(
                            "est_time",
                            "factors_affecting_time",
                            newFactors
                          );
                          input.value = "";
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Resource Links */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Resource Links
                </h4>

                {/* Existing Resource Links */}
                {formData.resource_links.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {formData.resource_links.map((link, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {link.display_text}
                              </span>
                              {link.is_essential && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                  Essential
                                </span>
                              )}
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300">
                                {link.type || "link"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all">
                              {link.url}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleArrayRemove("resource_links", index)
                            }
                            className="ml-2 p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove resource link"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Resource Link */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                    Add Resource Link
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Display Text
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Official Documentation, Tutorial Video"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="new-link-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="new-link-url"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Type
                        </label>
                        <select
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          id="new-link-type"
                        >
                          <option value="documentation">Documentation</option>
                          <option value="tutorial">Tutorial</option>
                          <option value="video">Video</option>
                          <option value="tool">Tool</option>
                          <option value="reference">Reference</option>
                          <option value="example">Example</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="new-link-essential"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="new-link-essential"
                          className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          Essential resource
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const textInput =
                          document.getElementById("new-link-text");
                        const urlInput =
                          document.getElementById("new-link-url");
                        const typeSelect =
                          document.getElementById("new-link-type");
                        const essentialCheckbox =
                          document.getElementById("new-link-essential");

                        if (textInput.value.trim() && urlInput.value.trim()) {
                          const newLink = {
                            display_text: textInput.value.trim(),
                            url: urlInput.value.trim(),
                            type: typeSelect.value,
                            is_essential: essentialCheckbox.checked,
                          };
                          handleArrayAdd("resource_links", newLink);

                          // Clear form
                          textInput.value = "";
                          urlInput.value = "";
                          typeSelect.value = "documentation";
                          essentialCheckbox.checked = false;
                        }
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Resource Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Dependencies */}
              <DependencyManager
                currentTask={{
                  task_id: formData.task_title
                    ? generateTaskId(formData.task_title)
                    : "new-task",
                  task_dependencies: formData.task_dependencies,
                }}
                phaseId={phaseId}
                onDependenciesChange={handleDependenciesChange}
              />

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.task_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    >
                      {tag}
                      <button
                        onClick={() => handleArrayRemove("task_tags", index)}
                        className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <svg
                          className="w-3 h-3"
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
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        e.preventDefault();
                        handleArrayAdd("task_tags", e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input =
                        e.target.parentElement.querySelector("input");
                      if (input.value.trim()) {
                        handleArrayAdd("task_tags", input.value.trim());
                        input.value = "";
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Task Detail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={formData.task_detail.content}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "task_detail",
                      "content",
                      e.target.value
                    )
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Provide detailed instructions, requirements, and acceptance criteria..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Supports Markdown formatting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update Task"
                ) : (
                  "Create Task"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <TaskTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
        phaseId={phaseId}
        phaseTitle={phaseTitle}
      />
    </div>
  );
};

export default TaskFormModal;
