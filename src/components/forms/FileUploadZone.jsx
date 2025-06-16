import { useState, useRef } from "react";

// Modern SVG Icons for FileUploadZone
const UploadIcons = {
  Document: ({ className = "w-12 h-12" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  Folder: ({ className = "w-12 h-12" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
  Upload: ({ className = "w-12 h-12" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  ),
};

const FileUploadZone = ({
  onFilesSelected,
  accept = ".json",
  multiple = false,
  title,
  description,
  disabled = false,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = async (files) => {
    setIsProcessing(true);

    try {
      // Filter files by accepted types
      const validFiles = files.filter((file) => {
        if (accept === ".json") {
          return (
            file.type === "application/json" || file.name.endsWith(".json")
          );
        }
        return true;
      });

      if (validFiles.length === 0) {
        throw new Error("No valid JSON files selected");
      }

      if (!multiple && validFiles.length > 1) {
        throw new Error("Only one file is allowed");
      }

      // Read file contents
      const fileContents = await Promise.all(
        validFiles.map((file) => readFileAsJSON(file))
      );

      // Call the callback with the processed files
      if (multiple) {
        onFilesSelected(fileContents, validFiles);
      } else {
        onFilesSelected(fileContents[0], validFiles[0]);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      onFilesSelected(null, null, error.message);
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const readFileAsJSON = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          resolve(json);
        } catch (error) {
          reject(new Error(`Failed to parse ${file.name}: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error(`Failed to read ${file.name}`));
      };

      reader.readAsText(file);
    });
  };

  const handleClick = () => {
    if (!disabled && !isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getZoneClasses = () => {
    let classes = `border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer relative overflow-hidden ${className}`;

    if (disabled || isProcessing) {
      classes += " opacity-50 cursor-not-allowed";
    } else if (isDragging) {
      classes +=
        " border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 scale-[1.01] shadow-md";
    } else {
      classes +=
        " border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800/50 dark:hover:to-blue-900/20 hover:shadow-sm";
    }

    return classes;
  };

  return (
    <div
      className={getZoneClasses()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleFileInput}
        disabled={disabled || isProcessing}
      />

      <div className="flex flex-col items-center space-y-4">
        {isProcessing ? (
          <>
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200 dark:border-blue-800"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Processing files...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Validating and preparing your upload
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center shadow-md">
                {multiple ? (
                  <UploadIcons.Folder className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                ) : (
                  <UploadIcons.Document className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/20 rounded-xl animate-pulse"></div>
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {title || (multiple ? "Drop files here" : "Drop file here")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {description || "or click to browse"}
              </p>
              {multiple && (
                <div className="flex items-center justify-center space-x-1.5 mt-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    Multiple files supported
                  </span>
                </div>
              )}

              {/* Compact visual feedback */}
              <div className="flex items-center justify-center space-x-3 mt-3 text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <UploadIcons.Upload className="w-3 h-3" />
                  <span>Drag & Drop</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  <span>Click to Browse</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default FileUploadZone;
