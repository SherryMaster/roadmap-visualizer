import { useState } from "react";

const RoadmapUploader = ({ onRoadmapLoad }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

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

    if (file.type !== "application/json") {
      setError("Please upload a JSON file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);

        // Validate the JSON structure according to schema
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
          return;
        }

        // Valid schema format - let the DataTransformer handle the conversion
        onRoadmapLoad(json);
      } catch (err) {
        setError(`Failed to parse JSON file: ${err.message}`);
      }
    };

    reader.onerror = () => {
      setError("Failed to read file");
    };

    reader.readAsText(file);
  };

  return (
    <div className="mb-8">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload").click()}
      >
        <input
          id="file-upload"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileInput}
        />
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
