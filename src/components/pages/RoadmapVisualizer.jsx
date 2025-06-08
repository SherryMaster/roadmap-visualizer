import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RoadmapHeader from "../roadmap/RoadmapHeader";
import PhaseList from "../roadmap/PhaseList";
import SearchBar from "../layout/SearchBar";
import PageLayout from "../layout/PageLayout";
import ShareButton from "../layout/ShareButton";
import PrivacyToggle from "../roadmap/PrivacyToggle";
import DownloadToggle from "../roadmap/DownloadToggle";
import DependencyToggle from "../roadmap/DependencyToggle";
import SaveToCollectionButton from "../collection/SaveToCollectionButton";

import { TaskCompletionProvider } from "../../context/TaskCompletionContext";
import { RoadmapVoteProvider } from "../../context/RoadmapVoteContext";
import { useAuth } from "../../context/AuthContext";
import { useFirestore } from "../../context/FirestoreContext";
import usePageTitle from "../../hooks/usePageTitle";
import useRoadmapAccess from "../../hooks/useRoadmapAccess";
import configManager from "../../utils/ConfigManager";
import DataTransformer from "../../utils/DataTransformer";
import Tooltip from "../tooltips/Tooltip";
import { InfoTooltip, SuccessTooltip } from "../tooltips/EnhancedTooltip";

const RoadmapVisualizer = ({
  roadmapData: initialRoadmapData,
  roadmapId,
  metadata,
  onReturnHome,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    removeRoadmapFromCollection,
    getUserDependencyMode, // Unified dependency mode getter
    updateUserDependencyMode, // Unified dependency mode setter
  } = useFirestore();
  const { isOwner, isCollection, canTrackProgress, canEdit, canDownload } =
    useRoadmapAccess(metadata, initialRoadmapData);
  const [roadmapData, setRoadmapData] = useState(initialRoadmapData);
  const [filteredRoadmapData, setFilteredRoadmapData] =
    useState(initialRoadmapData);
  const [loading] = useState(false);
  const [error] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPrivacy, setCurrentPrivacy] = useState(false);
  const [currentDownloadPermission, setCurrentDownloadPermission] =
    useState(true);
  const [currentDependencyMode, setCurrentDependencyMode] = useState(true);
  const [userDependencyMode, setUserDependencyMode] = useState(null);

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

  // Update privacy, download permission, and dependency mode state when metadata or roadmap data changes
  useEffect(() => {
    // Determine privacy status from multiple sources
    let isPublic = false;
    let allowDownload = true; // Default to allow downloads
    let enableDependencies = true; // Default to enable dependencies for backward compatibility

    // Check metadata first (Firestore roadmaps)
    if (metadata?.isPublic !== undefined) {
      isPublic = metadata.isPublic;
    }
    // Check roadmap data as fallback (alternative source)
    else if (initialRoadmapData?.isPublic !== undefined) {
      isPublic = initialRoadmapData.isPublic;
    }
    // For localStorage roadmaps, default to private
    else {
      isPublic = false;
    }

    // Check download permission from metadata first (Firestore roadmaps)
    if (metadata?.allowDownload !== undefined) {
      allowDownload = metadata.allowDownload;
    }
    // Check roadmap data (fallback for localStorage roadmaps)
    else if (initialRoadmapData?.allowDownload !== undefined) {
      allowDownload = initialRoadmapData.allowDownload;
    }
    // For localStorage roadmaps or missing field, default to allow downloads
    else {
      allowDownload = true;
    }

    // Check dependency mode from metadata first (Firestore roadmaps)
    if (metadata?.enableDependencies !== undefined) {
      enableDependencies = metadata.enableDependencies;
    }
    // Check roadmap data (fallback for localStorage roadmaps)
    else if (initialRoadmapData?.enableDependencies !== undefined) {
      enableDependencies = initialRoadmapData.enableDependencies;
    }
    // For localStorage roadmaps or missing field, default to enable dependencies
    else {
      enableDependencies = true;
    }

    setCurrentPrivacy(isPublic);
    setCurrentDownloadPermission(allowDownload);
    setCurrentDependencyMode(enableDependencies);
  }, [
    metadata?.isPublic,
    metadata?.allowDownload,
    metadata?.enableDependencies,
    initialRoadmapData?.isPublic,
    initialRoadmapData?.allowDownload,
    initialRoadmapData?.enableDependencies,
  ]);

  // Load user-specific dependency mode for all roadmaps (unified approach)
  useEffect(() => {
    if (!currentUser || !roadmapId) {
      setUserDependencyMode(null);
      return;
    }

    const loadUserDependencyMode = async () => {
      try {
        const mode = await getUserDependencyMode(roadmapId);
        setUserDependencyMode(mode);
        console.log(
          `🔄 Loaded user dependency mode: ${mode} for roadmap ${roadmapId}`
        );
      } catch (error) {
        console.error("❌ Error loading user dependency mode:", error);
        setUserDependencyMode(null);
      }
    };

    loadUserDependencyMode();
  }, [currentUser, roadmapId, getUserDependencyMode]);

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
    // Check download permissions using access control
    if (!canDownload) {
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

  const handleDependencyModeChange = async (newEnableDependencies) => {
    try {
      // Use unified approach for all roadmaps - save to user preferences
      await updateUserDependencyMode(roadmapId, newEnableDependencies);

      // Update local state immediately for UI responsiveness
      setUserDependencyMode(newEnableDependencies);

      console.log(
        `✅ Updated user dependency mode: ${newEnableDependencies} for roadmap ${roadmapId}`
      );
    } catch (error) {
      console.error("❌ Error updating user dependency mode:", error);
      // Revert local state on error
      const currentMode = await getUserDependencyMode(roadmapId);
      setUserDependencyMode(currentMode);
    }
  };

  const handleRemoveFromCollection = async () => {
    if (!currentUser || !roadmapId) {
      console.error(
        "Cannot remove from collection: missing user or roadmap ID"
      );
      return;
    }

    const roadmapTitle = filteredRoadmapData?.title || "this roadmap";

    if (
      !confirm(
        `Remove "${roadmapTitle}" from your collection? Your progress will be lost.`
      )
    ) {
      return;
    }

    try {
      await removeRoadmapFromCollection(roadmapId);
      console.log(`✅ Removed "${roadmapTitle}" from collection`);

      // Navigate back to home page after removal
      navigate("/");
    } catch (error) {
      console.error("❌ Failed to remove from collection:", error);
      alert(
        `Failed to remove "${roadmapTitle}" from collection: ${error.message}`
      );
    }
  };

  // Access control is now handled by useRoadmapAccess hook

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
            : isCollection
            ? "Track your progress on this saved roadmap"
            : canDownload
            ? "Save to collection or share this roadmap"
            : "Share this roadmap"}
        </p>
      </div>

      <div
        className={`grid grid-cols-1 ${
          isOwner
            ? "sm:grid-cols-3"
            : isCollection
            ? "sm:grid-cols-2"
            : canDownload
            ? "sm:grid-cols-2"
            : "sm:grid-cols-1"
        } gap-3 max-w-3xl mx-auto`}
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

        {/* Save to Collection Button - Show for non-owners on public roadmaps (replaces download) */}
        {!isOwner &&
          !isCollection &&
          currentPrivacy &&
          currentDownloadPermission && (
            <SaveToCollectionButton
              roadmapId={roadmapId}
              roadmapTitle={filteredRoadmapData?.title}
              isPublic={currentPrivacy}
              allowDownload={currentDownloadPermission}
            />
          )}

        {/* Download Button - Show only for owners */}
        {isOwner && canDownload && (
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
              disabled={isDownloading || !canDownload}
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

        {/* Remove from Collection Button - Show only for collection roadmaps */}
        {isCollection && (
          <button
            onClick={() => handleRemoveFromCollection()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md"
            aria-label={`Remove ${filteredRoadmapData?.title} from collection`}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Remove from Collection</span>
          </button>
        )}

        <div className="flex justify-center">
          <ShareButton roadmapTitle={filteredRoadmapData?.title} />
        </div>
      </div>
    </div>
  );

  // Create the main content
  const mainContent = (
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
        title={filteredRoadmapData.title}
        description={filteredRoadmapData.description}
        projectLevel={filteredRoadmapData.project_level}
        tags={filteredRoadmapData.tags}
        creatorDisplayName={metadata?.creatorDisplayName}
        creatorEmail={metadata?.creatorEmail}
        isPublic={currentPrivacy}
      />

      {/* Roadmap Settings - Show for owners only (affects all users) */}
      {metadata && isOwner && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Settings Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Roadmap Settings
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                Affects all users
              </span>
            </div>
          </div>

          {/* Roadmap Settings Content */}
          <div className="p-4 space-y-4">
            {/* Privacy Toggle */}
            <PrivacyToggle
              roadmapId={roadmapId}
              isPublic={currentPrivacy}
              userId={metadata.userId}
              onPrivacyChange={handlePrivacyChange}
            />

            {/* Download Permission Toggle */}
            <DownloadToggle
              roadmapId={roadmapId}
              allowDownload={currentDownloadPermission}
              userId={metadata.userId}
              onDownloadPermissionChange={handleDownloadPermissionChange}
            />
          </div>
        </div>
      )}

      {/* Personal Settings - Show for owners and collection users (affects current user only) */}
      {metadata && (isOwner || isCollection) && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          {/* Settings Header */}
          <div className="px-4 py-3 border-b border-blue-200 dark:border-blue-600">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-blue-500 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Personal Settings
              </h3>
              <span className="text-xs text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full">
                {isCollection ? "Your copy only" : "Your experience only"}
              </span>
            </div>
          </div>

          {/* Personal Settings Content */}
          <div className="p-4">
            {/* Dependency Mode Toggle */}
            <DependencyToggle
              roadmapId={roadmapId}
              enableDependencies={
                // Unified approach: use user preference if set, otherwise fall back to roadmap default
                userDependencyMode !== null
                  ? userDependencyMode
                  : currentDependencyMode
              }
              userId={currentUser?.uid} // Use current user ID for personal settings
              onDependencyModeChange={handleDependencyModeChange}
              isCollectionRoadmap={isCollection}
            />
          </div>
        </div>
      )}

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
            (filteredRoadmapData.roadmap.phases || filteredRoadmapData.roadmap)
              .length
          }{" "}
          phases match your search.
        </div>
      ) : null}

      <PhaseList
        phases={
          filteredRoadmapData.roadmap.phases || filteredRoadmapData.roadmap
        }
      />
    </PageLayout>
  );

  // Wrap with RoadmapVoteProvider for all users, and conditionally with TaskCompletionProvider for owners
  const contentWithVoting = (
    <RoadmapVoteProvider roadmapId={roadmapId}>
      {mainContent}
    </RoadmapVoteProvider>
  );

  // Check if this is a collection roadmap by looking at metadata
  const isCollectionRoadmap = metadata?.isCollection || false;

  return canTrackProgress ? (
    <TaskCompletionProvider
      roadmapData={roadmapData}
      roadmapId={roadmapId}
      isCollectionRoadmap={isCollectionRoadmap}
      enableDependencies={
        // Unified approach: use user preference if set, otherwise fall back to roadmap default
        userDependencyMode !== null ? userDependencyMode : currentDependencyMode
      }
    >
      {contentWithVoting}
    </TaskCompletionProvider>
  ) : (
    contentWithVoting
  );
};

export default RoadmapVisualizer;
