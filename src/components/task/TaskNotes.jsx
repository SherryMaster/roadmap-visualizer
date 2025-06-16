import { useState, useEffect } from 'react';

const TaskNotes = ({ taskId, phaseNumber, initialNotes }) => {
  const storageKey = `task-notes-${phaseNumber}-${taskId}`;
  
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Load notes from localStorage on initial render
  useEffect(() => {
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      setNotes(savedNotes);
    } else if (initialNotes) {
      setNotes(initialNotes);
    }
  }, [storageKey, initialNotes]);
  
  const handleSaveNotes = () => {
    localStorage.setItem(storageKey, notes);
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    const savedNotes = localStorage.getItem(storageKey);
    setNotes(savedNotes || initialNotes || '');
    setIsEditing(false);
  };

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Your Notes
        </h4>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {notes ? 'Edit' : 'Add Notes'}
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveNotes}
              className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Add your notes here..."
        />
      ) : notes ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
          {notes}
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-sm italic">
          No notes yet. Click 'Add Notes' to add your thoughts.
        </div>
      )}
    </div>
  );
};

export default TaskNotes;
