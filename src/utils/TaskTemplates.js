/**
 * Task Template System
 * Provides pre-defined task templates for common task types
 */

export const taskTemplates = {
  // Development Templates
  development: {
    name: "Development",
    icon: "💻",
    templates: [
      {
        id: "setup-environment",
        name: "Setup Development Environment",
        description: "Set up the development environment and tools",
        template: {
          task_title: "Setup Development Environment",
          task_summary: "Install and configure the necessary development tools, dependencies, and environment settings for the project.",
          task_priority: "high",
          task_tags: ["setup", "environment", "development"],
          task_detail: {
            content: "## Setup Development Environment\n\n### Prerequisites\n- System requirements\n- Required software\n\n### Steps\n1. Install development tools\n2. Configure environment variables\n3. Set up project dependencies\n4. Verify installation\n\n### Verification\n- [ ] All tools installed correctly\n- [ ] Environment variables configured\n- [ ] Project builds successfully",
            format: "markdown"
          },
          est_time: {
            min_time: { amount: 30, unit: "minutes" },
            max_time: { amount: 2, unit: "hours" },
            factors_affecting_time: ["System complexity", "Prior experience", "Internet speed"]
          },
          resource_links: [
            {
              display_text: "Installation Guide",
              url: "https://example.com/install-guide",
              is_essential: true,
              type: "documentation"
            }
          ]
        }
      },
      {
        id: "implement-feature",
        name: "Implement Feature",
        description: "Implement a new feature or functionality",
        template: {
          task_title: "Implement [Feature Name]",
          task_summary: "Design and implement the [feature name] functionality according to specifications.",
          task_priority: "mid",
          task_tags: ["implementation", "feature", "development"],
          task_detail: {
            content: "## Implement [Feature Name]\n\n### Requirements\n- Functional requirements\n- Technical specifications\n- Design constraints\n\n### Implementation Steps\n1. Design the solution\n2. Write the code\n3. Add tests\n4. Update documentation\n\n### Acceptance Criteria\n- [ ] Feature works as specified\n- [ ] Tests pass\n- [ ] Code reviewed\n- [ ] Documentation updated",
            format: "markdown"
          },
          est_time: {
            min_time: { amount: 2, unit: "hours" },
            max_time: { amount: 1, unit: "days" },
            factors_affecting_time: ["Feature complexity", "Available documentation", "Team experience"]
          }
        }
      },
      {
        id: "write-tests",
        name: "Write Tests",
        description: "Create unit tests for functionality",
        template: {
          task_title: "Write Tests for [Component/Feature]",
          task_summary: "Create comprehensive unit tests to ensure the reliability and correctness of [component/feature].",
          task_priority: "mid",
          task_tags: ["testing", "quality-assurance", "development"],
          task_detail: {
            content: "## Write Tests for [Component/Feature]\n\n### Test Coverage Goals\n- Unit tests for core functionality\n- Edge case testing\n- Error handling tests\n\n### Test Types\n1. Unit tests\n2. Integration tests\n3. Edge case tests\n4. Error handling tests\n\n### Success Criteria\n- [ ] 90%+ code coverage\n- [ ] All edge cases covered\n- [ ] Tests pass consistently\n- [ ] Clear test documentation",
            format: "markdown"
          },
          est_time: {
            min_time: { amount: 1, unit: "hours" },
            max_time: { amount: 4, unit: "hours" },
            factors_affecting_time: ["Code complexity", "Testing framework familiarity"]
          }
        }
      }
    ]
  },

  // Learning Templates
  learning: {
    name: "Learning",
    icon: "📚",
    templates: [
      {
        id: "research-topic",
        name: "Research Topic",
        description: "Research and understand a new topic or technology",
        template: {
          task_title: "Research [Topic/Technology]",
          task_summary: "Conduct thorough research on [topic/technology] to understand its concepts, applications, and best practices.",
          task_priority: "mid",
          task_tags: ["research", "learning", "documentation"],
          task_detail: {
            content: "## Research [Topic/Technology]\n\n### Research Goals\n- Understand core concepts\n- Learn practical applications\n- Identify best practices\n- Find relevant resources\n\n### Research Areas\n1. Fundamental concepts\n2. Use cases and applications\n3. Pros and cons\n4. Implementation examples\n5. Community resources\n\n### Deliverables\n- [ ] Research summary document\n- [ ] Key concepts identified\n- [ ] Resource list compiled\n- [ ] Next steps defined",
            format: "markdown"
          },
          est_time: {
            min_time: { amount: 1, unit: "hours" },
            max_time: { amount: 4, unit: "hours" },
            factors_affecting_time: ["Topic complexity", "Available resources", "Prior knowledge"]
          }
        }
      },
      {
        id: "complete-tutorial",
        name: "Complete Tutorial",
        description: "Follow and complete a tutorial or course",
        template: {
          task_title: "Complete [Tutorial/Course Name]",
          task_summary: "Work through the [tutorial/course name] to learn [specific skills/concepts].",
          task_priority: "mid",
          task_tags: ["tutorial", "learning", "practice"],
          task_detail: {
            content: "## Complete [Tutorial/Course Name]\n\n### Learning Objectives\n- Master key concepts\n- Complete practical exercises\n- Build example projects\n\n### Progress Tracking\n1. Module 1: [Description]\n2. Module 2: [Description]\n3. Module 3: [Description]\n\n### Success Criteria\n- [ ] All modules completed\n- [ ] Exercises finished\n- [ ] Final project built\n- [ ] Key concepts understood",
            format: "markdown"
          },
          est_time: {
            min_time: { amount: 2, unit: "hours" },
            max_time: { amount: 8, unit: "hours" },
            factors_affecting_time: ["Tutorial length", "Complexity level", "Practice time needed"]
          }
        }
      }
    ]
  },

  // Documentation Templates
  documentation: {
    name: "Documentation",
    icon: "📝",
    templates: [
      {
        id: "write-documentation",
        name: "Write Documentation",
        description: "Create comprehensive documentation",
        template: {
          task_title: "Write Documentation for [Component/Feature]",
          task_summary: "Create clear, comprehensive documentation for [component/feature] to help users and developers.",
          task_priority: "mid",
          task_tags: ["documentation", "writing", "user-guide"],
          task_detail: {
            content: "## Write Documentation for [Component/Feature]\n\n### Documentation Sections\n1. Overview and purpose\n2. Getting started guide\n3. API reference\n4. Examples and tutorials\n5. Troubleshooting\n\n### Quality Standards\n- Clear and concise language\n- Practical examples\n- Up-to-date information\n- Proper formatting\n\n### Deliverables\n- [ ] User guide written\n- [ ] API documentation complete\n- [ ] Examples provided\n- [ ] Review completed",
            format: "markdown"
          },
          est_time: {
            min_time: { amount: 2, unit: "hours" },
            max_time: { amount: 6, unit: "hours" },
            factors_affecting_time: ["Scope of documentation", "Complexity of subject", "Existing materials"]
          }
        }
      }
    ]
  },

  // Review Templates
  review: {
    name: "Review & QA",
    icon: "🔍",
    templates: [
      {
        id: "code-review",
        name: "Code Review",
        description: "Review code for quality and standards",
        template: {
          task_title: "Code Review: [Feature/Component]",
          task_summary: "Conduct a thorough code review of [feature/component] to ensure quality, maintainability, and adherence to standards.",
          task_priority: "high",
          task_tags: ["code-review", "quality-assurance", "collaboration"],
          task_detail: {
            content: "## Code Review: [Feature/Component]\n\n### Review Checklist\n- [ ] Code follows style guidelines\n- [ ] Logic is clear and efficient\n- [ ] Error handling is appropriate\n- [ ] Tests are comprehensive\n- [ ] Documentation is updated\n- [ ] Security considerations addressed\n\n### Review Areas\n1. Code quality and style\n2. Performance implications\n3. Security considerations\n4. Test coverage\n5. Documentation accuracy\n\n### Feedback Guidelines\n- Provide constructive feedback\n- Suggest improvements\n- Highlight good practices\n- Ask clarifying questions",
            format: "markdown"
          },
          est_time: {
            min_time: { amount: 30, unit: "minutes" },
            max_time: { amount: 2, unit: "hours" },
            factors_affecting_time: ["Code complexity", "Review depth required", "Number of changes"]
          }
        }
      }
    ]
  }
};

/**
 * Get all available templates
 */
export const getAllTemplates = () => {
  const allTemplates = [];
  Object.entries(taskTemplates).forEach(([categoryKey, category]) => {
    category.templates.forEach(template => {
      allTemplates.push({
        ...template,
        category: categoryKey,
        categoryName: category.name,
        categoryIcon: category.icon
      });
    });
  });
  return allTemplates;
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (categoryKey) => {
  return taskTemplates[categoryKey]?.templates || [];
};

/**
 * Get template by ID
 */
export const getTemplateById = (templateId) => {
  const allTemplates = getAllTemplates();
  return allTemplates.find(template => template.id === templateId);
};

/**
 * Apply template to create task data
 */
export const applyTemplate = (templateId, phaseId, customizations = {}) => {
  const template = getTemplateById(templateId);
  if (!template) return null;

  // Generate unique task ID
  const timestamp = Date.now();
  const taskId = `${phaseId}T${timestamp}_${template.id}`;

  // Merge template with customizations
  const taskData = {
    phase_id: phaseId,
    task_id: taskId,
    task_difficulty: "normal",
    ...template.template,
    ...customizations,
    // Ensure these fields are properly structured
    task_dependencies: customizations.task_dependencies || [],
    prerequisites_needed: customizations.prerequisites_needed || [],
    code_blocks: customizations.code_blocks || [],
    difficulty_reason: customizations.difficulty_reason || "Standard task complexity",
    task_number: customizations.task_number || 1
  };

  return taskData;
};

/**
 * Search templates
 */
export const searchTemplates = (searchTerm) => {
  if (!searchTerm) return getAllTemplates();
  
  const term = searchTerm.toLowerCase();
  return getAllTemplates().filter(template =>
    template.name.toLowerCase().includes(term) ||
    template.description.toLowerCase().includes(term) ||
    template.template.task_tags.some(tag => tag.toLowerCase().includes(term))
  );
};

export default {
  taskTemplates,
  getAllTemplates,
  getTemplatesByCategory,
  getTemplateById,
  applyTemplate,
  searchTemplates
};
