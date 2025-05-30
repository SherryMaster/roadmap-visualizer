/**
 * Example test file for Roadmap Editor
 * This demonstrates how to use the testing utilities
 */

import TestUtils from '../utils/TestUtils';

// Mock DOM environment for testing
const mockDOM = () => {
  global.document = {
    createElement: jest.fn(() => ({
      setAttribute: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      click: jest.fn(),
      style: {}
    })),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      style: {}
    },
    querySelectorAll: jest.fn(() => []),
    activeElement: null
  };

  global.window = {
    matchMedia: jest.fn(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    location: { reload: jest.fn() },
    URL: {
      createObjectURL: jest.fn(() => 'mock-url'),
      revokeObjectURL: jest.fn()
    }
  };

  global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 50 // 50MB
    }
  };
};

describe('Roadmap Editor Tests', () => {
  beforeEach(() => {
    mockDOM();
  });

  describe('Data Validation', () => {
    test('should validate correct roadmap structure', () => {
      const result = TestUtils.validateRoadmapStructure(TestUtils.mockRoadmapData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing roadmap title', () => {
      const invalidRoadmap = { ...TestUtils.mockRoadmapData, title: null };
      const result = TestUtils.validateRoadmapStructure(invalidRoadmap);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing roadmap title');
    });

    test('should detect missing task titles', () => {
      const invalidRoadmap = {
        ...TestUtils.mockRoadmapData,
        roadmap: {
          phases: [{
            phase_id: 'P1',
            phase_title: 'Test Phase',
            phase_tasks: [{
              task_id: 'T1',
              // Missing task_title
              phase_id: 'P1'
            }]
          }]
        }
      };
      const result = TestUtils.validateRoadmapStructure(invalidRoadmap);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Missing task_title'))).toBe(true);
    });

    test('should detect phase/task ID mismatches', () => {
      const invalidRoadmap = {
        ...TestUtils.mockRoadmapData,
        roadmap: {
          phases: [{
            phase_id: 'P1',
            phase_title: 'Test Phase',
            phase_tasks: [{
              task_id: 'T1',
              task_title: 'Test Task',
              phase_id: 'P2' // Mismatch!
            }]
          }]
        }
      };
      const result = TestUtils.validateRoadmapStructure(invalidRoadmap);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes("doesn't match"))).toBe(true);
    });
  });

  describe('Performance Testing', () => {
    test('should measure operation time', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = TestUtils.performanceTest.measureOperationTime('test-operation', () => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      expect(result).toBe(499500); // Sum of 0 to 999
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-operation execution time:')
      );
      
      consoleSpy.mockRestore();
    });

    test('should create large roadmap for performance testing', () => {
      const largeRoadmap = TestUtils.performanceTest.createLargeRoadmap(5, 10);
      
      expect(largeRoadmap.roadmap.phases).toHaveLength(5);
      expect(largeRoadmap.roadmap.phases[0].phase_tasks).toHaveLength(10);
      expect(largeRoadmap.title).toBe('Large Performance Test Roadmap');
      
      // Validate structure
      const validation = TestUtils.validateRoadmapStructure(largeRoadmap);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Error Simulation', () => {
    test('should simulate network error', () => {
      expect(() => {
        TestUtils.errorSimulation.simulateNetworkError();
      }).toThrow('Simulated network error');
    });

    test('should simulate validation error', () => {
      const result = TestUtils.errorSimulation.simulateValidationError();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Simulated validation error');
    });

    test('should create corrupted data', () => {
      const corruptedData = TestUtils.errorSimulation.simulateCorruptedData();
      const validation = TestUtils.validateRoadmapStructure(corruptedData);
      expect(validation.isValid).toBe(false);
    });
  });

  describe('Data Generation', () => {
    test('should generate random task', () => {
      const task = TestUtils.generateTestData.randomTask('P1_Test', 1);
      
      expect(task.task_id).toBe('P1_TestT1');
      expect(task.phase_id).toBe('P1_Test');
      expect(task.task_number).toBe(1);
      expect(task.task_title).toContain('Random Task 1');
      expect(['low', 'mid', 'high', 'critical']).toContain(task.task_priority);
    });

    test('should generate random phase', () => {
      const phase = TestUtils.generateTestData.randomPhase(2, 3);
      
      expect(phase.phase_id).toBe('P2_Random');
      expect(phase.phase_title).toContain('Random Phase 2');
      expect(phase.phase_tasks).toHaveLength(3);
      expect(phase.phase_dependencies).toEqual(['P1_Random']);
    });
  });

  describe('Accessibility Testing', () => {
    test('should check focusable elements', () => {
      const mockContainer = {
        querySelectorAll: jest.fn(() => [
          { tagName: 'BUTTON', disabled: false },
          { tagName: 'INPUT', disabled: false },
          { tagName: 'A', href: 'http://example.com' }
        ])
      };

      const focusableElements = TestUtils.accessibilityTest.checkFocusableElements(mockContainer);
      expect(focusableElements).toHaveLength(3);
    });

    test('should check aria labels', () => {
      const mockContainer = {
        querySelectorAll: jest.fn(() => [
          {
            hasAttribute: jest.fn((attr) => attr === 'aria-label'),
            textContent: ''
          },
          {
            hasAttribute: jest.fn(() => false),
            textContent: 'Button Text'
          }
        ])
      };

      const issues = TestUtils.accessibilityTest.checkAriaLabels(mockContainer);
      expect(issues).toHaveLength(0); // First button has aria-label, second has text
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete editor workflow', () => {
      // This would be a more complex integration test
      // Testing the full workflow from loading to saving
      
      // 1. Load roadmap
      const roadmap = TestUtils.mockRoadmapData;
      const validation = TestUtils.validateRoadmapStructure(roadmap);
      expect(validation.isValid).toBe(true);

      // 2. Add new task
      const newTask = TestUtils.generateTestData.randomTask('P1_Test', 3);
      const updatedPhase = {
        ...roadmap.roadmap.phases[0],
        phase_tasks: [...roadmap.roadmap.phases[0].phase_tasks, newTask]
      };

      // 3. Validate updated structure
      const updatedRoadmap = {
        ...roadmap,
        roadmap: {
          phases: [updatedPhase, ...roadmap.roadmap.phases.slice(1)]
        }
      };
      
      const updatedValidation = TestUtils.validateRoadmapStructure(updatedRoadmap);
      expect(updatedValidation.isValid).toBe(true);
    });
  });
});

// Example usage in development
if (process.env.NODE_ENV === 'development') {
  // Performance testing
  console.log('Running performance tests...');
  
  const largeRoadmap = TestUtils.performanceTest.createLargeRoadmap(10, 100);
  console.log(`Created roadmap with ${largeRoadmap.roadmap.phases.length} phases and ${
    largeRoadmap.roadmap.phases.reduce((total, phase) => total + phase.phase_tasks.length, 0)
  } total tasks`);

  // Validation testing
  const validation = TestUtils.validateRoadmapStructure(largeRoadmap);
  console.log('Large roadmap validation:', validation.isValid ? 'PASSED' : 'FAILED');
  
  if (!validation.isValid) {
    console.log('Validation errors:', validation.errors);
  }
}

export default TestUtils;
