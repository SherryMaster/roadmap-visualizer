import { createContext, useContext, useState, useCallback } from "react";
import RoadmapEditor from "../utils/RoadmapEditor";

const EditorContext = createContext();

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};

export const EditorProvider = ({ children, initialRoadmap, roadmapId }) => {
  // Core state
  const [originalRoadmap] = useState(initialRoadmap);
  const [currentRoadmap, setCurrentRoadmap] = useState(initialRoadmap);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [changes, setChanges] = useState([]);
  const [validationStatus, setValidationStatus] = useState({
    isValid: true,
    errors: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // Computed properties
  const isModified =
    JSON.stringify(originalRoadmap) !== JSON.stringify(currentRoadmap);
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  // Add operation to history
  const addToHistory = useCallback(
    (operation, previousState) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        operation,
        previousState,
        timestamp: Date.now(),
      });

      // Limit history size
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(historyIndex + 1);
      }

      setHistory(newHistory);
    },
    [history, historyIndex]
  );

  // Execute operation with history tracking
  const executeOperation = useCallback(
    (operation, operationData) => {
      const previousState = JSON.parse(JSON.stringify(currentRoadmap));

      try {
        let newRoadmap;

        switch (operation) {
          case "addTask":
            newRoadmap = RoadmapEditor.addTask(
              currentRoadmap,
              operationData.phaseId,
              operationData.taskData,
              operationData.position
            );
            break;
          case "removeTask":
            newRoadmap = RoadmapEditor.removeTask(
              currentRoadmap,
              operationData.phaseId,
              operationData.taskId
            );
            break;
          case "replaceTask":
            newRoadmap = RoadmapEditor.replaceTask(
              currentRoadmap,
              operationData.phaseId,
              operationData.taskId,
              operationData.newTaskData
            );
            break;
          case "moveTask":
            newRoadmap = RoadmapEditor.moveTask(
              currentRoadmap,
              operationData.fromPhase,
              operationData.toPhase,
              operationData.taskId,
              operationData.position
            );
            break;
          case "updateTaskProperty":
            newRoadmap = RoadmapEditor.updateTaskProperty(
              currentRoadmap,
              operationData.phaseId,
              operationData.taskId,
              operationData.property,
              operationData.value
            );
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        if (!newRoadmap) {
          throw new Error(`Operation ${operation} failed`);
        }

        // Validate the result
        const validation = RoadmapEditor.validateRoadmap(newRoadmap);
        setValidationStatus(validation);

        if (validation.isValid) {
          setCurrentRoadmap(newRoadmap);
          addToHistory(operation, previousState);

          // Track the change
          setChanges((prev) => [
            ...prev,
            {
              operation,
              data: operationData,
              timestamp: Date.now(),
            },
          ]);
        }

        return { success: validation.isValid, roadmap: newRoadmap, validation };
      } catch (error) {
        console.error(`Error executing operation ${operation}:`, error);
        return { success: false, error: error.message };
      }
    },
    [currentRoadmap, addToHistory]
  );

  // Undo operation
  const undo = useCallback(() => {
    if (!canUndo) return false;

    const historyItem = history[historyIndex];
    setCurrentRoadmap(historyItem.previousState);
    setHistoryIndex(historyIndex - 1);

    // Remove the last change
    setChanges((prev) => prev.slice(0, -1));

    // Revalidate
    const validation = RoadmapEditor.validateRoadmap(historyItem.previousState);
    setValidationStatus(validation);

    return true;
  }, [canUndo, history, historyIndex]);

  // Redo operation
  const redo = useCallback(() => {
    if (!canRedo) return false;

    const nextIndex = historyIndex + 1;
    const nextHistoryItem = history[nextIndex];

    // Re-execute the operation
    const result = executeOperation(
      nextHistoryItem.operation,
      nextHistoryItem.data
    );
    if (result.success) {
      setHistoryIndex(nextIndex);
      return true;
    }

    return false;
  }, [canRedo, history, historyIndex, executeOperation]);

  // Reset to original state
  const reset = useCallback(() => {
    setCurrentRoadmap(originalRoadmap);
    setHistory([]);
    setHistoryIndex(-1);
    setChanges([]);
    setValidationStatus({ isValid: true, errors: [] });
  }, [originalRoadmap]);

  // Task operation methods
  const addTask = useCallback(
    (phaseId, taskData, position) => {
      return executeOperation("addTask", { phaseId, taskData, position });
    },
    [executeOperation]
  );

  const removeTask = useCallback(
    (phaseId, taskId) => {
      return executeOperation("removeTask", { phaseId, taskId });
    },
    [executeOperation]
  );

  const replaceTask = useCallback(
    (phaseId, taskId, newTaskData) => {
      return executeOperation("replaceTask", { phaseId, taskId, newTaskData });
    },
    [executeOperation]
  );

  const moveTask = useCallback(
    (fromPhase, toPhase, taskId, position) => {
      return executeOperation("moveTask", {
        fromPhase,
        toPhase,
        taskId,
        position,
      });
    },
    [executeOperation]
  );

  const updateTaskProperty = useCallback(
    (phaseId, taskId, property, value) => {
      return executeOperation("updateTaskProperty", {
        phaseId,
        taskId,
        property,
        value,
      });
    },
    [executeOperation]
  );

  // Batch operations
  const addMultipleTasks = useCallback(
    (tasks) => {
      const results = [];
      let workingRoadmap = currentRoadmap;

      for (const { phaseId, taskData, position } of tasks) {
        try {
          // Use the working roadmap for each operation to chain them properly
          const newRoadmap = RoadmapEditor.addTask(
            workingRoadmap,
            phaseId,
            taskData,
            position
          );

          if (newRoadmap) {
            // Validate the result
            const validation = RoadmapEditor.validateRoadmap(newRoadmap);

            if (validation.isValid) {
              workingRoadmap = newRoadmap; // Update working roadmap for next iteration
              results.push({ success: true, roadmap: newRoadmap, validation });
            } else {
              results.push({
                success: false,
                error: `Validation failed: ${validation.errors.join(", ")}`,
                validation,
              });
            }
          } else {
            results.push({ success: false, error: "Failed to add task" });
          }
        } catch (error) {
          results.push({ success: false, error: error.message });
        }
      }

      // Update the current roadmap with the final result if any tasks were successful
      const successfulResults = results.filter((r) => r.success);
      if (successfulResults.length > 0) {
        const finalRoadmap =
          successfulResults[successfulResults.length - 1].roadmap;
        const finalValidation = RoadmapEditor.validateRoadmap(finalRoadmap);

        setCurrentRoadmap(finalRoadmap);
        setValidationStatus(finalValidation);

        // Add to history as a batch operation
        addToHistory("addMultipleTasks", currentRoadmap);

        // Track the changes
        setChanges((prev) => [
          ...prev,
          {
            operation: "addMultipleTasks",
            data: {
              tasksAdded: successfulResults.length,
              totalTasks: tasks.length,
            },
            timestamp: Date.now(),
          },
        ]);
      }

      return results;
    },
    [currentRoadmap, addToHistory]
  );

  // Save operation
  const save = useCallback(async () => {
    if (!validationStatus.isValid) {
      return { success: false, error: "Cannot save invalid roadmap" };
    }

    setIsSaving(true);
    try {
      // Transform to schema format and trigger download
      const schemaData = RoadmapEditor.transformToSchema(currentRoadmap);
      const blob = new Blob([JSON.stringify(schemaData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentRoadmap.title.replace(
        /\s+/g,
        "_"
      )}_edited.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error("Error saving roadmap:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, [currentRoadmap, validationStatus]);

  const value = {
    // State
    originalRoadmap,
    currentRoadmap,
    history,
    changes,
    validationStatus,
    isModified,
    isSaving,
    canUndo,
    canRedo,

    // Operations
    addTask,
    removeTask,
    replaceTask,
    moveTask,
    updateTaskProperty,
    addMultipleTasks,

    // History
    undo,
    redo,
    reset,

    // Save
    save,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};
