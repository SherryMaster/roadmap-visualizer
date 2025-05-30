import { useState, useRef, useEffect } from "react";

const TaskCreationDropdown = ({ 
  phaseId, 
  phaseTitle, 
  onAddTask, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    onAddTask(phaseId, "quick");
    setIsOpen(false);
  };

  const handleAdvancedAdd = (e) => {
    e.stopPropagation();
    onAddTask(phaseId, "advanced");
    setIsOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Add Task Button */}
      <div className="flex">
        <button
          onClick={handleQuickAdd}
          className="inline-flex items-center px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-l-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors border-r border-green-200 dark:border-green-800"
          title="Quick add task"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Task
        </button>
        
        {/* Dropdown Toggle */}
        <button
          onClick={toggleDropdown}
          className="inline-flex items-center px-2 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-r-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          title="More task creation options"
        >
          <svg
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {/* Quick Add Option */}
            <button
              onClick={handleQuickAdd}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Quick Add</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Fast task creation with essential fields and smart defaults
                  </div>
                </div>
              </div>
            </button>

            {/* Advanced Add Option */}
            <button
              onClick={handleAdvancedAdd}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Advanced Creation</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Full-featured creation with templates, dependencies, and detailed configuration
                  </div>
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

            {/* Info Section */}
            <div className="px-4 py-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Adding to: {phaseTitle}</div>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="flex items-center">
                    <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd>
                    <span className="ml-1">Quick add</span>
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Shift+Enter</kbd>
                    <span className="ml-1">Advanced</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCreationDropdown;
