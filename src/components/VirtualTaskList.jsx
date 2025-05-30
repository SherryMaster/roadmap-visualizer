import { useState, useEffect, useRef, useMemo } from "react";
import { useEditor } from "../context/EditorContext";

const VirtualTaskList = ({ 
  tasks, 
  phaseId, 
  onTaskEdit, 
  onTaskRemove, 
  onTaskSelect, 
  isTaskSelected,
  itemHeight = 120,
  containerHeight = 400,
  overscan = 5
}) => {
  const { moveTask } = useEditor();
  const [scrollTop, setScrollTop] = useState(0);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const containerRef = useRef(null);
  const dragCounter = useRef(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(tasks.length, start + visibleCount + overscan * 2);
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, tasks.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return tasks.slice(visibleRange.start, visibleRange.end).map((task, index) => ({
      task,
      index: visibleRange.start + index,
      top: (visibleRange.start + index) * itemHeight
    }));
  }, [tasks, visibleRange, itemHeight]);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const handleDragStart = (e, task, index) => {
    setDraggedTask({ task, index, phaseId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedTask(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    dragCounter.current = 0;

    if (!draggedTask) return;

    const { task: sourceTask, index: sourceIndex, phaseId: sourcePhaseId } = draggedTask;

    if (sourcePhaseId === phaseId && sourceIndex === targetIndex) {
      return;
    }

    moveTask(sourcePhaseId, phaseId, sourceTask.task_id, targetIndex);
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>No tasks in this phase</p>
        <p className="text-sm">Upload task files or add tasks manually</p>
      </div>
    );
  }

  // Use regular list for small task counts
  if (tasks.length <= 20) {
    return (
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.task_id}
            task={task}
            index={index}
            phaseId={phaseId}
            onTaskEdit={onTaskEdit}
            onTaskRemove={onTaskRemove}
            onTaskSelect={onTaskSelect}
            isTaskSelected={isTaskSelected}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDraggedOver={dragOverIndex === index}
          />
        ))}
      </div>
    );
  }

  // Virtual list for large task counts
  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="overflow-auto border border-gray-200 dark:border-gray-600 rounded-lg"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Total height container */}
        <div style={{ height: tasks.length * itemHeight, position: 'relative' }}>
          {/* Visible items */}
          {visibleItems.map(({ task, index, top }) => (
            <div
              key={task.task_id}
              style={{
                position: 'absolute',
                top: top,
                left: 0,
                right: 0,
                height: itemHeight
              }}
            >
              <TaskItem
                task={task}
                index={index}
                phaseId={phaseId}
                onTaskEdit={onTaskEdit}
                onTaskRemove={onTaskRemove}
                onTaskSelect={onTaskSelect}
                isTaskSelected={isTaskSelected}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                isDraggedOver={dragOverIndex === index}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Performance indicator */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Showing {visibleRange.end - visibleRange.start} of {tasks.length} tasks (Virtual scrolling enabled)
      </div>
    </div>
  );
};

const TaskItem = ({
  task,
  index,
  phaseId,
  onTaskEdit,
  onTaskRemove,
  onTaskSelect,
  isTaskSelected,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  isDraggedOver
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      className={`border rounded-lg p-4 m-2 transition-all duration-200 cursor-move ${
        isTaskSelected(phaseId, task.task_id)
          ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
      } ${
        isDraggedOver
          ? "border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20"
          : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Drag Handle */}
          <div className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            </svg>
          </div>

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isTaskSelected(phaseId, task.task_id)}
            onChange={() => onTaskSelect(phaseId, task.task_id)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h5 className="font-medium text-gray-900 dark:text-white truncate">
                {task.task_title}
              </h5>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                {task.task_id}
              </span>
            </div>
            
            {task.task_summary && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {task.task_summary}
              </p>
            )}
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {task.task_priority && (
                <span className={`px-2 py-1 rounded-full flex-shrink-0 ${
                  task.task_priority === "critical"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    : task.task_priority === "high"
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                    : task.task_priority === "mid"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}>
                  {task.task_priority}
                </span>
              )}
              
              {task.task_dependencies && task.task_dependencies.length > 0 && (
                <span className="flex-shrink-0">
                  {task.task_dependencies.length} deps
                </span>
              )}

              {task.task_tags && task.task_tags.length > 0 && (
                <span className="flex-shrink-0">
                  {task.task_tags.length} tags
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTaskEdit(phaseId, task);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTaskRemove(phaseId, task.task_id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Remove task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualTaskList;
