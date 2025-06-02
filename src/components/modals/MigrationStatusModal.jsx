/**
 * Migration Status Modal Component
 * Shows the status of data migration from localStorage to Firestore
 */

import { useState } from 'react';
import { useFirestore } from '../../context/FirestoreContext';

const MigrationStatusModal = ({ isOpen, onClose }) => {
  const { migrationStatus } = useFirestore();
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !migrationStatus) return null;

  const { completed, result, error, timestamp } = migrationStatus;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Migration Status
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {completed ? (
            <div className="space-y-4">
              {/* Success Status */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Migration Completed
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your roadmap data has been successfully migrated to the cloud
                  </p>
                </div>
              </div>

              {/* Migration Summary */}
              {result && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Roadmaps migrated:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {result.migratedCount || 0}
                      </span>
                    </div>
                    
                    {result.errorCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Errors:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {result.errorCount}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Completed at:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {result.message && (
                    <p className="text-sm text-green-800 dark:text-green-200 mt-3">
                      {result.message}
                    </p>
                  )}
                </div>
              )}

              {/* Details Toggle */}
              {result?.results && result.results.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <span>{showDetails ? 'Hide' : 'Show'} migration details</span>
                    <svg
                      className={`h-4 w-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDetails && (
                    <div className="mt-3 space-y-2">
                      {result.results.map((item, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-sm ${
                            item.success
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <svg
                              className={`h-4 w-4 ${
                                item.success ? 'text-green-500' : 'text-red-500'
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              {item.success ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                            <span className={`font-medium ${
                              item.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                            }`}>
                              {item.title}
                            </span>
                          </div>
                          
                          {item.error && (
                            <p className="text-red-700 dark:text-red-300 mt-1 text-xs">
                              {item.error}
                            </p>
                          )}
                          
                          {item.success && item.firestoreId && (
                            <p className="text-green-700 dark:text-green-300 mt-1 text-xs">
                              New ID: {item.firestoreId}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Benefits */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  What's New:
                </h5>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Your roadmaps are now synced across all devices</li>
                  <li>• Real-time updates and collaboration features</li>
                  <li>• Enhanced security with user authentication</li>
                  <li>• Ability to share roadmaps with the community</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Error Status */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Migration Failed
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    There was an issue migrating your data
                  </p>
                </div>
              </div>

              {/* Error Details */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Retry Information */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Don't worry! Your local data is still safe. The migration will be retried automatically 
                  when you refresh the page or sign in again.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationStatusModal;
