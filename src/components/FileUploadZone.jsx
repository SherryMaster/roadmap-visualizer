import { useState, useRef } from "react";

const FileUploadZone = ({ 
  onFilesSelected, 
  accept = ".json", 
  multiple = false, 
  title, 
  description,
  disabled = false,
  className = ""
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
      const validFiles = files.filter(file => {
        if (accept === ".json") {
          return file.type === "application/json" || file.name.endsWith('.json');
        }
        return true;
      });

      if (validFiles.length === 0) {
        throw new Error('No valid JSON files selected');
      }

      if (!multiple && validFiles.length > 1) {
        throw new Error('Only one file is allowed');
      }

      // Read file contents
      const fileContents = await Promise.all(
        validFiles.map(file => readFileAsJSON(file))
      );

      // Call the callback with the processed files
      if (multiple) {
        onFilesSelected(fileContents, validFiles);
      } else {
        onFilesSelected(fileContents[0], validFiles[0]);
      }

    } catch (error) {
      console.error('Error processing files:', error);
      onFilesSelected(null, null, error.message);
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
    let classes = `border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${className}`;
    
    if (disabled || isProcessing) {
      classes += " opacity-50 cursor-not-allowed";
    } else if (isDragging) {
      classes += " border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105";
    } else {
      classes += " border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50";
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Processing files...
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl text-gray-400 dark:text-gray-500">
              {multiple ? "📁" : "📄"}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {title || (multiple ? "Drop files here" : "Drop file here")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description || "or click to browse"}
              </p>
              {multiple && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Multiple files supported
                </p>
              )}
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
