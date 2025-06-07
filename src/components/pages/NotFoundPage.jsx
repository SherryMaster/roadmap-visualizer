import { useNavigate, useRouteError, Link } from "react-router-dom";
import { useEffect } from "react";
import PageLayout from "../layout/PageLayout";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const error = useRouteError();

  useEffect(() => {
    document.title = "Page Not Found - Roadmap Visualizer";

    return () => {
      document.title = "Roadmap Visualizer";
    };
  }, []);

  const isRoadmapNotFound = error?.status === 404 && error?.statusText;
  const isInvalidRoadmap = error?.status === 400;

  const getErrorMessage = () => {
    if (isRoadmapNotFound) {
      return {
        title: "Roadmap Not Found",
        message:
          "The roadmap you're looking for doesn't exist or may have been deleted.",
        suggestion:
          "Check your roadmap history or upload a new roadmap to get started.",
      };
    } else if (isInvalidRoadmap) {
      return {
        title: "Invalid Roadmap",
        message: "The roadmap ID provided is invalid or malformed.",
        suggestion: "Please check the URL and try again.",
      };
    } else {
      return {
        title: "Page Not Found",
        message: "The page you're looking for doesn't exist.",
        suggestion:
          "You might have mistyped the URL or the page may have been moved.",
      };
    }
  };

  const { title, message, suggestion } = getErrorMessage();

  return (
    <PageLayout title={title}>
      {/* Error Content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-8">
          {isRoadmapNotFound || isInvalidRoadmap ? (
            <svg
              className="w-24 h-24 text-yellow-500 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-24 h-24 text-gray-400 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2 max-w-md mx-auto">
            {message}
          </p>

          <p className="text-gray-500 dark:text-gray-500 max-w-lg mx-auto">
            {suggestion}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Home
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>
        </div>

        {/* Additional Help for Roadmap Errors */}
        {(isRoadmapNotFound || isInvalidRoadmap) && (
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg max-w-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Need Help?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 text-left">
              <li>• Check your roadmap history on the home page</li>
              <li>• Verify the roadmap URL is correct</li>
              <li>• Upload a new roadmap if the original was deleted</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        )}
      </div>

      {/* Enhanced Debug Info */}
      {error && (
        <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-4xl mx-auto">
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-4 text-lg flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Error Details
          </h4>
          <div className="space-y-4">
            {/* Primary Error Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {error.status && (
                <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-red-900 dark:text-red-100 font-medium text-sm mb-1">
                    Status Code
                  </div>
                  <div className="text-red-800 dark:text-red-200 text-lg font-mono">
                    {error.status}
                  </div>
                </div>
              )}
              {error.statusText && (
                <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-red-900 dark:text-red-100 font-medium text-sm mb-1">
                    Status Text
                  </div>
                  <div className="text-red-800 dark:text-red-200">
                    {error.statusText}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error.message && (
              <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-red-900 dark:text-red-100 font-medium text-sm mb-2">
                  Error Message
                </div>
                <div className="text-red-800 dark:text-red-200 font-mono text-sm break-words bg-red-50 dark:bg-red-900/60 p-2 rounded">
                  {error.message}
                </div>
              </div>
            )}

            {/* URL Information */}
            <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-red-900 dark:text-red-100 font-medium text-sm mb-2">
                Requested URL
              </div>
              <div className="text-red-800 dark:text-red-200 font-mono text-sm break-all bg-red-50 dark:bg-red-900/60 p-2 rounded">
                {window.location.href}
              </div>
            </div>

            {/* Additional Data */}
            {error.data && (
              <div className="bg-red-100 dark:bg-red-900/40 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-red-900 dark:text-red-100 font-medium text-sm mb-2">
                  Additional Data
                </div>
                <div className="text-red-800 dark:text-red-200 font-mono text-sm bg-red-50 dark:bg-red-900/60 p-2 rounded overflow-auto">
                  {typeof error.data === "string"
                    ? error.data
                    : JSON.stringify(error.data, null, 2)}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-red-900 dark:text-red-100 font-medium text-sm mb-1">
                Timestamp
              </div>
              <div className="text-red-800 dark:text-red-200 text-sm">
                {new Date().toLocaleString()}
              </div>
            </div>

            {/* Development Details */}
            {process.env.NODE_ENV === "development" && (
              <details className="mt-6">
                <summary className="cursor-pointer text-red-900 dark:text-red-100 font-medium text-base hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Technical Details (Development Mode)
                </summary>
                <div className="mt-4 bg-red-100 dark:bg-red-900/40 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <pre className="text-xs text-red-800 dark:text-red-200 overflow-auto whitespace-pre-wrap break-words max-h-96">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default NotFoundPage;
