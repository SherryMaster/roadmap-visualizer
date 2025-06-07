import React from "react";
import useRoadmapAccess from "../../hooks/useRoadmapAccess";
import OwnerPhase from "../roadmap/OwnerPhase";
import PublicPhase from "../roadmap/PublicPhase";
import OwnerProgressIndicator from "../ui/OwnerProgressIndicator";
import { TaskCompletionProvider } from "../../context/TaskCompletionContext";

const AccessControlDemo = () => {
  // Mock data for testing
  const mockMetadata = {
    id: "test-roadmap",
    title: "Test Roadmap",
    description: "A test roadmap for access control",
    userId: "test-user-123",
    isPublic: true,
    allowDownload: true,
  };

  const mockPhase = {
    phase_number: 1,
    phase_title: "Test Phase",
    phase_id: "test-phase-1",
    phase_tasks: [
      {
        task_id: "task-1",
        task_title: "Test Task 1",
        task_summary: "This is a test task for demonstration",
        task_detail: {
          explanation: "Detailed explanation of the test task",
        },
      },
      {
        task_id: "task-2",
        task_title: "Test Task 2",
        task_summary: "Another test task for demonstration",
        task_detail: {
          explanation: "Another detailed explanation",
        },
      },
    ],
  };

  const mockRoadmapData = {
    title: "Test Roadmap",
    description: "A test roadmap for access control",
    project_level: "beginner",
    tags: ["test", "demo"],
    roadmap: [mockPhase], // Add the roadmap structure that TaskCompletionProvider expects
  };

  // Test different access scenarios
  const ownerAccess = useRoadmapAccess(mockMetadata, mockRoadmapData);
  const publicAccess = useRoadmapAccess(
    { ...mockMetadata, userId: "different-user" },
    mockRoadmapData
  );

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Access Control Demo
        </h1>

        {/* Access Control Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Owner Access
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Is Owner:</strong> {ownerAccess.isOwner ? "Yes" : "No"}
              </p>
              <p>
                <strong>Can Track Progress:</strong>{" "}
                {ownerAccess.canTrackProgress ? "Yes" : "No"}
              </p>
              <p>
                <strong>Can Edit:</strong> {ownerAccess.canEdit ? "Yes" : "No"}
              </p>
              <p>
                <strong>Can Download:</strong>{" "}
                {ownerAccess.canDownload ? "Yes" : "No"}
              </p>
              <p>
                <strong>Access Level:</strong> {ownerAccess.accessLevel}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Public Access
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Is Owner:</strong> {publicAccess.isOwner ? "Yes" : "No"}
              </p>
              <p>
                <strong>Can Track Progress:</strong>{" "}
                {publicAccess.canTrackProgress ? "Yes" : "No"}
              </p>
              <p>
                <strong>Can Edit:</strong> {publicAccess.canEdit ? "Yes" : "No"}
              </p>
              <p>
                <strong>Can Download:</strong>{" "}
                {publicAccess.canDownload ? "Yes" : "No"}
              </p>
              <p>
                <strong>Access Level:</strong> {publicAccess.accessLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Owner View Demo */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Owner View (with Progress Tracking)
          </h2>
          <TaskCompletionProvider
            roadmapData={mockRoadmapData}
            roadmapId="demo-roadmap"
          >
            <div className="space-y-6">
              <OwnerProgressIndicator phases={[mockPhase]} />
              <OwnerPhase
                phase={mockPhase}
                isExpanded={true}
                isActive={true}
                onClick={() => {}}
              />
            </div>
          </TaskCompletionProvider>
        </div>

        {/* Public View Demo */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Public View (Static, No Progress Tracking)
          </h2>
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-4 rounded-md">
              <p className="text-sm">
                <strong>Note:</strong> Progress indicator is hidden in public
                view. Tasks show no completion controls or progress tracking
                features.
              </p>
            </div>
            <PublicPhase
              phase={mockPhase}
              isExpanded={true}
              isActive={true}
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-center py-2">Owner View</th>
                  <th className="text-center py-2">Public View</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">Progress Indicator</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">Task Completion Checkboxes</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">Progress Bars</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">Task Notes</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">Subtask Completion</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">Edit Access</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">❌</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">Roadmap Content</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                </tr>
                <tr>
                  <td className="py-2">Download (if allowed)</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControlDemo;
