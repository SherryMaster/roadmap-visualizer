import React, { useState } from 'react';
import PublicTask from '../task/PublicTask';
import OwnerTask from '../task/OwnerTask';
import { TaskCompletionProvider } from '../../context/TaskCompletionContext';

const TaskDetailTest = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mockTask = {
    task_id: 'test-task-1',
    task_title: 'Test Task for Access Control',
    task_summary: 'This is a test task to verify access control functionality',
    task_detail: {
      explanation: {
        content: 'This is the detailed explanation of the task. It should be visible to both owners and public users, but only owners should see progress tracking features.',
        format: 'plaintext'
      },
      difficulty: 'intermediate',
      est_time: '2-3 hours',
      subtasks: [
        { description: 'First subtask' },
        { description: 'Second subtask' },
        { description: 'Third subtask' }
      ],
      notes: 'These are private notes that should only be visible to owners'
    },
    task_dependencies: []
  };

  const mockRoadmapData = {
    title: 'Test Roadmap',
    description: 'A test roadmap for access control',
    project_level: 'beginner',
    tags: ['test', 'demo'],
    roadmap: [{
      phase_number: 1,
      phase_title: 'Test Phase',
      phase_id: 'test-phase-1',
      phase_tasks: [mockTask]
    }]
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Task Detail Access Control Test
        </h1>

        <div className="mb-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'} Task Details
          </button>
        </div>

        {/* Owner View with TaskCompletionProvider */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Owner View (with Progress Tracking)
          </h2>
          <TaskCompletionProvider roadmapData={mockRoadmapData} roadmapId="test-roadmap">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <OwnerTask
                task={mockTask}
                isExpanded={isExpanded}
                onClick={() => setIsExpanded(!isExpanded)}
                phaseNumber={1}
                taskIndex={0}
              />
            </div>
          </TaskCompletionProvider>
        </div>

        {/* Public View without TaskCompletionProvider */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Public View (Static, No Progress Tracking)
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <PublicTask
              task={mockTask}
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
              phaseNumber={1}
              taskIndex={0}
            />
          </div>
        </div>

        {/* Test without any provider to simulate the error */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Owner Task without Provider (Should Not Error)
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-4">
              <p className="text-sm">
                <strong>Test:</strong> This tests if OwnerTask component works without TaskCompletionProvider. 
                It should show default values and not crash.
              </p>
            </div>
            <OwnerTask
              task={mockTask}
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
              phaseNumber={1}
              taskIndex={0}
            />
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Expected Behavior
          </h2>
          <div className="space-y-2 text-sm">
            <p><strong>Owner View:</strong> Shows completion checkbox, progress tracking, task notes</p>
            <p><strong>Public View:</strong> Shows static content only, no completion controls</p>
            <p><strong>Owner without Provider:</strong> Should work with default values, no errors</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailTest;
