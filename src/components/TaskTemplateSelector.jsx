import { useState, useMemo } from "react";
import { taskTemplates, getAllTemplates, searchTemplates, applyTemplate } from "../utils/TaskTemplates";

const TaskTemplateSelector = ({ 
  isOpen, 
  onClose, 
  onSelectTemplate, 
  phaseId,
  phaseTitle 
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Get filtered templates
  const filteredTemplates = useMemo(() => {
    let templates = searchTerm ? searchTemplates(searchTerm) : getAllTemplates();
    
    if (selectedCategory !== "all") {
      templates = templates.filter(template => template.category === selectedCategory);
    }
    
    return templates;
  }, [selectedCategory, searchTerm]);

  // Group templates by category for display
  const groupedTemplates = useMemo(() => {
    const groups = {};
    filteredTemplates.forEach(template => {
      if (!groups[template.category]) {
        groups[template.category] = {
          name: template.categoryName,
          icon: template.categoryIcon,
          templates: []
        };
      }
      groups[template.category].templates.push(template);
    });
    return groups;
  }, [filteredTemplates]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      const taskData = applyTemplate(selectedTemplate.id, phaseId);
      onSelectTemplate(taskData);
      onClose();
    }
  };

  const handleCustomizeTemplate = () => {
    if (selectedTemplate) {
      const taskData = applyTemplate(selectedTemplate.id, phaseId);
      onSelectTemplate(taskData, true); // true indicates customization mode
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Templates</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              📋 All Templates
            </button>
            
            {Object.entries(taskTemplates).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedCategory === key
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Template List */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose Template for {phaseTitle}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select a template to quickly create a task with pre-filled content
              </p>
            </div>

            {Object.keys(groupedTemplates).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedTemplates).map(([categoryKey, category]) => (
                  <div key={categoryKey}>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </h3>
                    <div className="space-y-2">
                      {category.templates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedTemplate?.id === template.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.template.task_tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No templates found</p>
                <p>Try adjusting your search or category filter</p>
              </div>
            )}
          </div>

          {/* Template Preview */}
          <div className="w-1/2 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {selectedTemplate ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedTemplate.description}
                  </p>
                </div>

                {/* Template Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Title</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border">
                      {selectedTemplate.template.task_title}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border">
                      {selectedTemplate.template.task_summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estimated Time</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border">
                      {selectedTemplate.template.est_time.min_time.amount} {selectedTemplate.template.est_time.min_time.unit} - {selectedTemplate.template.est_time.max_time.amount} {selectedTemplate.template.est_time.max_time.unit}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.template.task_tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Content Preview</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded border max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {selectedTemplate.template.task_detail.content.substring(0, 500)}
                        {selectedTemplate.template.task_detail.content.length > 500 && "..."}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleUseTemplate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={handleCustomizeTemplate}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Customize
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-lg font-medium">Select a template</p>
                <p>Choose a template from the list to see its preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTemplateSelector;
