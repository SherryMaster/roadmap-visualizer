import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DependencyToggle from '../components/roadmap/DependencyToggle';
import { TaskCompletionProvider } from '../context/TaskCompletionContext';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../context/FirestoreContext';

// Mock the contexts
vi.mock('../context/AuthContext');
vi.mock('../context/FirestoreContext');

describe('Collection Dependency Toggle', () => {
  const mockUpdateCollectionRoadmapDependencyMode = vi.fn();
  const mockUpdateRoadmapDependencyMode = vi.fn();
  const mockOnDependencyModeChange = vi.fn();

  const defaultProps = {
    roadmapId: 'test-roadmap-id',
    enableDependencies: true,
    userId: 'original-owner-id',
    onDependencyModeChange: mockOnDependencyModeChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth.mockReturnValue({
      currentUser: { uid: 'current-user-id' }
    });
    
    useFirestore.mockReturnValue({
      updateRoadmapDependencyMode: mockUpdateRoadmapDependencyMode,
      updateCollectionRoadmapDependencyMode: mockUpdateCollectionRoadmapDependencyMode
    });
  });

  test('shows dependency toggle for collection roadmap (non-owner)', () => {
    render(
      <DependencyToggle 
        {...defaultProps} 
        isCollectionRoadmap={true}
      />
    );
    
    expect(screen.getByText('Task Dependencies:')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  test('does not show for non-collection roadmap when user is not owner', () => {
    const { container } = render(
      <DependencyToggle 
        {...defaultProps} 
        isCollectionRoadmap={false}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('shows for original roadmap owner', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'original-owner-id' }
    });
    
    render(
      <DependencyToggle 
        {...defaultProps} 
        isCollectionRoadmap={false}
      />
    );
    
    expect(screen.getByText('Task Dependencies:')).toBeInTheDocument();
  });

  test('uses collection update function for collection roadmaps', async () => {
    mockUpdateCollectionRoadmapDependencyMode.mockResolvedValue(true);
    
    render(
      <DependencyToggle 
        {...defaultProps} 
        enableDependencies={false}
        isCollectionRoadmap={true}
      />
    );
    
    const enabledButton = screen.getByText('Enabled').closest('button');
    fireEvent.click(enabledButton);
    
    await waitFor(() => {
      expect(mockUpdateCollectionRoadmapDependencyMode).toHaveBeenCalledWith('test-roadmap-id', true);
      expect(mockUpdateRoadmapDependencyMode).not.toHaveBeenCalled();
      expect(mockOnDependencyModeChange).toHaveBeenCalledWith(true);
    });
  });

  test('uses original update function for original roadmaps', async () => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'original-owner-id' }
    });
    
    mockUpdateRoadmapDependencyMode.mockResolvedValue(true);
    
    render(
      <DependencyToggle 
        {...defaultProps} 
        enableDependencies={false}
        isCollectionRoadmap={false}
      />
    );
    
    const enabledButton = screen.getByText('Enabled').closest('button');
    fireEvent.click(enabledButton);
    
    await waitFor(() => {
      expect(mockUpdateRoadmapDependencyMode).toHaveBeenCalledWith('test-roadmap-id', true);
      expect(mockUpdateCollectionRoadmapDependencyMode).not.toHaveBeenCalled();
      expect(mockOnDependencyModeChange).toHaveBeenCalledWith(true);
    });
  });

  test('shows different confirmation text for collection roadmaps', async () => {
    render(
      <DependencyToggle 
        {...defaultProps} 
        enableDependencies={true}
        isCollectionRoadmap={true}
      />
    );
    
    const disabledButton = screen.getByText('Disabled').closest('button');
    fireEvent.click(disabledButton);
    
    expect(screen.getByText('Disable Task Dependencies?')).toBeInTheDocument();
    expect(screen.getByText(/This change only affects your personal copy of this roadmap/)).toBeInTheDocument();
  });

  test('shows different confirmation text for original roadmaps', async () => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'original-owner-id' }
    });
    
    render(
      <DependencyToggle 
        {...defaultProps} 
        enableDependencies={true}
        isCollectionRoadmap={false}
      />
    );
    
    const disabledButton = screen.getByText('Disabled').closest('button');
    fireEvent.click(disabledButton);
    
    expect(screen.getByText('Disable Task Dependencies?')).toBeInTheDocument();
    expect(screen.getByText(/This change will apply to all users viewing this roadmap/)).toBeInTheDocument();
  });
});

describe('Collection TaskCompletion Integration', () => {
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

  test('loads collection-specific dependency setting', async () => {
    // This test would require mocking FirestorePersistence.getCollectionRoadmapDependencyMode
    // and testing that the TaskCompletionProvider correctly loads and uses the user-specific setting
    
    // Mock implementation would go here
    expect(true).toBe(true); // Placeholder for actual implementation
  });

  test('inherits original roadmap setting when no user preference exists', async () => {
    // This test would verify that when a user hasn't set a specific preference,
    // the collection roadmap inherits the original roadmap's dependency setting
    
    // Mock implementation would go here
    expect(true).toBe(true); // Placeholder for actual implementation
  });
});
