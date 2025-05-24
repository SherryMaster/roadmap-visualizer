import { useState } from "react";

const RoadmapUploader = ({ onRoadmapLoad }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    setError(null);
    setIsProcessing(true);

    if (file.type !== "application/json") {
      setError("Please upload a JSON file");
      setIsProcessing(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);

        // Basic structure validation first
        if (
          !json.title ||
          !json.roadmap ||
          !json.roadmap.phases ||
          !Array.isArray(json.roadmap.phases)
        ) {
          setError(
            "Invalid roadmap format. The JSON must include:\n" +
              '• A "title" field\n' +
              '• A "roadmap" object with "phases" array\n' +
              "Please ensure your JSON follows the schema format."
          );
          setIsProcessing(false);
          return;
        }

        // Pass to parent for full validation and processing
        onRoadmapLoad(json);
        setIsProcessing(false);
      } catch (err) {
        setError(`Failed to parse JSON file: ${err.message}`);
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read file");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="mb-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isProcessing
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-wait"
            : isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer"
            : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer"
        }`}
        onDragOver={!isProcessing ? handleDragOver : undefined}
        onDragLeave={!isProcessing ? handleDragLeave : undefined}
        onDrop={!isProcessing ? handleDrop : undefined}
        onClick={
          !isProcessing
            ? () => document.getElementById("file-upload").click()
            : undefined
        }
      >
        <input
          id="file-upload"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileInput}
          disabled={isProcessing}
        />

        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Processing your roadmap...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Validating and preparing your roadmap
            </p>
          </>
        ) : (
          <>
            <svg
              className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Drag and drop your roadmap JSON file here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to browse
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default RoadmapUploader;
