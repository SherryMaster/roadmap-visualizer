import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFirestore } from '../../context/FirestoreContext';
import FirestorePersistence from '../../utils/FirestorePersistence';

const CollectionDependencyTest = () => {
  const { currentUser } = useAuth();
  const { updateCollectionRoadmapDependencyMode, getCollectionRoadmapDependencyMode } = useFirestore();
  const [testRoadmapId, setTestRoadmapId] = useState('');
  const [currentSetting, setCurrentSetting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, timestamp: new Date().toLocaleTimeString() }]);
  };

  const loadCurrentSetting = async () => {
    if (!testRoadmapId || !currentUser) return;
    
    setIsLoading(true);
    try {
      const setting = await FirestorePersistence.getCollectionRoadmapDependencyMode(
        currentUser.uid,
        testRoadmapId
      );
      setCurrentSetting(setting);
      addTestResult(`Loaded setting: ${setting === null ? 'null (inherit)' : setting}`);
    } catch (error) {
      addTestResult(`Error loading setting: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const testSaveSetting = async (value) => {
    if (!testRoadmapId || !currentUser) return;
    
    setIsLoading(true);
    try {
      await updateCollectionRoadmapDependencyMode(testRoadmapId, value);
      addTestResult(`Saved setting: ${value}`);
      
      // Reload to verify
      setTimeout(async () => {
        await loadCurrentSetting();
      }, 1000);
    } catch (error) {
      addTestResult(`Error saving setting: ${error.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    if (!testRoadmapId || !currentUser) {
      addTestResult('Please enter a roadmap ID and ensure you are logged in', false);
      return;
    }

    setTestResults([]);
    addTestResult('Starting full test...');

    // Test 1: Load initial setting
    await loadCurrentSetting();

    // Test 2: Save true
    setTimeout(async () => {
      addTestResult('Testing save true...');
      await testSaveSetting(true);
    }, 2000);

    // Test 3: Save false
    setTimeout(async () => {
      addTestResult('Testing save false...');
      await testSaveSetting(false);
    }, 4000);

    // Test 4: Save true again
    setTimeout(async () => {
      addTestResult('Testing save true again...');
      await testSaveSetting(true);
    }, 6000);
  };

  if (!currentUser) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p>Please log in to test collection dependency functionality.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Collection Dependency Test
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test Roadmap ID:
        </label>
        <input
          type="text"
          value={testRoadmapId}
          onChange={(e) => setTestRoadmapId(e.target.value)}
          placeholder="Enter a roadmap ID to test"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Current User: {currentUser.email}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Current Setting: {currentSetting === null ? 'null (inherit from original)' : String(currentSetting)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={loadCurrentSetting}
          disabled={isLoading || !testRoadmapId}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Load Current Setting
        </button>
        
        <button
          onClick={() => testSaveSetting(true)}
          disabled={isLoading || !testRoadmapId}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Save True
        </button>
        
        <button
          onClick={() => testSaveSetting(false)}
          disabled={isLoading || !testRoadmapId}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Save False
        </button>
        
        <button
          onClick={runFullTest}
          disabled={isLoading || !testRoadmapId}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Run Full Test
        </button>
      </div>

      {isLoading && (
        <div className="mb-4 p-2 bg-blue-100 border border-blue-400 rounded">
          <p className="text-blue-700">Loading...</p>
        </div>
      )}

      <div className="bg-gray-100 dark:bg-gray-700 rounded p-4">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Test Results:</h3>
        <div className="max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No test results yet</p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className={`mb-1 p-2 rounded text-sm ${
                  result.success
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                <span className="font-mono text-xs">{result.timestamp}</span> - {result.message}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Instructions:</h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 list-decimal list-inside space-y-1">
          <li>Enter a roadmap ID that you have saved to your collection</li>
          <li>Click "Load Current Setting" to see the current value</li>
          <li>Test saving different values (true/false)</li>
          <li>Verify that the setting persists by reloading</li>
          <li>Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default CollectionDependencyTest;
