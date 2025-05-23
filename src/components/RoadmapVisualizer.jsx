import { useState, useEffect } from "react";
import RoadmapHeader from "./RoadmapHeader";
import PhaseList from "./PhaseList";
import RoadmapUploader from "./RoadmapUploader";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import { TaskCompletionProvider } from "../context/TaskCompletionContext";
import sampleRoadmap from "../data/sampleRoadmap.json";
import schema from "../data/schema.json";
import SchemaValidator from "../utils/SchemaValidator";
import DataTransformer from "../utils/DataTransformer";
import configManager from "../utils/ConfigManager";

const RoadmapVisualizer = () => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [filteredRoadmapData, setFilteredRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    loadAndProcessRoadmap(sampleRoadmap);
  }, []);

  const loadAndProcessRoadmap = async (rawData) => {
    try {
      setLoading(true);
      setError(null);
      setValidationErrors([]);

      // Validate the data against schema
      const validator = new SchemaValidator(schema);
      const validation = validator.validate(rawData);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        console.warn("Schema validation issues:", validation.errors);
      }

      // Transform data to UI-friendly format
      const transformedData = DataTransformer.transformToUI(rawData);

      if (!transformedData) {
        throw new Error("Failed to transform roadmap data");
      }

      setRoadmapData(transformedData);
      setFilteredRoadmapData(transformedData);

      // Store roadmap data globally for dependency references
      window.roadmapData = transformedData;

      setLoading(false);
    } catch (err) {
      console.error("Error loading roadmap:", err);
      setError(`Failed to load roadmap data: ${err.message}`);
      setLoading(false);
    }
  };

  const handleRoadmapLoad = (newRoadmapData) => {
    loadAndProcessRoadmap(newRoadmapData);
    setShowUploader(false);
    setSearchTerm("");
  };

  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredRoadmapData(roadmapData);
      return;
    }

    const searchLower = term.toLowerCase();
    const searchConfig = configManager.getSearchConfig();

    // Filter phases and tasks based on search term
    const filteredPhases = roadmapData.roadmap
      .map((phase) => {
        // Check if phase title matches
        const phaseMatches = phase.phase_title
          .toLowerCase()
          .includes(searchLower);

        // Filter tasks within the phase
        const filteredTasks = phase.phase_tasks.filter((task) => {
          let matches = false;

          // Search in title and summary
          matches =
            matches || task.task_title.toLowerCase().includes(searchLower);
          matches =
            matches || task.task_summary.toLowerCase().includes(searchLower);

          // Search in content if enabled
          if (searchConfig.searchInContent && task.task_detail?.detail) {
            matches =
              matches ||
              task.task_detail.detail.toLowerCase().includes(searchLower);
          }

          // Search in tags if enabled
          if (searchConfig.searchInTags && task.task_tags) {
            matches =
              matches ||
              task.task_tags.some((tag) =>
                tag.toLowerCase().includes(searchLower)
              );
          }

          // Search in code blocks
          if (task.task_detail?.code_blocks) {
            matches =
              matches ||
              task.task_detail.code_blocks.some(
                (block) =>
                  block.code?.toLowerCase().includes(searchLower) ||
                  block.explanation?.toLowerCase().includes(searchLower)
              );
          }

          return matches;
        });

        // If phase matches or has matching tasks, include it
        if (phaseMatches || filteredTasks.length > 0) {
          return {
            ...phase,
            phase_tasks:
              filteredTasks.length > 0 ? filteredTasks : phase.phase_tasks,
          };
        }

        return null;
      })
      .filter(Boolean);

    setFilteredRoadmapData({
      ...roadmapData,
      roadmap: filteredPhases,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <TaskCompletionProvider roadmapData={roadmapData}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <ThemeToggle />
          <div className="flex space-x-2">
            <button
              onClick={toggleUploader}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {showUploader ? "Cancel Upload" : "Upload Roadmap"}
            </button>
          </div>
        </div>

        {showUploader && <RoadmapUploader onRoadmapLoad={handleRoadmapLoad} />}

        {validationErrors.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-6">
            <h4 className="font-semibold mb-2">Schema Validation Warnings:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.slice(0, 5).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
              {validationErrors.length > 5 && (
                <li>... and {validationErrors.length - 5} more issues</li>
              )}
            </ul>
          </div>
        )}

        <RoadmapHeader title={filteredRoadmapData.title} />

        <SearchBar onSearch={handleSearch} />

        {searchTerm && filteredRoadmapData.roadmap.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-6">
            No results found for "{searchTerm}". Try a different search term.
          </div>
        ) : searchTerm ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-4 rounded-md mb-6">
            Showing results for "{searchTerm}".{" "}
            {filteredRoadmapData.roadmap.length} phases match your search.
          </div>
        ) : null}

        <PhaseList phases={filteredRoadmapData.roadmap} />
      </div>
    </TaskCompletionProvider>
  );
};

export default RoadmapVisualizer;
