import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TaskCompletionProvider, useTaskCompletion } from '../context/TaskCompletionContext';

// Test component to interact with the context
const TestComponent = ({ enableDependencies = true }) => {
  const {
    toggleTaskCompletionWithValidation,
    getDependencyStatus,
    isTaskCompleted
  } = useTaskCompletion();

  const handleToggleTask = () => {
    const dependencies = [
      { type: 'required', phaseNumber: 1, taskIndex: 0 }
    ];
    const result = toggleTaskCompletionWithValidation(1, 1, dependencies);
    return result;
  };

  const dependencyStatus = getDependencyStatus([
    { type: 'required', phaseNumber: 1, taskIndex: 0 }
  ]);

  return (
    <div>
      <div data-testid="can-complete">{dependencyStatus.canComplete.toString()}</div>
      <div data-testid="task-completed">{isTaskCompleted(1, 1).toString()}</div>
      <div data-testid="prerequisite-completed">{isTaskCompleted(1, 0).toString()}</div>
      <button onClick={handleToggleTask} data-testid="toggle-task">
        Toggle Task
      </button>
    </div>
  );
};

// Mock roadmap data
const mockRoadmapData = {
  roadmap: [
    {
      phase_number: 1,
      phase_tasks: [
        { task_id: 'task-1-0', task_title: 'Prerequisite Task' },
        { task_id: 'task-1-1', task_title: 'Dependent Task' }
      ]
    }
  ]
};

describe('TaskCompletionContext with Dependencies', () => {
  test('blocks task completion when dependencies enabled and prerequisites not met', () => {
    render(
      <TaskCompletionProvider
        roadmapData={mockRoadmapData}
        roadmapId="test-roadmap"
        enableDependencies={true}
      >
        <TestComponent />
      </TaskCompletionProvider>
    );

    // Initially, dependent task cannot be completed
    expect(screen.getByTestId('can-complete')).toHaveTextContent('false');
    expect(screen.getByTestId('prerequisite-completed')).toHaveTextContent('false');
    
    // Try to toggle dependent task - should be blocked
    fireEvent.click(screen.getByTestId('toggle-task'));
    expect(screen.getByTestId('task-completed')).toHaveTextContent('false');
  });

  test('allows task completion when dependencies disabled', () => {
    render(
      <TaskCompletionProvider
        roadmapData={mockRoadmapData}
        roadmapId="test-roadmap"
        enableDependencies={false}
      >
        <TestComponent />
      </TaskCompletionProvider>
    );

    // When dependencies are disabled, task can be completed regardless
    expect(screen.getByTestId('can-complete')).toHaveTextContent('true');
    expect(screen.getByTestId('prerequisite-completed')).toHaveTextContent('false');
    
    // Try to toggle dependent task - should succeed
    fireEvent.click(screen.getByTestId('toggle-task'));
    expect(screen.getByTestId('task-completed')).toHaveTextContent('true');
  });

  test('allows task completion when dependencies enabled and prerequisites met', () => {
    const TestComponentWithPrerequisite = () => {
      const {
        toggleTaskCompletion,
        toggleTaskCompletionWithValidation,
        getDependencyStatus,
        isTaskCompleted
      } = useTaskCompletion();

      const handleTogglePrerequisite = () => {
        toggleTaskCompletion(1, 0); // Complete prerequisite first
      };

      const handleToggleDependent = () => {
        const dependencies = [
          { type: 'required', phaseNumber: 1, taskIndex: 0 }
        ];
        return toggleTaskCompletionWithValidation(1, 1, dependencies);
      };

      const dependencyStatus = getDependencyStatus([
        { type: 'required', phaseNumber: 1, taskIndex: 0 }
      ]);

      return (
        <div>
          <div data-testid="can-complete">{dependencyStatus.canComplete.toString()}</div>
          <div data-testid="task-completed">{isTaskCompleted(1, 1).toString()}</div>
          <div data-testid="prerequisite-completed">{isTaskCompleted(1, 0).toString()}</div>
          <button onClick={handleTogglePrerequisite} data-testid="toggle-prerequisite">
            Toggle Prerequisite
          </button>
          <button onClick={handleToggleDependent} data-testid="toggle-dependent">
            Toggle Dependent
          </button>
        </div>
      );
    };

    render(
      <TaskCompletionProvider
        roadmapData={mockRoadmapData}
        roadmapId="test-roadmap"
        enableDependencies={true}
      >
        <TestComponentWithPrerequisite />
      </TaskCompletionProvider>
    );

    // Initially, dependent task cannot be completed
    expect(screen.getByTestId('can-complete')).toHaveTextContent('false');
    
    // Complete prerequisite first
    fireEvent.click(screen.getByTestId('toggle-prerequisite'));
    expect(screen.getByTestId('prerequisite-completed')).toHaveTextContent('true');
    
    // Now dependent task should be allowed
    expect(screen.getByTestId('can-complete')).toHaveTextContent('true');
    
    // Toggle dependent task - should succeed
    fireEvent.click(screen.getByTestId('toggle-dependent'));
    expect(screen.getByTestId('task-completed')).toHaveTextContent('true');
  });
});
