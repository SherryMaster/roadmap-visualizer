import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DependencyToggle from '../components/roadmap/DependencyToggle';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../context/FirestoreContext';

// Mock the contexts
vi.mock('../context/AuthContext');
vi.mock('../context/FirestoreContext');

describe('DependencyToggle', () => {
  const mockUpdateRoadmapDependencyMode = vi.fn();
  const mockOnDependencyModeChange = vi.fn();

  const defaultProps = {
    roadmapId: 'test-roadmap-id',
    enableDependencies: true,
    userId: 'test-user-id',
    onDependencyModeChange: mockOnDependencyModeChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth.mockReturnValue({
      currentUser: { uid: 'test-user-id' }
    });
    
    useFirestore.mockReturnValue({
      updateRoadmapDependencyMode: mockUpdateRoadmapDependencyMode
    });
  });

  test('renders dependency toggle for roadmap owner', () => {
    render(<DependencyToggle {...defaultProps} />);
    
    expect(screen.getByText('Task Dependencies:')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  test('does not render for non-owner', () => {
    useAuth.mockReturnValue({
      currentUser: { uid: 'different-user-id' }
    });
    
    const { container } = render(<DependencyToggle {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  test('shows enabled state correctly', () => {
    render(<DependencyToggle {...defaultProps} enableDependencies={true} />);
    
    const enabledButton = screen.getByText('Enabled').closest('button');
    const disabledButton = screen.getByText('Disabled').closest('button');
    
    expect(enabledButton).toHaveClass('bg-blue-600');
    expect(disabledButton).not.toHaveClass('bg-orange-600');
  });

  test('shows disabled state correctly', () => {
    render(<DependencyToggle {...defaultProps} enableDependencies={false} />);
    
    const enabledButton = screen.getByText('Enabled').closest('button');
    const disabledButton = screen.getByText('Disabled').closest('button');
    
    expect(enabledButton).not.toHaveClass('bg-blue-600');
    expect(disabledButton).toHaveClass('bg-orange-600');
  });

  test('enables dependencies without confirmation', async () => {
    mockUpdateRoadmapDependencyMode.mockResolvedValue(true);
    
    render(<DependencyToggle {...defaultProps} enableDependencies={false} />);
    
    const enabledButton = screen.getByText('Enabled').closest('button');
    fireEvent.click(enabledButton);
    
    await waitFor(() => {
      expect(mockUpdateRoadmapDependencyMode).toHaveBeenCalledWith('test-roadmap-id', true);
      expect(mockOnDependencyModeChange).toHaveBeenCalledWith(true);
    });
  });

  test('shows confirmation dialog when disabling dependencies', async () => {
    render(<DependencyToggle {...defaultProps} enableDependencies={true} />);
    
    const disabledButton = screen.getByText('Disabled').closest('button');
    fireEvent.click(disabledButton);
    
    expect(screen.getByText('Disable Task Dependencies?')).toBeInTheDocument();
    expect(screen.getByText(/This will allow users to complete tasks in any order/)).toBeInTheDocument();
  });

  test('disables dependencies after confirmation', async () => {
    mockUpdateRoadmapDependencyMode.mockResolvedValue(true);
    
    render(<DependencyToggle {...defaultProps} enableDependencies={true} />);
    
    // Click disable button
    const disabledButton = screen.getByText('Disabled').closest('button');
    fireEvent.click(disabledButton);
    
    // Confirm in dialog
    const confirmButton = screen.getByText('Disable Dependencies');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockUpdateRoadmapDependencyMode).toHaveBeenCalledWith('test-roadmap-id', false);
      expect(mockOnDependencyModeChange).toHaveBeenCalledWith(false);
    });
  });

  test('cancels disable operation', async () => {
    render(<DependencyToggle {...defaultProps} enableDependencies={true} />);
    
    // Click disable button
    const disabledButton = screen.getByText('Disabled').closest('button');
    fireEvent.click(disabledButton);
    
    // Cancel in dialog
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockUpdateRoadmapDependencyMode).not.toHaveBeenCalled();
    expect(mockOnDependencyModeChange).not.toHaveBeenCalled();
  });

  test('handles update error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUpdateRoadmapDependencyMode.mockRejectedValue(new Error('Update failed'));
    
    render(<DependencyToggle {...defaultProps} enableDependencies={false} />);
    
    const enabledButton = screen.getByText('Enabled').closest('button');
    fireEvent.click(enabledButton);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('❌ Failed to update dependency mode:', expect.any(Error));
    });
    
    consoleError.mockRestore();
  });
});
