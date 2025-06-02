/**
 * AuthGuard Component
 * Ensures authentication state is determined before rendering the app
 * Prevents race conditions and "user not found" errors on page refresh
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../feedback/LoadingStates';

const AuthGuard = ({ children }) => {
  const { loading, authInitialized } = useAuth();

  // Show loading screen until auth state is determined
  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* App Logo/Icon */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
              />
            </svg>
          </div>

          {/* Loading Spinner */}
          <LoadingSpinner size="lg" color="blue" />

          {/* Loading Text */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">
            Loading Roadmap Visualizer
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Initializing authentication and preparing your workspace...
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-1 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>

          {/* Timeout Warning */}
          {loading && (
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-md mx-auto">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Taking longer than expected? Check your internet connection.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Auth state is determined, render the app
  return children;
};

export default AuthGuard;
