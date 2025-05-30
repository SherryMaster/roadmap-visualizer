/**
 * Testing utilities for the Roadmap Editor
 * Provides mock data, test helpers, and validation functions
 */

// Mock roadmap data for testing
export const mockRoadmapData = {
  title: "Test Roadmap",
  description: "A test roadmap for development and testing",
  tags: ["test", "development"],
  project_level: "intermediate",
  roadmap: {
    phases: [
      {
        phase_id: "P1_Test",
        phase_title: "Test Phase 1",
        phase_dependencies: [],
        phase_summary: "First test phase",
        phase_details: ["Test phase details"],
        key_milestones: ["Test milestone 1"],
        success_indicators: ["Test indicator 1"],
        phase_tasks: [
          {
            task_id: "P1T1",
            task_title: "Test Task 1",
            task_summary: "First test task",
            task_priority: "high",
            task_tags: ["test"],
            task_dependencies: [],
            task_index: 0,
            phase_id: "P1_Test",
            task_number: 1
          },
          {
            task_id: "P1T2",
            task_title: "Test Task 2",
            task_summary: "Second test task",
            task_priority: "mid",
            task_tags: ["test"],
            task_dependencies: [
              {
                phase_id: "P1_Test",
                task_id: "P1T1",
                dependency_type: "required"
              }
            ],
            task_index: 1,
            phase_id: "P1_Test",
            task_number: 2
          }
        ]
      },
      {
        phase_id: "P2_Test",
        phase_title: "Test Phase 2",
        phase_dependencies: ["P1_Test"],
        phase_summary: "Second test phase",
        phase_details: ["Second phase details"],
        key_milestones: ["Test milestone 2"],
        success_indicators: ["Test indicator 2"],
        phase_tasks: [
          {
            task_id: "P2T1",
            task_title: "Test Task 3",
            task_summary: "Third test task",
            task_priority: "low",
            task_tags: ["test"],
            task_dependencies: [],
            task_index: 0,
            phase_id: "P2_Test",
            task_number: 1
          }
        ]
      }
    ]
  }
};

// Mock task file data
export const mockTaskFile = {
  tasks: [
    {
      phase_id: "P1_Test",
      task_id: "P1T3",
      task_difficulty: "normal",
      task_title: "New Test Task",
      task_summary: "A new task added via file upload",
      task_detail: {
        content: "Detailed task content",
        format: "markdown"
      },
      code_blocks: [],
      difficulty_reason: "Standard complexity",
      prerequisites_needed: [],
      task_dependencies: [],
      est_time: {
        min_time: { amount: 1, unit: "hours" },
        max_time: { amount: 2, unit: "hours" },
        factors_affecting_time: ["Experience level"]
      },
      resource_links: [
        {
          display_text: "Test Resource",
          url: "https://example.com",
          is_essential: true,
          type: "tutorial"
        }
      ],
      task_priority: "mid",
      task_tags: ["test", "new"],
      task_number: 3
    }
  ]
};

// Test validation functions
export const validateRoadmapStructure = (roadmap) => {
  const errors = [];

  if (!roadmap) {
    errors.push("Roadmap is null or undefined");
    return { isValid: false, errors };
  }

  if (!roadmap.title) {
    errors.push("Missing roadmap title");
  }

  if (!roadmap.roadmap || !roadmap.roadmap.phases) {
    errors.push("Missing phases array");
    return { isValid: false, errors };
  }

  roadmap.roadmap.phases.forEach((phase, phaseIndex) => {
    if (!phase.phase_id) {
      errors.push(`Phase ${phaseIndex}: Missing phase_id`);
    }

    if (!phase.phase_title) {
      errors.push(`Phase ${phaseIndex}: Missing phase_title`);
    }

    if (phase.phase_tasks) {
      phase.phase_tasks.forEach((task, taskIndex) => {
        if (!task.task_id) {
          errors.push(`Phase ${phaseIndex}, Task ${taskIndex}: Missing task_id`);
        }

        if (!task.task_title) {
          errors.push(`Phase ${phaseIndex}, Task ${taskIndex}: Missing task_title`);
        }

        if (task.phase_id !== phase.phase_id) {
          errors.push(`Phase ${phaseIndex}, Task ${taskIndex}: task.phase_id doesn't match phase.phase_id`);
        }
      });
    }
  });

  return { isValid: errors.length === 0, errors };
};

// Performance testing utilities
export const performanceTest = {
  measureRenderTime: (componentName, renderFunction) => {
    const start = performance.now();
    const result = renderFunction();
    const end = performance.now();
    
    console.log(`${componentName} render time: ${end - start}ms`);
    return result;
  },

  measureOperationTime: (operationName, operation) => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    console.log(`${operationName} execution time: ${end - start}ms`);
    return result;
  },

  createLargeRoadmap: (phaseCount = 10, tasksPerPhase = 50) => {
    const phases = [];
    
    for (let p = 0; p < phaseCount; p++) {
      const phase = {
        phase_id: `P${p + 1}_Large`,
        phase_title: `Large Phase ${p + 1}`,
        phase_dependencies: p > 0 ? [`P${p}_Large`] : [],
        phase_summary: `Large phase ${p + 1} for performance testing`,
        phase_details: [`Details for phase ${p + 1}`],
        key_milestones: [`Milestone ${p + 1}`],
        success_indicators: [`Indicator ${p + 1}`],
        phase_tasks: []
      };

      for (let t = 0; t < tasksPerPhase; t++) {
        phase.phase_tasks.push({
          task_id: `P${p + 1}T${t + 1}`,
          task_title: `Large Task ${t + 1} in Phase ${p + 1}`,
          task_summary: `Task ${t + 1} summary for performance testing`,
          task_priority: ["low", "mid", "high", "critical"][t % 4],
          task_tags: [`tag${t % 5}`, "performance", "test"],
          task_dependencies: t > 0 ? [{
            phase_id: `P${p + 1}_Large`,
            task_id: `P${p + 1}T${t}`,
            dependency_type: "required"
          }] : [],
          task_index: t,
          phase_id: `P${p + 1}_Large`,
          task_number: t + 1
        });
      }

      phases.push(phase);
    }

    return {
      title: "Large Performance Test Roadmap",
      description: "A large roadmap for performance testing",
      tags: ["performance", "test", "large"],
      project_level: "advanced",
      roadmap: { phases }
    };
  }
};

// Accessibility testing utilities
export const accessibilityTest = {
  checkFocusableElements: (container) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ];

    const focusableElements = container.querySelectorAll(focusableSelectors.join(', '));
    return Array.from(focusableElements);
  },

  checkAriaLabels: (container) => {
    const issues = [];
    const buttons = container.querySelectorAll('button');
    
    buttons.forEach((button, index) => {
      const hasAriaLabel = button.hasAttribute('aria-label');
      const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');
      const hasTextContent = button.textContent.trim().length > 0;
      
      if (!hasAriaLabel && !hasAriaLabelledBy && !hasTextContent) {
        issues.push(`Button ${index} has no accessible label`);
      }
    });

    return issues;
  },

  checkColorContrast: (element) => {
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;
    
    // This is a simplified check - in a real app you'd use a proper contrast ratio calculator
    return {
      backgroundColor,
      color,
      // Note: Actual contrast ratio calculation would require color parsing
      warning: "Manual contrast check recommended"
    };
  }
};

// Error simulation utilities
export const errorSimulation = {
  simulateNetworkError: () => {
    throw new Error("Simulated network error");
  },

  simulateValidationError: () => {
    return {
      isValid: false,
      errors: ["Simulated validation error", "Another validation issue"]
    };
  },

  simulateCorruptedData: () => {
    return {
      title: null,
      roadmap: {
        phases: [
          {
            // Missing required fields
            phase_tasks: [
              {
                task_id: "CORRUPT",
                // Missing task_title
                task_dependencies: "invalid_format" // Should be array
              }
            ]
          }
        ]
      }
    };
  }
};

// Test data generators
export const generateTestData = {
  randomTask: (phaseId, taskNumber) => ({
    task_id: `${phaseId}T${taskNumber}`,
    task_title: `Random Task ${taskNumber}`,
    task_summary: `Randomly generated task ${taskNumber} for testing`,
    task_priority: ["low", "mid", "high", "critical"][Math.floor(Math.random() * 4)],
    task_tags: [`tag${Math.floor(Math.random() * 5)}`, "random", "test"],
    task_dependencies: [],
    task_index: taskNumber - 1,
    phase_id: phaseId,
    task_number: taskNumber
  }),

  randomPhase: (phaseNumber, taskCount = 5) => {
    const phaseId = `P${phaseNumber}_Random`;
    const tasks = [];
    
    for (let i = 1; i <= taskCount; i++) {
      tasks.push(generateTestData.randomTask(phaseId, i));
    }

    return {
      phase_id: phaseId,
      phase_title: `Random Phase ${phaseNumber}`,
      phase_dependencies: phaseNumber > 1 ? [`P${phaseNumber - 1}_Random`] : [],
      phase_summary: `Randomly generated phase ${phaseNumber}`,
      phase_details: [`Random details for phase ${phaseNumber}`],
      key_milestones: [`Random milestone ${phaseNumber}`],
      success_indicators: [`Random indicator ${phaseNumber}`],
      phase_tasks: tasks
    };
  }
};

// Export all utilities
export default {
  mockRoadmapData,
  mockTaskFile,
  validateRoadmapStructure,
  performanceTest,
  accessibilityTest,
  errorSimulation,
  generateTestData
};
