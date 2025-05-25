import { useState } from "react";

// Import schemas
import skeletonSchema from "../data/roadmap_skeleton_schema.json";
import tasksSchema from "../data/skeleton_tasks_schema.json";

const SchemaDownloader = ({
  variant = "full", // "full", "compact", "inline"
  showTitle = true,
  className = "",
  filter = "all", // "all", "skeleton", "tasks"
}) => {
  const [isDownloading, setIsDownloading] = useState(null);

  const downloadSchema = async (schemaType) => {
    setIsDownloading(schemaType);

    try {
      let schema, filename, description;

      if (schemaType === "skeleton") {
        schema = skeletonSchema;
        filename = "roadmap_skeleton_schema.json";
        description = "Roadmap Skeleton Schema";
      } else if (schemaType === "tasks") {
        schema = tasksSchema;
        filename = "skeleton_tasks_schema.json";
        description = "Task Files Schema";
      }

      // Create formatted JSON string
      const jsonString = JSON.stringify(schema, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.setAttribute("aria-label", `Download ${description}`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading schema:", error);
    } finally {
      setTimeout(() => setIsDownloading(null), 1000); // Show success state briefly
    }
  };

  const getDownloadButton = (schemaType, label, description, icon) => {
    const isCurrentlyDownloading = isDownloading === schemaType;

    if (variant === "inline") {
      return (
        <button
          onClick={() => downloadSchema(schemaType)}
          disabled={isCurrentlyDownloading}
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
          aria-label={`Download ${description}`}
        >
          {isCurrentlyDownloading ? (
            <>
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              {icon}
              <span className="underline">{label}</span>
            </>
          )}
        </button>
      );
    }

    if (variant === "compact") {
      return (
        <button
          onClick={() => downloadSchema(schemaType)}
          disabled={isCurrentlyDownloading}
          className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          aria-label={`Download ${description}`}
        >
          {isCurrentlyDownloading ? (
            <>
              <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              {icon}
              <span>{label}</span>
            </>
          )}
        </button>
      );
    }

    // Full variant
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {label}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {description}
            </p>
            <button
              onClick={() => downloadSchema(schemaType)}
              disabled={isCurrentlyDownloading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              aria-label={`Download ${description}`}
            >
              {isCurrentlyDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  {icon}
                  <span>Download Schema</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const downloadIcon = (
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  if (variant === "inline") {
    const showSkeleton = filter === "all" || filter === "skeleton";
    const showTasks = filter === "all" || filter === "tasks";

    return (
      <span className={`inline-flex items-center space-x-4 ${className}`}>
        {showSkeleton &&
          getDownloadButton(
            "skeleton",
            "skeleton schema",
            "Roadmap Skeleton Schema",
            downloadIcon
          )}
        {showSkeleton && showTasks && <span className="text-gray-400">•</span>}
        {showTasks &&
          getDownloadButton(
            "tasks",
            "task schema",
            "Task Files Schema",
            downloadIcon
          )}
      </span>
    );
  }

  if (variant === "compact") {
    const showSkeleton = filter === "all" || filter === "skeleton";
    const showTasks = filter === "all" || filter === "tasks";

    return (
      <div className={`space-y-3 ${className}`}>
        {showTitle && (
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Download Schema Files
          </h3>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          {showSkeleton &&
            getDownloadButton(
              "skeleton",
              "Skeleton Schema",
              "Schema for roadmap skeleton files",
              downloadIcon
            )}
          {showTasks &&
            getDownloadButton(
              "tasks",
              "Task Schema",
              "Schema for task files",
              downloadIcon
            )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Schema Reference Files
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Download JSON schema files to help you create properly formatted
            roadmap files
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {getDownloadButton(
          "skeleton",
          "Roadmap Skeleton Schema",
          "Use this schema to create skeleton files containing roadmap structure, phases, and metadata. Required for the first upload step.",
          downloadIcon
        )}

        {getDownloadButton(
          "tasks",
          "Task Files Schema",
          "Use this schema to create task files containing detailed task information, dependencies, and resources. Required for the second upload step.",
          downloadIcon
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              How to Use Schema Files
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>
                • Use these schemas as templates when creating your JSON files
              </li>
              <li>
                • Validate your files against these schemas before uploading
              </li>
              <li>
                • Follow the required field structure and data types specified
              </li>
              <li>
                • Check the enum values for fields with restricted options
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaDownloader;
