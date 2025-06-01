import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RoadmapHeader from "../roadmap/RoadmapHeader";
import PhaseList from "../roadmap/PhaseList";
import SearchBar from "../layout/SearchBar";
import ThemeSelector from "../layout/ThemeSelector";
import Breadcrumb from "../layout/Breadcrumb";
import ShareButton from "../layout/ShareButton";

import { TaskCompletionProvider } from "../../context/TaskCompletionContext";
import usePageTitle from "../../hooks/usePageTitle";
import configManager from "../../utils/ConfigManager";
import DataTransformer from "../../utils/DataTransformer";
import Tooltip from "../tooltips/Tooltip";
import { InfoTooltip, SuccessTooltip } from "../tooltips/EnhancedTooltip";

const RoadmapVisualizer = ({
  roadmapData: initialRoadmapData,
  roadmapId,
  onReturnHome,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState(initialRoadmapData);
  const [filteredRoadmapData, setFilteredRoadmapData] =
    useState(initialRoadmapData);
  const [loading] = useState(false);
  const [error] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Set dynamic page title
  const pageTitle = currentPhase
    ? `${currentPhase.phase_title} - ${initialRoadmapData?.title}`
    : initialRoadmapData?.title;
  usePageTitle(pageTitle);

  useEffect(() => {
    if (initialRoadmapData) {
      setRoadmapData(initialRoadmapData);
      setFilteredRoadmapData(initialRoadmapData);
      // Store roadmap data globally for dependency references
      window.roadmapData = initialRoadmapData;

      // Find current phase if phaseId is in URL
      if (params.phaseId && initialRoadmapData.roadmap) {
        const phase = initialRoadmapData.roadmap.find(
          (p) => p.phase_id === params.phaseId
        );
        setCurrentPhase(phase);
      }
    }
  }, [initialRoadmapData, params.phaseId]);

  const handleSearch = (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredRoadmapData(roadmapData);
      return;
    }

    const searchLower = term.toLowerCase();
    const searchConfig = configManager.getSearchConfig();

    // Handle both assembled roadmap structure (roadmap.phases) and direct array structure
    const phases = roadmapData.roadmap.phases || roadmapData.roadmap;

    // Filter phases and tasks based on search term
    const filteredPhases = phases
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

    // Preserve the original roadmap structure
    const updatedRoadmapData = {
      ...roadmapData,
      roadmap: roadmapData.roadmap.phases
        ? { ...roadmapData.roadmap, phases: filteredPhases }
        : filteredPhases,
    };

    setFilteredRoadmapData(updatedRoadmapData);
  };

  // Download functionality
  const handleDownloadRoadmap = async () => {
    setIsDownloading(true);
    try {
      // Transform UI data back to schema-compliant format
      const schemaData = DataTransformer.transformToSchema(roadmapData);

      if (!schemaData) {
        console.error("Failed to transform roadmap data to schema format");
        return;
      }

      // Create JSON string
      const dataStr = JSON.stringify(schemaData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename from roadmap title
      const filename = `${roadmapData.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_roadmap.json`;

      link.download = filename;
      link.setAttribute("aria-label", `Download ${roadmapData.title} roadmap`);

      // Execute download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading roadmap:", error);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000); // Show success state briefly
    }
  };

  const handleEditRoadmap = () => {
    navigate(`/roadmap/${roadmapId}/edit`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Roadmap
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Tooltip
            content="Return to homepage and roadmap collection"
            position="bottom"
            maxWidth="250px"
          >
            <button
              onClick={onReturnHome}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Return to Home
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }

  if (!roadmapData || !filteredRoadmapData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No roadmap data available
          </p>
          <Tooltip
            content="Return to homepage and roadmap collection"
            position="bottom"
            maxWidth="250px"
          >
            <button
              onClick={onReturnHome}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Return to Home
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <TaskCompletionProvider roadmapData={roadmapData} roadmapId={roadmapId}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
          {/* Header with Breadcrumb and Actions */}
          <div className="mb-6">
            {/* Breadcrumb Section */}
            <div className="mb-4">
              <Breadcrumb
                roadmapTitle={filteredRoadmapData?.title}
                currentPhase={currentPhase}
              />
            </div>

            {/* Action Buttons Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                {/* Primary Actions */}
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
                  <InfoTooltip
                    content="Edit roadmap content, add tasks, and modify structure"
                    position="bottom"
                    maxWidth="250px"
                  >
                    <button
                      onClick={handleEditRoadmap}
                      className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 min-h-[44px] shadow-sm hover:shadow-md"
                      aria-label={`Edit ${filteredRoadmapData?.title} roadmap`}
                    >
                      <svg
                        className="w-4 h-4 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Edit Roadmap</span>
                    </button>
                  </InfoTooltip>

                  <SuccessTooltip
                    content="Download the current roadmap as a JSON file for backup or sharing"
                    position="bottom"
                    maxWidth="250px"
                  >
                    <button
                      onClick={handleDownloadRoadmap}
                      disabled={isDownloading}
                      className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px] shadow-sm hover:shadow-md"
                      aria-label={`Download ${filteredRoadmapData?.title} roadmap as JSON`}
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 flex-shrink-0"></div>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </SuccessTooltip>
                </div>

                {/* Secondary Actions */}
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
                  <ShareButton roadmapTitle={filteredRoadmapData?.title} />
                  <ThemeSelector />
                </div>
              </div>
            </div>
          </div>

          <RoadmapHeader
            title={filteredRoadmapData.title}
            description={filteredRoadmapData.description}
            projectLevel={filteredRoadmapData.project_level}
            tags={filteredRoadmapData.tags}
          />

          <SearchBar onSearch={handleSearch} />

          {searchTerm &&
          (filteredRoadmapData.roadmap.phases || filteredRoadmapData.roadmap)
            .length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-6">
              No results found for "{searchTerm}". Try a different search term.
            </div>
          ) : searchTerm ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-4 rounded-md mb-6">
              Showing results for "{searchTerm}".{" "}
              {
                (
                  filteredRoadmapData.roadmap.phases ||
                  filteredRoadmapData.roadmap
                ).length
              }{" "}
              phases match your search.
            </div>
          ) : null}

          <PhaseList
            phases={
              filteredRoadmapData.roadmap.phases || filteredRoadmapData.roadmap
            }
          />
        </div>
      </div>
    </TaskCompletionProvider>
  );
};

export default RoadmapVisualizer;
