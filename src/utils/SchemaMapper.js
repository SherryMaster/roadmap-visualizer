/**
 * Schema Mapper Utility
 * Provides dynamic property mapping and component configuration based on schema
 */

class SchemaMapper {
  constructor() {
    this.propertyMappings = new Map();
    this.componentMappings = new Map();
    this.initializeDefaultMappings();
  }

  /**
   * Initialize default property and component mappings
   */
  initializeDefaultMappings() {
    // Property mappings for different schema versions or formats
    this.addPropertyMapping("difficulty.level", [
      "difficulty.level",
      "difficulty",
      "task_difficulty",
      "level",
    ]);

    this.addPropertyMapping("est_time", [
      "est_time",
      "estimated_time",
      "time_estimate",
      "duration",
    ]);

    this.addPropertyMapping("resource_links", [
      "resource_links",
      "resources",
      "links",
      "references",
    ]);

    this.addPropertyMapping("task_dependencies", [
      "task_dependencies",
      "dependencies",
      "depends_on",
      "prerequisites",
    ]);

    this.addPropertyMapping("task_tags", [
      "task_tags",
      "tags",
      "categories",
      "labels",
    ]);

    this.addPropertyMapping("task_priority", [
      "task_priority",
      "priority",
      "importance",
      "urgency",
    ]);

    // Component mappings
    this.addComponentMapping("difficulty", "DifficultyIndicator");
    this.addComponentMapping("est_time", "EstimatedTime");
    this.addComponentMapping("resource_links", "ResourceLinks");
    this.addComponentMapping("task_dependencies", "TaskDependencies");
    this.addComponentMapping("task_tags", "TagsList");
    this.addComponentMapping("task_priority", "PriorityBadge");
    this.addComponentMapping("code_blocks", "CodeBlock");
    this.addComponentMapping("outcomes", "OutcomesList");
    this.addComponentMapping("subtasks", "SubtasksList");
    this.addComponentMapping("notes", "TaskNotes");
  }

  /**
   * Add a property mapping
   */
  addPropertyMapping(canonicalName, aliases) {
    this.propertyMappings.set(canonicalName, aliases);
  }

  /**
   * Add a component mapping
   */
  addComponentMapping(property, componentName) {
    this.componentMappings.set(property, componentName);
  }

  /**
   * Get the canonical property name from various possible aliases
   */
  getCanonicalProperty(propertyName) {
    for (const [canonical, aliases] of this.propertyMappings) {
      if (aliases.includes(propertyName)) {
        return canonical;
      }
    }
    return propertyName;
  }

  /**
   * Get component name for a property
   */
  getComponentForProperty(property) {
    const canonical = this.getCanonicalProperty(property);
    return this.componentMappings.get(canonical) || null;
  }

  /**
   * Extract value from object using property mapping
   */
  extractValue(obj, propertyPath) {
    if (!obj || typeof obj !== "object") return undefined;

    const canonical = this.getCanonicalProperty(propertyPath);
    const aliases = this.propertyMappings.get(canonical) || [propertyPath];

    for (const alias of aliases) {
      const value = this.getNestedValue(obj, alias);
      if (value !== undefined) {
        return value;
      }
    }

    return undefined;
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested value in object using dot notation
   */
  setNestedValue(obj, path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * Get all available properties from an object based on mappings
   */
  getAvailableProperties(obj) {
    const available = [];

    for (const [canonical, aliases] of this.propertyMappings) {
      for (const alias of aliases) {
        if (this.getNestedValue(obj, alias) !== undefined) {
          available.push({
            canonical,
            alias,
            component: this.componentMappings.get(canonical),
            value: this.getNestedValue(obj, alias),
          });
          break; // Found one alias, no need to check others
        }
      }
    }

    return available;
  }

  /**
   * Generate component configuration for an object
   */
  generateComponentConfig(obj, context = {}) {
    const config = {
      components: [],
      layout: context.layout || "default",
      theme: context.theme || "default",
    };

    const availableProps = this.getAvailableProperties(obj);

    for (const prop of availableProps) {
      if (prop.component) {
        config.components.push({
          type: prop.component,
          property: prop.canonical,
          value: prop.value,
          props: this.generateComponentProps(
            prop.canonical,
            prop.value,
            context
          ),
        });
      }
    }

    return config;
  }

  /**
   * Generate props for a specific component
   */
  generateComponentProps(property, value, context = {}) {
    const baseProps = { [property]: value };

    switch (property) {
      case "difficulty":
        return {
          ...baseProps,
          showReason: context.showDifficultyReason !== false,
          showPrerequisites: context.showPrerequisites !== false,
        };

      case "est_time":
        return {
          ...baseProps,
          showRange: context.showTimeRange !== false,
          showFactors: context.showTimeFactors !== false,
        };

      case "resource_links":
        return {
          ...baseProps,
          showType: context.showResourceType !== false,
          groupByType: context.groupResourcesByType === true,
          highlightEssential: context.highlightEssential !== false,
        };

      case "task_dependencies":
        return {
          ...baseProps,
          showType: context.showDependencyType !== false,
          allowNavigation: context.allowDependencyNavigation !== false,
        };

      case "task_tags":
        return {
          ...baseProps,
          clickable: context.clickableTags !== false,
          colorCoded: context.colorCodedTags === true,
        };

      case "task_priority":
        return {
          ...baseProps,
          showIcon: context.showPriorityIcon !== false,
          style: context.priorityStyle || "badge",
        };

      default:
        return baseProps;
    }
  }

  /**
   * Validate object against expected schema structure
   */
  validateStructure(obj, expectedStructure) {
    const issues = [];

    for (const [property, config] of Object.entries(expectedStructure)) {
      const value = this.extractValue(obj, property);

      if (config.required && value === undefined) {
        issues.push(`Missing required property: ${property}`);
      }

      if (value !== undefined && config.type) {
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== config.type) {
          issues.push(
            `Property ${property} should be ${config.type}, got ${actualType}`
          );
        }
      }

      if (value !== undefined && config.enum && !config.enum.includes(value)) {
        issues.push(
          `Property ${property} should be one of [${config.enum.join(
            ", "
          )}], got ${value}`
        );
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Create a property accessor that handles multiple possible paths
   */
  createPropertyAccessor(propertyPath) {
    return (obj) => this.extractValue(obj, propertyPath);
  }

  /**
   * Create a property setter that handles multiple possible paths
   */
  createPropertySetter(propertyPath) {
    return (obj, value) => {
      const canonical = this.getCanonicalProperty(propertyPath);
      this.setNestedValue(obj, canonical, value);
    };
  }

  /**
   * Get schema-aware filter function
   */
  createFilterFunction(filterConfig) {
    return (item) => {
      for (const [property, criteria] of Object.entries(filterConfig)) {
        const value = this.extractValue(item, property);

        if (!this.matchesCriteria(value, criteria)) {
          return false;
        }
      }
      return true;
    };
  }

  /**
   * Check if value matches filter criteria
   */
  matchesCriteria(value, criteria) {
    if (criteria.equals !== undefined) {
      return value === criteria.equals;
    }

    if (criteria.in !== undefined) {
      return criteria.in.includes(value);
    }

    if (criteria.contains !== undefined) {
      return Array.isArray(value) && value.includes(criteria.contains);
    }

    if (criteria.range !== undefined) {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      return numValue >= criteria.range.min && numValue <= criteria.range.max;
    }

    return true;
  }

  /**
   * Get sorting function for a property
   */
  createSortFunction(property, direction = "asc") {
    return (a, b) => {
      const valueA = this.extractValue(a, property);
      const valueB = this.extractValue(b, property);

      if (valueA === valueB) return 0;

      const comparison = valueA < valueB ? -1 : 1;
      return direction === "asc" ? comparison : -comparison;
    };
  }
}

// Create singleton instance
const schemaMapper = new SchemaMapper();

export default schemaMapper;
