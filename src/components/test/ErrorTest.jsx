import { useState } from 'react';

const ErrorTest = () => {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  if (shouldThrowError) {
    throw new Error('This is a test error to demonstrate the Error Boundary!');
  }

  const triggerError = () => {
    setShouldThrowError(true);
  };

  const triggerAsyncError = async () => {
    // This will cause an unhandled promise rejection
    throw new Error('This is an async error!');
  };

  const triggerTypeError = () => {
    // This will cause a TypeError
    const obj = null;
    console.log(obj.property.that.does.not.exist);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Error Boundary Test Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Use these buttons to test different types of errors and see how the Error Boundary handles them.
        </p>
      </div>

      <div className="space-y-6">
        {/* Error Trigger Buttons */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Error Triggers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={triggerError}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Trigger React Error
            </button>
            
            <button
              onClick={triggerAsyncError}
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Trigger Async Error
            </button>
            
            <button
              onClick={triggerTypeError}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Trigger Type Error
            </button>
          </div>
        </div>

        {/* Error Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            What Each Button Does
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-blue-900 dark:text-blue-100">React Error:</strong>
              <span className="text-blue-800 dark:text-blue-200 ml-2">
                Throws an error during component rendering, which will be caught by the Error Boundary.
              </span>
            </div>
            <div>
              <strong className="text-blue-900 dark:text-blue-100">Async Error:</strong>
              <span className="text-blue-800 dark:text-blue-200 ml-2">
                Throws an error in an async function. This may not be caught by the Error Boundary.
              </span>
            </div>
            <div>
              <strong className="text-blue-900 dark:text-blue-100">Type Error:</strong>
              <span className="text-blue-800 dark:text-blue-200 ml-2">
                Attempts to access a property on null, causing a TypeError.
              </span>
            </div>
          </div>
        </div>

        {/* Error Boundary Information */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
            Error Boundary Features
          </h2>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li>✅ Catches JavaScript errors anywhere in the component tree</li>
            <li>✅ Logs error details to the console</li>
            <li>✅ Displays a fallback UI instead of crashing the entire app</li>
            <li>✅ Shows detailed error information for debugging</li>
            <li>✅ Provides options to reload or reset the error state</li>
            <li>✅ Includes helpful troubleshooting suggestions</li>
            <li>✅ Shows technical details in development mode</li>
          </ul>
        </div>

        {/* NotFound Page Testing */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
            NotFound Page Testing
          </h2>
          <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-4">
            Test the enhanced NotFound page by visiting invalid URLs:
          </p>
          <div className="space-y-2">
            <a 
              href="/invalid-page" 
              className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
            >
              Test Invalid Page
            </a>
            <a 
              href="/roadmap/invalid-id" 
              className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm ml-2"
            >
              Test Invalid Roadmap
            </a>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current Status
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Error State:</strong> {shouldThrowError ? 'Error will be thrown!' : 'No error'}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTest;
