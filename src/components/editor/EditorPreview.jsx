import React from "react";
import PhaseList from "../roadmap/PhaseList";
import RoadmapHeader from "../roadmap/RoadmapHeader";
import { TaskCompletionProvider } from "../../context/TaskCompletionContext";

const EditorPreview = ({ roadmap }) => {
  if (!roadmap) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="text-gray-500 dark:text-gray-400">
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <p className="text-lg font-medium">No roadmap to preview</p>
          <p>Load a roadmap to see the preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Preview Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Roadmap Preview
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          This is how your roadmap will appear to users. All interactive
          features are disabled in preview mode.
        </p>
      </div>

      {/* Preview Content */}
      <div className="p-6">
        <TaskCompletionProvider roadmapData={roadmap} roadmapId="preview">
          <div className="space-y-6">
            {/* Roadmap Header Preview */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Roadmap Header
              </div>
              <RoadmapHeader
                title={roadmap.title}
                description={roadmap.description}
                projectLevel={roadmap.project_level}
                tags={roadmap.tags}
              />
            </div>

            {/* Phases Preview */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wide">
                Phases & Tasks
              </div>

              {/* Preview Notice */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Preview mode: Task completion and interactive features are
                    disabled
                  </span>
                </div>
              </div>

              <PhaseList
                phases={roadmap.roadmap?.phases || roadmap.roadmap || []}
                isPreview={true}
              />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {roadmap.roadmap?.phases?.length ||
                    roadmap.roadmap?.length ||
                    0}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  Total Phases
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(roadmap.roadmap?.phases || roadmap.roadmap || []).reduce(
                    (total, phase) => total + (phase.phase_tasks?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-green-800 dark:text-green-200">
                  Total Tasks
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {roadmap.project_level || "N/A"}
                </div>
                <div className="text-sm text-purple-800 dark:text-purple-200">
                  Difficulty Level
                </div>
              </div>
            </div>

            {/* Validation Status in Preview */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Roadmap Validation
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Roadmap structure is valid and ready for use
                </span>
              </div>
            </div>
          </div>
        </TaskCompletionProvider>
      </div>
    </div>
  );
};

export default EditorPreview;
