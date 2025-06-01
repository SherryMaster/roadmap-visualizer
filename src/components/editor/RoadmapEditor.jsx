import { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData } from "react-router-dom";
import { EditorProvider, useEditor } from "../../context/EditorContext";
import Breadcrumb from "../layout/Breadcrumb";
import ThemeSelector from "../layout/ThemeSelector";
import EditorControls from "./EditorControls";
import EditorTaskUpload from "./EditorTaskUpload";
import EditorTaskManager from "./EditorTaskManager";
import EditorPreview from "./EditorPreview";
import ValidationPanel from "../feedback/ValidationPanel";
import KeyboardShortcuts from "../ui/KeyboardShortcuts";
import ErrorBoundary from "../feedback/ErrorBoundary";
import PerformanceMonitor from "../ui/PerformanceMonitor";
import { EditorSkeleton, SaveIndicator } from "../feedback/LoadingStates";
import { useAriaLive, useReducedMotion } from "../../hooks/useAccessibility";
import usePageTitle from "../../hooks/usePageTitle";

const RoadmapEditorContent = () => {
  const { roadmapId } = useParams();
  const navigate = useNavigate();
  const {
    currentRoadmap,
    isModified,
    validationStatus,
    canUndo,
    canRedo,
    undo,
    redo,
    reset,
    save,
    isSaving,
  } = useEditor();

  const [showPreview, setShowPreview] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Accessibility hooks
  const { announce } = useAriaLive();
  const { getTransitionDuration } = useReducedMotion();

  // Set dynamic page title
  usePageTitle(`Edit ${currentRoadmap?.title || "Roadmap"}`);

  // Handle navigation away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isModified) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isModified]);

  const handleSave = async () => {
    setIsLoading(true);
    announce("Saving roadmap changes...", "polite");

    try {
      const result = await save();
      if (result.success) {
        setLastSaved(new Date().toLocaleTimeString());
        announce("Roadmap saved successfully", "polite");
        // Navigate back to roadmap view
        navigate(`/roadmap/${roadmapId}`);
      } else {
        console.error("Save failed:", result.error);
        announce(`Save failed: ${result.error}`, "assertive");
      }
    } catch (error) {
      console.error("Save error:", error);
      announce(`Save error: ${error.message}`, "assertive");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isModified) {
      setShowUnsavedWarning(true);
    } else {
      navigate(`/roadmap/${roadmapId}`);
    }
  };

  const handleConfirmCancel = () => {
    setShowUnsavedWarning(false);
    navigate(`/roadmap/${roadmapId}`);
  };

  const handleReset = () => {
    reset();
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  if (!currentRoadmap || isLoading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <div className="flex-1 min-w-0">
            <Breadcrumb
              roadmapTitle={currentRoadmap.title}
              currentPhase={null}
              isEditing={true}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <SaveIndicator
              isSaving={isSaving}
              lastSaved={lastSaved}
              hasUnsavedChanges={isModified}
            />
            <ThemeSelector />
          </div>
        </div>

        {/* Editor Controls */}
        <EditorControls
          isModified={isModified}
          validationStatus={validationStatus}
          canUndo={canUndo}
          canRedo={canRedo}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleCancel}
          onReset={handleReset}
          onPreview={handlePreview}
          onUndo={undo}
          onRedo={redo}
          showPreview={showPreview}
        />

        {/* Enhanced Validation Panel */}
        <ValidationPanel />

        {/* Main Editor Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Task Upload Zone */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <EditorTaskUpload />
          </div>

          {/* Task Manager */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {showPreview ? (
              <EditorPreview roadmap={currentRoadmap} />
            ) : (
              <EditorTaskManager roadmap={currentRoadmap} />
            )}
          </div>
        </div>

        {/* Unsaved Changes Warning Modal */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Unsaved Changes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You have unsaved changes. Are you sure you want to leave without
                saving?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 px-4 py-3 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors min-h-[44px] sm:min-h-auto"
                >
                  Leave Without Saving
                </button>
                <button
                  onClick={() => setShowUnsavedWarning(false)}
                  className="flex-1 px-4 py-3 sm:py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors min-h-[44px] sm:min-h-auto"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts
          onTogglePreview={handlePreview}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* Performance Monitor */}
        <PerformanceMonitor />
      </div>
    </div>
  );
};

const RoadmapEditor = () => {
  const { roadmapData, roadmapId } = useLoaderData();

  if (!roadmapData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Roadmap Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested roadmap could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onReset={() => window.location.reload()}>
      <EditorProvider initialRoadmap={roadmapData} roadmapId={roadmapId}>
        <RoadmapEditorContent />
      </EditorProvider>
    </ErrorBoundary>
  );
};

export default RoadmapEditor;
