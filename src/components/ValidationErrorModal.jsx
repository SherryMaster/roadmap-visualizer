import { useState } from "react";
import schema from "../data/schema.json";

const ValidationErrorModal = ({ isOpen, onClose, errors, onDownloadSchema }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const downloadSchema = () => {
    try {
      const schemaBlob = new Blob([JSON.stringify(schema, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(schemaBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "roadmap-schema.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (onDownloadSchema) {
        onDownloadSchema();
      }
    } catch (error) {
      console.error("Error downloading schema:", error);
    }
  };

  const getErrorSeverity = (error) => {
    if (error.toLowerCase().includes("missing required")) {
      return "error";
    } else if (error.toLowerCase().includes("invalid")) {
      return "warning";
    }
    return "info";
  };

  const getErrorIcon = (severity) => {
    switch (severity) {
      case "error":
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getSuggestion = (error) => {
    if (error.includes("Missing required property")) {
      const property = error.match(/'([^']+)'/)?.[1];
      if (property) {
        return `Add the "${property}" property to your JSON structure.`;
      }
    } else if (error.includes("Invalid")) {
      return "Check the allowed values in the schema documentation.";
    } else if (error.includes("must be an array")) {
      return "Ensure this property is formatted as an array with square brackets [].";
    } else if (error.includes("must be an object")) {
      return "Ensure this property is formatted as an object with curly braces {}.";
    }
    return "Refer to the schema documentation for the correct format.";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Schema Validation Errors
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {errors.length} issue{errors.length !== 1 ? 's' : ''} found in your roadmap file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your roadmap file doesn't match the required schema format. Please fix the following issues:
            </p>
            
            <div className="space-y-3">
              {errors.slice(0, showDetails ? errors.length : 5).map((error, index) => {
                const severity = getErrorSeverity(error);
                const suggestion = getSuggestion(error);
                
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {getErrorIcon(severity)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {error}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          💡 {suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.length > 5 && !showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                Show {errors.length - 5} more errors...
              </button>
            )}

            {showDetails && errors.length > 5 && (
              <button
                onClick={() => setShowDetails(false)}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                Show fewer errors
              </button>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Need Help?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Download the schema file below to see the required structure</li>
              <li>• Ensure all required properties are present in your JSON</li>
              <li>• Check that array and object types match the schema</li>
              <li>• Validate your JSON syntax using an online JSON validator</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={downloadSchema}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Schema</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationErrorModal;
