/**
 * Configuration Manager
 * Manages application configuration, UI settings, and component behavior
 */

class ConfigManager {
  constructor() {
    this.config = this.getDefaultConfig();
    this.loadUserConfig();
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      // UI Configuration
      ui: {
        theme: 'auto', // 'light', 'dark', 'auto'
        layout: 'default', // 'default', 'compact', 'detailed'
        animations: true,
        compactMode: false,
        showProgressIndicators: true,
        autoExpandPhases: false,
        autoExpandTasks: false
      },

      // Component Display Settings
      components: {
        difficulty: {
          showReason: true,
          showPrerequisites: true,
          style: 'dots' // 'dots', 'bar', 'text'
        },
        estimatedTime: {
          showRange: true,
          showFactors: false,
          format: 'short' // 'short', 'long', 'detailed'
        },
        resourceLinks: {
          showType: true,
          groupByType: false,
          highlightEssential: true,
          openInNewTab: true
        },
        taskDependencies: {
          showType: true,
          allowNavigation: true,
          showVisualization: false
        },
        tags: {
          clickable: true,
          colorCoded: false,
          maxDisplay: 5
        },
        priority: {
          showIcon: true,
          style: 'badge' // 'badge', 'text', 'color'
        },
        codeBlocks: {
          showLanguage: true,
          showComplexity: true,
          syntaxHighlighting: true
        }
      },

      // Data Processing
      data: {
        validateOnLoad: true,
        transformOnLoad: true,
        cacheTransformed: true,
        autoSave: true,
        saveInterval: 30000 // 30 seconds
      },

      // Search and Filtering
      search: {
        searchInContent: true,
        searchInTags: true,
        searchInDependencies: false,
        caseSensitive: false,
        highlightResults: true
      },

      // Progress Tracking
      progress: {
        persistBetweenSessions: true,
        showPercentages: true,
        showCompletionAnimations: true,
        trackTimeSpent: false
      },

      // Accessibility
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReaderOptimized: false,
        keyboardNavigation: true
      },

      // Advanced Features
      advanced: {
        debugMode: false,
        showSchemaInfo: false,
        allowSchemaEditing: false,
        exportFormats: ['json', 'markdown'],
        customCSS: ''
      }
    };
  }

  /**
   * Load user configuration from localStorage
   */
  loadUserConfig() {
    try {
      const saved = localStorage.getItem('roadmap-visualizer-config');
      if (saved) {
        const userConfig = JSON.parse(saved);
        this.config = this.mergeConfigs(this.config, userConfig);
      }
    } catch (error) {
      console.warn('Failed to load user configuration:', error);
    }
  }

  /**
   * Save current configuration to localStorage
   */
  saveUserConfig() {
    try {
      localStorage.setItem('roadmap-visualizer-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save user configuration:', error);
    }
  }

  /**
   * Deep merge two configuration objects
   */
  mergeConfigs(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    for (const [key, value] of Object.entries(userConfig)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        merged[key] = this.mergeConfigs(merged[key] || {}, value);
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  /**
   * Get configuration value by path
   */
  get(path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, this.config);
  }

  /**
   * Set configuration value by path
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, this.config);
    
    target[lastKey] = value;
    this.saveUserConfig();
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    this.config = this.getDefaultConfig();
    this.saveUserConfig();
  }

  /**
   * Get component configuration
   */
  getComponentConfig(componentName) {
    return this.get(`components.${componentName}`) || {};
  }

  /**
   * Update component configuration
   */
  updateComponentConfig(componentName, updates) {
    const current = this.getComponentConfig(componentName);
    const updated = { ...current, ...updates };
    this.set(`components.${componentName}`, updated);
  }

  /**
   * Get UI configuration
   */
  getUIConfig() {
    return this.get('ui') || {};
  }

  /**
   * Update UI configuration
   */
  updateUIConfig(updates) {
    const current = this.getUIConfig();
    const updated = { ...current, ...updates };
    this.set('ui', updated);
  }

  /**
   * Get theme configuration
   */
  getTheme() {
    return this.get('ui.theme') || 'auto';
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    this.set('ui.theme', theme);
  }

  /**
   * Get layout configuration
   */
  getLayout() {
    return this.get('ui.layout') || 'default';
  }

  /**
   * Set layout
   */
  setLayout(layout) {
    this.set('ui.layout', layout);
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(featurePath) {
    return this.get(featurePath) === true;
  }

  /**
   * Enable/disable feature
   */
  setFeature(featurePath, enabled) {
    this.set(featurePath, enabled);
  }

  /**
   * Get search configuration
   */
  getSearchConfig() {
    return this.get('search') || {};
  }

  /**
   * Get progress configuration
   */
  getProgressConfig() {
    return this.get('progress') || {};
  }

  /**
   * Get accessibility configuration
   */
  getAccessibilityConfig() {
    return this.get('accessibility') || {};
  }

  /**
   * Apply accessibility settings to document
   */
  applyAccessibilitySettings() {
    const a11y = this.getAccessibilityConfig();
    
    if (a11y.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    if (a11y.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }

  /**
   * Get configuration for export
   */
  getExportableConfig() {
    // Remove sensitive or runtime-only settings
    const exportable = { ...this.config };
    delete exportable.advanced?.debugMode;
    return exportable;
  }

  /**
   * Import configuration
   */
  importConfig(importedConfig) {
    try {
      this.config = this.mergeConfigs(this.getDefaultConfig(), importedConfig);
      this.saveUserConfig();
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(config = this.config) {
    const issues = [];
    
    // Validate theme
    const validThemes = ['light', 'dark', 'auto'];
    if (config.ui?.theme && !validThemes.includes(config.ui.theme)) {
      issues.push(`Invalid theme: ${config.ui.theme}`);
    }
    
    // Validate layout
    const validLayouts = ['default', 'compact', 'detailed'];
    if (config.ui?.layout && !validLayouts.includes(config.ui.layout)) {
      issues.push(`Invalid layout: ${config.ui.layout}`);
    }
    
    // Validate save interval
    if (config.data?.saveInterval && (typeof config.data.saveInterval !== 'number' || config.data.saveInterval < 1000)) {
      issues.push('Save interval must be a number >= 1000ms');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Get configuration schema for UI generation
   */
  getConfigSchema() {
    return {
      ui: {
        title: 'User Interface',
        properties: {
          theme: { type: 'select', options: ['light', 'dark', 'auto'], title: 'Theme' },
          layout: { type: 'select', options: ['default', 'compact', 'detailed'], title: 'Layout' },
          animations: { type: 'boolean', title: 'Enable Animations' },
          compactMode: { type: 'boolean', title: 'Compact Mode' }
        }
      },
      components: {
        title: 'Component Settings',
        properties: {
          difficulty: {
            title: 'Difficulty Display',
            properties: {
              showReason: { type: 'boolean', title: 'Show Difficulty Reason' },
              showPrerequisites: { type: 'boolean', title: 'Show Prerequisites' },
              style: { type: 'select', options: ['dots', 'bar', 'text'], title: 'Display Style' }
            }
          }
        }
      },
      accessibility: {
        title: 'Accessibility',
        properties: {
          highContrast: { type: 'boolean', title: 'High Contrast Mode' },
          reducedMotion: { type: 'boolean', title: 'Reduced Motion' },
          keyboardNavigation: { type: 'boolean', title: 'Keyboard Navigation' }
        }
      }
    };
  }
}

// Create singleton instance
const configManager = new ConfigManager();

export default configManager;
