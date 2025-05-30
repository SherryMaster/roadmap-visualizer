import { useState } from "react";
import { useEditor } from "../context/EditorContext";

const BatchOperations = ({ selectedTasks, onClearSelection, roadmap }) => {
  const { removeTask, moveTask } = useEditor();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [targetPhaseId, setTargetPhaseId] = useState("");

  const phases = roadmap?.roadmap?.phases || roadmap?.roadmap || [];
  const selectedCount = selectedTasks.size;

  if (selectedCount === 0) return null;

  const parseTaskKey = (taskKey) => {
    const [phaseId, taskId] = taskKey.split('-');
    return { phaseId, taskId };
  };

  const getSelectedTasksInfo = () => {
    const tasksInfo = [];
    selectedTasks.forEach(taskKey => {
      const { phaseId, taskId } = parseTaskKey(taskKey);
      const phase = phases.find(p => p.phase_id === phaseId);
      const task = phase?.phase_tasks?.find(t => t.task_id === taskId);
      if (task) {
        tasksInfo.push({ phaseId, taskId, task, phase });
      }
    });
    return tasksInfo;
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedCount} selected task(s)?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const tasksInfo = getSelectedTasksInfo();
      let successCount = 0;

      for (const { phaseId, taskId } of tasksInfo) {
        const result = removeTask(phaseId, taskId);
        if (result.success) {
          successCount++;
        }
      }

      onClearSelection();
      
      if (successCount === tasksInfo.length) {
        // All tasks deleted successfully
      } else {
        console.warn(`Only ${successCount}/${tasksInfo.length} tasks were deleted successfully`);
      }
    } catch (error) {
      console.error("Error during batch delete:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchMove = () => {
    setShowMoveModal(true);
  };

  const executeBatchMove = async () => {
    if (!targetPhaseId) return;

    setIsProcessing(true);
    try {
      const tasksInfo = getSelectedTasksInfo();
      let successCount = 0;

      for (const { phaseId, taskId } of tasksInfo) {
        if (phaseId !== targetPhaseId) {
          const result = moveTask(phaseId, targetPhaseId, taskId);
          if (result.success) {
            successCount++;
          }
        } else {
          successCount++; // Already in target phase
        }
      }

      onClearSelection();
      setShowMoveModal(false);
      setTargetPhaseId("");
      
      if (successCount === tasksInfo.length) {
        // All tasks moved successfully
      } else {
        console.warn(`Only ${successCount}/${tasksInfo.length} tasks were moved successfully`);
      }
    } catch (error) {
      console.error("Error during batch move:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangePriority = async (newPriority) => {
    setIsProcessing(true);
    try {
      const tasksInfo = getSelectedTasksInfo();
      let successCount = 0;

      for (const { phaseId, taskId } of tasksInfo) {
        // This would need to be implemented in the editor context
        // const result = updateTaskProperty(phaseId, taskId, 'task_priority', newPriority);
        // if (result.success) {
        //   successCount++;
        // }
        successCount++; // Placeholder
      }

      onClearSelection();
    } catch (error) {
      console.error("Error during batch priority change:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-blue-800 dark:text-blue-200">
                {selectedCount} task{selectedCount > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleBatchMove}
                disabled={isProcessing}
                className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Move
              </button>

              <div className="relative">
                <select
                  onChange={(e) => handleChangePriority(e.target.value)}
                  disabled={isProcessing}
                  className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>Set Priority</option>
                  <option value="low">Low</option>
                  <option value="mid">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <button
                onClick={handleBatchDelete}
                disabled={isProcessing}
                className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>

          <button
            onClick={onClearSelection}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selected Tasks Summary */}
        <div className="mt-3 text-sm text-blue-700 dark:text-blue-300">
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedTasks).slice(0, 5).map(taskKey => {
              const { phaseId, taskId } = parseTaskKey(taskKey);
              const phase = phases.find(p => p.phase_id === phaseId);
              const task = phase?.phase_tasks?.find(t => t.task_id === taskId);
              return (
                <span key={taskKey} className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">
                  {task?.task_title || taskId}
                </span>
              );
            })}
            {selectedCount > 5 && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                +{selectedCount - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Move Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Move Selected Tasks
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Move {selectedCount} selected task{selectedCount > 1 ? 's' : ''} to:
            </p>

            <select
              value={targetPhaseId}
              onChange={(e) => setTargetPhaseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
            >
              <option value="">Select target phase...</option>
              {phases.map(phase => (
                <option key={phase.phase_id} value={phase.phase_id}>
                  {phase.phase_title}
                </option>
              ))}
            </select>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowMoveModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeBatchMove}
                disabled={!targetPhaseId || isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? "Moving..." : "Move Tasks"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatchOperations;
