import { useState, useMemo } from "react";
import { useEditor } from "../context/EditorContext";

const DependencyManager = ({ 
  currentTask, 
  phaseId, 
  onDependenciesChange, 
  className = "" 
}) => {
  const { currentRoadmap } = useEditor();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDependencyType, setSelectedDependencyType] = useState("required");
  const [showAddForm, setShowAddForm] = useState(false);

  // Get all available tasks from all phases
  const availableTasks = useMemo(() => {
    const phases = currentRoadmap?.roadmap?.phases || currentRoadmap?.roadmap || [];
    const tasks = [];
    
    phases.forEach(phase => {
      if (phase.phase_tasks) {
        phase.phase_tasks.forEach(task => {
          // Don't include the current task as a dependency option
          if (task.task_id !== currentTask?.task_id) {
            tasks.push({
              ...task,
              phase_title: phase.phase_title,
              phase_id: phase.phase_id
            });
          }
        });
      }
    });
    
    return tasks;
  }, [currentRoadmap, currentTask]);

  // Filter tasks based on search term
  const filteredTasks = useMemo(() => {
    if (!searchTerm) return availableTasks;
    
    const term = searchTerm.toLowerCase();
    return availableTasks.filter(task => 
      task.task_title.toLowerCase().includes(term) ||
      task.task_id.toLowerCase().includes(term) ||
      task.phase_title.toLowerCase().includes(term)
    );
  }, [availableTasks, searchTerm]);

  // Get current dependencies
  const currentDependencies = currentTask?.task_dependencies || [];

  // Check if a task is already a dependency
  const isDependency = (taskId, phaseId) => {
    return currentDependencies.some(dep => 
      dep.task_id === taskId && dep.phase_id === phaseId
    );
  };

  // Add dependency
  const handleAddDependency = (task) => {
    if (isDependency(task.task_id, task.phase_id)) return;
    
    const newDependency = {
      phase_id: task.phase_id,
      task_id: task.task_id,
      dependency_type: selectedDependencyType
    };
    
    const updatedDependencies = [...currentDependencies, newDependency];
    onDependenciesChange(updatedDependencies);
    setShowAddForm(false);
    setSearchTerm("");
  };

  // Remove dependency
  const handleRemoveDependency = (index) => {
    const updatedDependencies = currentDependencies.filter((_, i) => i !== index);
    onDependenciesChange(updatedDependencies);
  };

  // Update dependency type
  const handleUpdateDependencyType = (index, newType) => {
    const updatedDependencies = currentDependencies.map((dep, i) => 
      i === index ? { ...dep, dependency_type: newType } : dep
    );
    onDependenciesChange(updatedDependencies);
  };

  // Get task details for a dependency
  const getTaskDetails = (dependency) => {
    return availableTasks.find(task => 
      task.task_id === dependency.task_id && task.phase_id === dependency.phase_id
    );
  };

  // Detect circular dependencies
  const wouldCreateCircularDependency = (targetTask) => {
    // This is a simplified check - in a real implementation, you'd do a full graph traversal
    const targetDependencies = targetTask.task_dependencies || [];
    return targetDependencies.some(dep => 
      dep.task_id === currentTask?.task_id && dep.phase_id === phaseId
    );
  };

  const dependencyTypes = [
    { value: "required", label: "Required", color: "red" },
    { value: "recommended", label: "Recommended", color: "yellow" },
    { value: "optional", label: "Optional", color: "blue" }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Task Dependencies
        </h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Dependency
        </button>
      </div>

      {/* Current Dependencies */}
      {currentDependencies.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Dependencies ({currentDependencies.length})
          </h5>
          {currentDependencies.map((dependency, index) => {
            const taskDetails = getTaskDetails(dependency);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {taskDetails?.task_title || dependency.task_id}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dependency.task_id}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Phase: {taskDetails?.phase_title || dependency.phase_id}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={dependency.dependency_type}
                    onChange={(e) => handleUpdateDependencyType(index, e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {dependencyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => handleRemoveDependency(index)}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove dependency"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Dependency Form */}
      {showAddForm && (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search tasks by title, ID, or phase..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={selectedDependencyType}
                onChange={(e) => setSelectedDependencyType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {dependencyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Task List */}
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const isAlreadyDependency = isDependency(task.task_id, task.phase_id);
                  const wouldCreateCircular = wouldCreateCircularDependency(task);
                  const isDisabled = isAlreadyDependency || wouldCreateCircular;
                  
                  return (
                    <div
                      key={`${task.phase_id}-${task.task_id}`}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        isDisabled
                          ? "bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed"
                          : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => !isDisabled && handleAddDependency(task)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {task.task_title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {task.task_id} • {task.phase_title}
                        </div>
                      </div>
                      
                      {isAlreadyDependency && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Already added
                        </span>
                      )}
                      
                      {wouldCreateCircular && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Circular dependency
                        </span>
                      )}
                      
                      {!isDisabled && (
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {searchTerm ? "No tasks found matching your search" : "No tasks available"}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSearchTerm("");
                }}
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>Dependencies define the order in which tasks should be completed:</p>
        <ul className="mt-1 ml-4 list-disc">
          <li><strong>Required:</strong> Must be completed before this task</li>
          <li><strong>Recommended:</strong> Should be completed first for best results</li>
          <li><strong>Optional:</strong> Helpful but not necessary</li>
        </ul>
      </div>
    </div>
  );
};

export default DependencyManager;
