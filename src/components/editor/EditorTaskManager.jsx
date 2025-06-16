import { useState } from "react";
import { useEditor } from "../../context/EditorContext";
import TaskEditModal from "./TaskEditModal";
import DragDropTaskList from "../forms/DragDropTaskList";
import VirtualTaskList from "../modals/VirtualTaskList";
import BatchOperations from "../forms/BatchOperations";
import QuickTaskForm from "../forms/QuickTaskForm";
import TaskFormModal from "./TaskFormModal";
import TaskCreationDropdown from "../forms/TaskCreationDropdown";
import PhaseSettingsModal from "./PhaseSettingsModal";
import { Toast, FadeIn, SlideIn } from "../ui/VisualFeedback";
import { HelpIcon, InfoPanel } from "../feedback/ContextualHelp";

const EditorTaskManager = ({ roadmap }) => {
  const { removeTask, moveTask } = useEditor();
  const [expandedPhases, setExpandedPhases] = useState(new Set());
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [editingTask, setEditingTask] = useState(null);
  const [editingPhaseId, setEditingPhaseId] = useState(null);
  const [showQuickForm, setShowQuickForm] = useState(null); // phaseId or null
  const [showAdvancedModal, setShowAdvancedModal] = useState(null); // phaseId or null
  const [showPhaseSettings, setShowPhaseSettings] = useState(null); // phaseId or null
  const [showToast, setShowToast] = useState(null);
  const [taskCreationMode, setTaskCreationMode] = useState("quick"); // "quick" or "advanced"

  const phases = roadmap?.roadmap?.phases || roadmap?.roadmap || [];

  const togglePhaseExpansion = (phaseId) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const handleTaskRemove = (phaseId, taskId) => {
    if (window.confirm("Are you sure you want to remove this task?")) {
      const result = removeTask(phaseId, taskId);
      if (result.success) {
        setShowToast({
          type: "success",
          message: "Task removed successfully",
        });
        setSelectedTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(`${phaseId}-${taskId}`);
          return newSet;
        });
      } else {
        setShowToast({
          type: "error",
          message: result.error || "Failed to remove task",
        });
      }
    }
  };

  const handleTaskSelect = (phaseId, taskId) => {
    const taskKey = `${phaseId}-${taskId}`;
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskKey)) {
      newSelected.delete(taskKey);
    } else {
      newSelected.add(taskKey);
    }
    setSelectedTasks(newSelected);
  };

  const isTaskSelected = (phaseId, taskId) => {
    return selectedTasks.has(`${phaseId}-${taskId}`);
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
  };

  const getSelectedTasksCount = () => {
    return selectedTasks.size;
  };

  const handleTaskEdit = (phaseId, task) => {
    setEditingTask(task);
    setEditingPhaseId(phaseId);
  };

  const handleCloseEditModal = () => {
    setEditingTask(null);
    setEditingPhaseId(null);
  };

  const handleAddTask = (phaseId, mode = "quick") => {
    // Expand the phase if not already expanded
    if (!expandedPhases.has(phaseId)) {
      setExpandedPhases((prev) => new Set([...prev, phaseId]));
    }

    setTaskCreationMode(mode);
    if (mode === "quick") {
      setShowQuickForm(phaseId);
    } else {
      setShowAdvancedModal(phaseId);
    }
  };

  const handleQuickFormCancel = () => {
    setShowQuickForm(null);
  };

  const handleQuickFormSuccess = (taskData) => {
    setShowQuickForm(null);
    setShowToast({
      type: "success",
      message: `Task "${taskData.task_title}" added successfully!`,
    });
  };

  const handleAdvancedModalClose = () => {
    setShowAdvancedModal(null);
  };

  const handlePhaseSettings = (phaseId) => {
    setShowPhaseSettings(phaseId);
  };

  const handlePhaseSettingsClose = () => {
    setShowPhaseSettings(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Roadmap Structure
            </h3>
            <HelpIcon content="Use the green 'Add Task' button for all task creation (quick or advanced with templates). The purple gear icon opens phase settings for metadata editing, bulk operations, and advanced phase management." />
          </div>

          {getSelectedTasksCount() > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getSelectedTasksCount()} task(s) selected
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage tasks within each phase. Click to expand phases and view tasks.
        </p>
      </div>

      {/* Batch Operations */}
      <BatchOperations
        selectedTasks={selectedTasks}
        onClearSelection={clearSelection}
        roadmap={roadmap}
      />

      {/* Phases List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {phases.map((phase) => (
          <div key={phase.phase_id} className="p-6">
            {/* Phase Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => togglePhaseExpansion(phase.phase_id)}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedPhases.has(phase.phase_id) ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {phase.phase_title}
                </h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {phase.phase_tasks?.length || 0} tasks
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Enhanced Task Creation Dropdown */}
                <TaskCreationDropdown
                  phaseId={phase.phase_id}
                  phaseTitle={phase.phase_title}
                  onAddTask={handleAddTask}
                />

                {/* Phase Settings (Repurposed Gear Icon) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePhaseSettings(phase.phase_id);
                  }}
                  className="inline-flex items-center px-2 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  title="Phase settings and advanced options"
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Phase Summary */}
            {phase.phase_summary && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 ml-8">
                {phase.phase_summary}
              </p>
            )}

            {/* Tasks List */}
            {expandedPhases.has(phase.phase_id) && (
              <div className="mt-4 ml-8">
                {/* Quick Task Form */}
                {showQuickForm === phase.phase_id && (
                  <QuickTaskForm
                    phaseId={phase.phase_id}
                    phaseTitle={phase.phase_title}
                    onCancel={handleQuickFormCancel}
                    onSuccess={handleQuickFormSuccess}
                  />
                )}

                {/* Task List */}
                {(phase.phase_tasks || []).length > 20 ? (
                  <VirtualTaskList
                    tasks={phase.phase_tasks || []}
                    phaseId={phase.phase_id}
                    onTaskEdit={handleTaskEdit}
                    onTaskRemove={handleTaskRemove}
                    onTaskSelect={handleTaskSelect}
                    isTaskSelected={isTaskSelected}
                    containerHeight={400}
                    itemHeight={120}
                  />
                ) : (
                  <DragDropTaskList
                    tasks={phase.phase_tasks || []}
                    phaseId={phase.phase_id}
                    onTaskEdit={handleTaskEdit}
                    onTaskRemove={handleTaskRemove}
                    onTaskSelect={handleTaskSelect}
                    isTaskSelected={isTaskSelected}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {phases.length === 0 && (
        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-lg font-medium">No phases found</p>
          <p>This roadmap doesn't contain any phases to edit.</p>
        </div>
      )}

      {/* Task Edit Modal */}
      <TaskEditModal
        isOpen={!!editingTask}
        onClose={handleCloseEditModal}
        task={editingTask}
        phaseId={editingPhaseId}
      />

      {/* Advanced Task Creation Modal */}
      <TaskFormModal
        isOpen={!!showAdvancedModal}
        onClose={handleAdvancedModalClose}
        phaseId={showAdvancedModal}
        phaseTitle={
          phases.find((p) => p.phase_id === showAdvancedModal)?.phase_title
        }
      />

      {/* Phase Settings Modal */}
      <PhaseSettingsModal
        isOpen={!!showPhaseSettings}
        onClose={handlePhaseSettingsClose}
        phaseId={showPhaseSettings}
        phaseData={phases.find((p) => p.phase_id === showPhaseSettings)}
      />

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

export default EditorTaskManager;
