import { createContext, useContext, useState, useCallback } from "react";
import RoadmapEditor from "../utils/RoadmapEditor";
import RoadmapPersistence from "../utils/RoadmapPersistence";
import { useAuth } from "./AuthContext";
import { useFirestore } from "./FirestoreContext";

const EditorContext = createContext();

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};

export const EditorProvider = ({ children, initialRoadmap, roadmapId }) => {
  // Hooks for authentication and Firestore
  const { currentUser } = useAuth();
  const { updateRoadmap } = useFirestore();

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

        // Include override information for addTask operations
        const operationInfo = newRoadmap._operationInfo || {};
        return {
          success: validation.isValid,
          roadmap: newRoadmap,
          validation,
          isOverride: operationInfo.isOverride,
          taskId: operationInfo.taskId,
        };
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

              // Include override information in the result
              const operationInfo = newRoadmap._operationInfo || {};
              results.push({
                success: true,
                roadmap: newRoadmap,
                validation,
                isOverride: operationInfo.isOverride,
                taskId: operationInfo.taskId,
              });
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
      if (roadmapId) {
        console.log("🔄 Editor: Saving roadmap changes:", {
          roadmapId,
          userAuthenticated: !!currentUser,
          hasUpdateFunction: !!updateRoadmap,
        });

        // Try Firestore first if user is authenticated
        if (currentUser && updateRoadmap) {
          try {
            console.log("💾 Editor: Updating roadmap in Firestore");
            await updateRoadmap(roadmapId, currentRoadmap);
            console.log("✅ Editor: Successfully updated roadmap in Firestore");
            return { success: true };
          } catch (firestoreError) {
            console.warn(
              "⚠️ Editor: Firestore update failed, falling back to localStorage:",
              firestoreError.message
            );
            // For Firestore roadmaps that don't exist in localStorage, create them
            try {
              // First try to update if it exists
              const success = RoadmapPersistence.updateRoadmapData(
                roadmapId,
                currentRoadmap
              );

              if (success) {
                console.log(
                  "✅ Editor: Successfully updated roadmap in localStorage"
                );
                return { success: true };
              } else {
                // If update fails, try to save as new roadmap in localStorage
                console.log(
                  "💾 Editor: Creating roadmap in localStorage as fallback"
                );
                const newRoadmapId =
                  RoadmapPersistence.saveRoadmap(currentRoadmap);
                console.log(
                  "✅ Editor: Created new roadmap in localStorage:",
                  newRoadmapId
                );

                // Note: This creates a new ID, but we'll still return success
                return {
                  success: true,
                  message:
                    "Saved to local storage with new ID due to sync issues",
                  newRoadmapId: newRoadmapId,
                };
              }
            } catch (localStorageError) {
              console.error(
                "❌ Editor: localStorage fallback also failed:",
                localStorageError.message
              );
              throw new Error(
                `Failed to update roadmap: Firestore (${firestoreError.message}) and localStorage (${localStorageError.message})`
              );
            }
          }
        } else {
          // Update in localStorage for unauthenticated users
          console.log(
            "💾 Editor: Updating roadmap in localStorage (user not authenticated)"
          );
          const success = RoadmapPersistence.updateRoadmapData(
            roadmapId,
            currentRoadmap
          );

          if (success) {
            console.log(
              "✅ Editor: Successfully updated roadmap in localStorage"
            );
            return { success: true };
          } else {
            throw new Error("Failed to update roadmap in localStorage");
          }
        }
      } else {
        // Fallback to download if no roadmapId (shouldn't happen in normal editor flow)
        console.log("📥 Editor: No roadmapId, downloading edited roadmap");
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
      }
    } catch (error) {
      console.error("❌ Editor: Save error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, [currentRoadmap, validationStatus, roadmapId, currentUser, updateRoadmap]);

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
