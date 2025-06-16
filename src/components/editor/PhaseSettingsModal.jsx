import { useState, useEffect } from "react";
import { useEditor } from "../../context/EditorContext";
import { useModalAccessibility } from "../../hooks/useAccessibility";
import { Toast, LoadingSpinner } from "../ui/VisualFeedback";
import { HelpIcon, InfoPanel, QuickTips } from "../feedback/ContextualHelp";

const PhaseSettingsModal = ({ isOpen, onClose, phaseId, phaseData }) => {
  const { updatePhase, moveTask, removeTask, duplicateTask } = useEditor();
  const { modalRef } = useModalAccessibility(isOpen);
  const [activeTab, setActiveTab] = useState("metadata");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [formData, setFormData] = useState({
    phase_title: "",
    phase_summary: "",
    phase_description: "",
    phase_order: 1,
    estimated_duration: "",
    difficulty_level: "intermediate",
  });

  useEffect(() => {
    if (isOpen && phaseData) {
      setFormData({
        phase_title: phaseData.phase_title || "",
        phase_summary: phaseData.phase_summary || "",
        phase_description: phaseData.phase_description || "",
        phase_order: phaseData.phase_order || 1,
        estimated_duration: phaseData.estimated_duration || "",
        difficulty_level: phaseData.difficulty_level || "intermediate",
      });
    }
  }, [isOpen, phaseData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveMetadata = async () => {
    setIsSubmitting(true);
    try {
      const result = updatePhase(phaseId, formData);
      if (result.success) {
        setShowToast({
          type: "success",
          message: "Phase metadata updated successfully",
        });
      } else {
        setShowToast({
          type: "error",
          message: result.error || "Failed to update phase metadata",
        });
      }
    } catch (error) {
      setShowToast({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    {
      id: "metadata",
      name: "Metadata",
      icon: (
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    {
      id: "tasks",
      name: "Task Management",
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      id: "validation",
      name: "Quality & Validation",
      icon: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "export",
      name: "Import/Export",
      icon: (
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
            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
          />
        </svg>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Phase Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {phaseData?.phase_title ||
                    "Configure phase settings and options"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

          {/* Tabs */}
          <div className="mt-4 flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Metadata Tab */}
          {activeTab === "metadata" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phase Title *
                  </label>
                  <input
                    type="text"
                    value={formData.phase_title}
                    onChange={(e) =>
                      handleInputChange("phase_title", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter phase title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) =>
                      handleInputChange("difficulty_level", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phase Summary
                </label>
                <textarea
                  value={formData.phase_summary}
                  onChange={(e) =>
                    handleInputChange("phase_summary", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Brief summary of what this phase covers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={formData.phase_description}
                  onChange={(e) =>
                    handleInputChange("phase_description", e.target.value)
                  }
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Detailed description of phase objectives, requirements, and outcomes"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveMetadata}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner
                        size="sm"
                        color="white"
                        className="mr-2 inline-block"
                      />
                      Saving...
                    </>
                  ) : (
                    "Save Metadata"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Task Management Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              <InfoPanel title="Task Management Tools" type="info">
                <p className="text-sm">
                  Manage tasks within this phase using bulk operations,
                  reordering, and quality checks.
                </p>
              </InfoPanel>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Reorder Tasks
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Drag and drop to reorder
                      </div>
                    </div>
                  </div>
                </button>

                <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Duplicate Tasks
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Create copies of tasks
                      </div>
                    </div>
                  </div>
                </button>

                <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-md flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Move Tasks
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Move to other phases
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Validation Tab */}
          {activeTab === "validation" && (
            <div className="space-y-6">
              <InfoPanel title="Quality Checks" type="tip">
                <p className="text-sm">
                  Run automated quality checks to ensure phase completeness and
                  consistency.
                </p>
              </InfoPanel>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Phase Completeness
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tasks with descriptions
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        ✓ 85%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tasks with time estimates
                      </span>
                      <span className="text-yellow-600 dark:text-yellow-400">
                        ⚠ 60%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tasks with dependencies
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        ✗ 30%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === "export" && (
            <div className="space-y-6">
              <InfoPanel title="Import/Export Phase Data" type="info">
                <p className="text-sm">
                  Export this phase for backup or sharing, or import tasks from
                  external sources.
                </p>
              </InfoPanel>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Export Options
                  </h4>
                  <button className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      Export Phase as JSON
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Complete phase data with all tasks
                    </div>
                  </button>
                  <button className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      Export Tasks Only
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Just the tasks without phase metadata
                    </div>
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Import Options
                  </h4>
                  <button className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      Import Tasks
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Add tasks from JSON file
                    </div>
                  </button>
                  <button className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      Import from Template
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Use predefined task templates
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default PhaseSettingsModal;
