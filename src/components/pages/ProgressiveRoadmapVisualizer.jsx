import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RoadmapHeader from "../roadmap/RoadmapHeader";
import PhaseList from "../roadmap/PhaseList";
import SearchBar from "../layout/SearchBar";
import PageLayout from "../layout/PageLayout";
import ShareButton from "../layout/ShareButton";
import PrivacyToggle from "../roadmap/PrivacyToggle";
import DownloadToggle from "../roadmap/DownloadToggle";

import { TaskCompletionProvider } from "../../context/TaskCompletionContext";
import { useAuth } from "../../context/AuthContext";
import usePageTitle from "../../hooks/usePageTitle";
import configManager from "../../utils/ConfigManager";
import DataTransformer from "../../utils/DataTransformer";
import FirestorePersistence from "../../utils/FirestorePersistence";
import Tooltip from "../tooltips/Tooltip";
import { InfoTooltip, SuccessTooltip } from "../tooltips/EnhancedTooltip";
import { 
  RoadmapHeaderSkeleton, 
  PhaseSkeleton, 
  ProgressiveLoadingIndicator 
} from "../feedback/RoadmapSkeleton";

const ProgressiveRoadmapVisualizer = ({
  roadmapMetadata,
  roadmapId,
  onReturnHome,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Progressive loading states
  const [roadmapData, setRoadmapData] = useState(null);
  const [filteredRoadmapData, setFilteredRoadmapData] = useState(null);
  const [loadedPhases, setLoadedPhases] = useState(new Map());
  const [loadingPhases, setLoadingPhases] = useState(new Set());
  const [loadingProgress, setLoadingProgress] = useState({
    loaded: 0,
    total: 0,
    currentPhase: null,
    error: null
  });
  
  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPrivacy, setCurrentPrivacy] = useState(false);
  const [currentDownloadPermission, setCurrentDownloadPermission] = useState(true);

  // Set dynamic page title
  const pageTitle = currentPhase
    ? `${currentPhase.phase_title} - ${roadmapMetadata?.data?.title}`
    : roadmapMetadata?.data?.title;
  usePageTitle(pageTitle);

  // Initialize roadmap structure from metadata
  useEffect(() => {
    if (roadmapMetadata?.data) {
      const initialData = {
        ...roadmapMetadata.data,
        roadmap: roadmapMetadata.data.roadmap?.phases || roadmapMetadata.data.roadmap || []
      };
      
      // Create roadmap structure with empty phase tasks
      const roadmapWithEmptyTasks = {
        ...initialData,
        roadmap: initialData.roadmap.map(phase => ({
          ...phase,
          phase_tasks: [] // Start with empty tasks, will be loaded progressively
        }))
      };
      
      setRoadmapData(roadmapWithEmptyTasks);
      setFilteredRoadmapData(roadmapWithEmptyTasks);
      
      // Set loading progress
      setLoadingProgress({
        loaded: 0,
        total: initialData.roadmap.length,
        currentPhase: null,
        error: null
      });
      
      // Store roadmap data globally for dependency references
      window.roadmapData = roadmapWithEmptyTasks;

      // Find current phase if phaseId is in URL
      if (params.phaseId && initialData.roadmap) {
        const phase = initialData.roadmap.find(
          (p) => p.phase_id === params.phaseId
        );
        setCurrentPhase(phase);
      }
    }
  }, [roadmapMetadata, params.phaseId]);

  // Progressive phase loading function
  const loadPhaseData = useCallback(async (phaseId, phaseName) => {
    if (loadedPhases.has(phaseId) || loadingPhases.has(phaseId)) {
      return; // Already loaded or loading
    }

    setLoadingPhases(prev => new Set([...prev, phaseId]));
    setLoadingProgress(prev => ({
      ...prev,
      currentPhase: phaseName
    }));

    try {
      const phaseTasksMap = await FirestorePersistence.loadPhaseTasks(roadmapId, [phaseId]);
      const phaseTasks = phaseTasksMap.get(phaseId) || [];
      
      // Update roadmap data with loaded phase tasks
      setRoadmapData(prevData => {
        const updatedRoadmap = prevData.roadmap.map(phase => {
          if (phase.phase_id === phaseId) {
            return {
              ...phase,
              phase_tasks: phaseTasks
            };
          }
          return phase;
        });
        
        const updatedData = {
          ...prevData,
          roadmap: updatedRoadmap
        };
        
        // Update global reference
        window.roadmapData = updatedData;
        return updatedData;
      });
      
      // Update filtered data if no search is active
      if (!searchTerm.trim()) {
        setFilteredRoadmapData(prevData => {
          const updatedRoadmap = prevData.roadmap.map(phase => {
            if (phase.phase_id === phaseId) {
              return {
                ...phase,
                phase_tasks: phaseTasks
              };
            }
            return phase;
          });
          
          return {
            ...prevData,
            roadmap: updatedRoadmap
          };
        });
      }
      
      // Mark phase as loaded
      setLoadedPhases(prev => new Map([...prev, [phaseId, phaseTasks]]));
      setLoadingProgress(prev => ({
        ...prev,
        loaded: prev.loaded + 1,
        currentPhase: null
      }));
      
    } catch (error) {
      console.error(`Error loading phase ${phaseId}:`, error);
      setLoadingProgress(prev => ({
        ...prev,
        error: `Failed to load ${phaseName}`,
        currentPhase: null
      }));
    } finally {
      setLoadingPhases(prev => {
        const newSet = new Set(prev);
        newSet.delete(phaseId);
        return newSet;
      });
    }
  }, [roadmapId, loadedPhases, loadingPhases, searchTerm]);

  // Auto-load phases when they come into view or on initial load
  useEffect(() => {
    if (roadmapData?.roadmap && roadmapData.roadmap.length > 0) {
      // Load first few phases immediately
      const phasesToLoadImmediately = roadmapData.roadmap.slice(0, 2);
      
      phasesToLoadImmediately.forEach(phase => {
        loadPhaseData(phase.phase_id, phase.phase_title);
      });
      
      // Load remaining phases with a slight delay
      setTimeout(() => {
        const remainingPhases = roadmapData.roadmap.slice(2);
        remainingPhases.forEach((phase, index) => {
          setTimeout(() => {
            loadPhaseData(phase.phase_id, phase.phase_title);
          }, index * 500); // Stagger loading by 500ms
        });
      }, 1000);
    }
  }, [roadmapData?.roadmap, loadPhaseData]);

  // Update privacy and download permission state
  useEffect(() => {
    if (roadmapMetadata) {
      setCurrentPrivacy(roadmapMetadata.isPublic ?? false);
      setCurrentDownloadPermission(roadmapMetadata.allowDownload ?? true);
    }
  }, [roadmapMetadata]);

  // Search functionality
  const handleSearch = (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredRoadmapData(roadmapData);
      return;
    }

    const searchLower = term.toLowerCase();
    const searchConfig = configManager.getSearchConfig();

    // Handle both assembled roadmap structure (roadmap.phases) and direct array structure
    const phases = roadmapData.roadmap;

    // Filter phases and tasks based on search term
    const filteredPhases = phases
      .map((phase) => {
        // Check if phase title matches
        const phaseMatches = phase.phase_title
          .toLowerCase()
          .includes(searchLower);

        // Filter tasks within the phase
        const filteredTasks = (phase.phase_tasks || []).filter((task) => {
          let matches = false;

          // Search in title and summary
          matches =
            matches || task.task_title.toLowerCase().includes(searchLower);
          matches =
            matches || (task.task_summary || task.task_description || "").toLowerCase().includes(searchLower);

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

    // Update filtered roadmap data
    const updatedRoadmapData = {
      ...roadmapData,
      roadmap: filteredPhases,
    };

    setFilteredRoadmapData(updatedRoadmapData);
  };

  // Download functionality
  const handleDownloadRoadmap = async () => {
    // Check download permissions
    if (!isOwner && !currentDownloadPermission) {
      console.warn("Download not allowed for this roadmap");
      return;
    }

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

  const handlePrivacyChange = (newIsPublic) => {
    setCurrentPrivacy(newIsPublic);
    console.log(`🔄 Privacy changed: ${newIsPublic ? "Public" : "Private"}`);
  };

  const handleDownloadPermissionChange = (newAllowDownload) => {
    setCurrentDownloadPermission(newAllowDownload);
    console.log(
      `🔄 Download permission changed: ${
        newAllowDownload ? "Enabled" : "Disabled"
      }`
    );
  };

  // Check if current user is the owner
  const isOwner = currentUser && roadmapMetadata && currentUser.uid === roadmapMetadata.userId;

  // Show loading skeleton while initial data is not available
  if (!roadmapMetadata || !roadmapData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <RoadmapHeaderSkeleton />
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <PhaseSkeleton key={index} showTasks={true} taskCount={2} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Create action buttons
  const actionButtons = (
    <div className="flex flex-col space-y-3 sm:space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Roadmap Actions
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isOwner
            ? "Edit, download, or share this roadmap"
            : currentDownloadPermission
            ? "Download or share this roadmap"
            : "Share this roadmap"}
        </p>
      </div>

      <div
        className={`grid grid-cols-1 ${
          isOwner
            ? "sm:grid-cols-3"
            : currentDownloadPermission
            ? "sm:grid-cols-2"
            : "sm:grid-cols-1"
        } gap-3 max-w-2xl mx-auto`}
      >
        {/* Edit Button - Only show to roadmap owners */}
        {isOwner && (
          <InfoTooltip
            content="Edit roadmap content, add tasks, and modify structure"
            position="top"
            maxWidth="250px"
          >
            <button
              onClick={handleEditRoadmap}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md"
              aria-label={`Edit ${filteredRoadmapData?.title} roadmap`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
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
        )}

        {/* Download Button - Show to owners or if downloads are allowed */}
        {(isOwner || currentDownloadPermission) && (
          <SuccessTooltip
            content={
              isOwner
                ? "Download the current roadmap as a JSON file for backup or sharing"
                : "Download this roadmap as a JSON file"
            }
            position="top"
            maxWidth="250px"
          >
            <button
              onClick={handleDownloadRoadmap}
              disabled={
                isDownloading || (!isOwner && !currentDownloadPermission)
              }
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md"
              aria-label={`Download ${filteredRoadmapData?.title} roadmap as JSON`}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 flex-shrink-0"
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
        )}

        <div className="flex justify-center">
          <ShareButton roadmapTitle={filteredRoadmapData?.title} />
        </div>
      </div>
    </div>
  );

  return (
    <TaskCompletionProvider roadmapData={roadmapData} roadmapId={roadmapId}>
      <PageLayout
        title={filteredRoadmapData?.title}
        showBreadcrumb={true}
        breadcrumbProps={{
          roadmapTitle: filteredRoadmapData?.title,
          currentPhase: currentPhase,
        }}
        actions={actionButtons}
      >
        <RoadmapHeader
          title={roadmapData.title}
          description={roadmapData.description}
          projectLevel={roadmapData.project_level}
          tags={roadmapData.tags}
        />

        {/* Roadmap Settings - Only show for Firestore roadmaps with metadata */}
        {roadmapMetadata && (
          <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.50 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Roadmap Settings
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Privacy Toggle - Only show to roadmap owners */}
              {isOwner && (
                <PrivacyToggle
                  roadmapId={roadmapId}
                  isPublic={currentPrivacy}
                  onPrivacyChange={handlePrivacyChange}
                />
              )}

              {/* Download Toggle - Only show to roadmap owners */}
              {isOwner && (
                <DownloadToggle
                  roadmapId={roadmapId}
                  allowDownload={currentDownloadPermission}
                  onDownloadPermissionChange={handleDownloadPermissionChange}
                />
              )}
            </div>
          </div>
        )}

        {/* Progressive Loading Indicator */}
        {loadingProgress.total > 0 && loadingProgress.loaded < loadingProgress.total && (
          <ProgressiveLoadingIndicator
            loadedPhases={loadingProgress.loaded}
            totalPhases={loadingProgress.total}
            currentlyLoading={loadingProgress.currentPhase}
            error={loadingProgress.error}
          />
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            placeholder="Search phases and tasks..."
          />
        </div>

        {/* Phase List with Progressive Loading */}
        <PhaseList
          phases={filteredRoadmapData?.roadmap || []}
          roadmapData={filteredRoadmapData}
          loadedPhases={loadedPhases}
          loadingPhases={loadingPhases}
          onLoadPhase={loadPhaseData}
        />
      </PageLayout>
    </TaskCompletionProvider>
  );
};

export default ProgressiveRoadmapVisualizer;
