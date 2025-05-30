import { useEffect, useState } from "react";
import { useEditor } from "../context/EditorContext";

const KeyboardShortcuts = ({ onTogglePreview, onSave, onCancel }) => {
  const { undo, redo, canUndo, canRedo } = useEditor();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        return;
      }

      // Ctrl/Cmd + Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
        return;
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - Redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }

      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
        return;
      }

      // Escape - Cancel/Close modals
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      // Ctrl/Cmd + P - Toggle Preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        onTogglePreview();
        return;
      }

      // ? - Show help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // H - Show help (alternative)
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, onSave, onCancel, onTogglePreview]);

  const shortcuts = [
    { keys: ['Ctrl', 'Z'], mac: ['⌘', 'Z'], description: 'Undo last action', available: canUndo },
    { keys: ['Ctrl', 'Shift', 'Z'], mac: ['⌘', '⇧', 'Z'], description: 'Redo last action', available: canRedo },
    { keys: ['Ctrl', 'S'], mac: ['⌘', 'S'], description: 'Save changes', available: true },
    { keys: ['Ctrl', 'P'], mac: ['⌘', 'P'], description: 'Toggle preview mode', available: true },
    { keys: ['Esc'], mac: ['Esc'], description: 'Cancel/Close', available: true },
    { keys: ['?'], mac: ['?'], description: 'Show this help', available: true },
  ];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between py-2 ${
                      !shortcut.available ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center space-x-1">
                      {(isMac ? shortcut.mac : shortcut.keys).map((key, keyIndex) => (
                        <kbd 
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Keyboard shortcuts are disabled when typing in input fields or text areas.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Trigger Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40 flex items-center justify-center"
        title="Keyboard shortcuts (Press ? or H)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </>
  );
};

export default KeyboardShortcuts;
