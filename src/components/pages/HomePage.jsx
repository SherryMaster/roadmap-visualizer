import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RoadmapUploader from "../roadmap/RoadmapUploader";
import RoadmapHistory from "../roadmap/RoadmapHistory";
import ValidationErrorModal from "../modals/ValidationErrorModal";
import PageLayout from "../layout/PageLayout";
import Tooltip from "../tooltips/Tooltip";
import RoadmapPersistence from "../../utils/RoadmapPersistence";
import SchemaValidator from "../../utils/SchemaValidator";
import DataTransformer from "../../utils/DataTransformer";
import usePageTitle from "../../hooks/usePageTitle";
import schema from "../../data/schema.json";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [roadmaps, setRoadmaps] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [stats, setStats] = useState({
    totalRoadmaps: 0,
    totalTasks: 0,
    averageProgress: 0,
  });
  const [routeError, setRouteError] = useState(null);

  // Set page title
  usePageTitle("Home");

  useEffect(() => {
    loadRoadmaps();
    loadStats();

    // Check for route error state
    if (location.state?.error) {
      setRouteError(location.state);
      // Clear the error from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const loadRoadmaps = () => {
    // Recalculate metadata to fix any incorrect phase/task counts
    RoadmapPersistence.recalculateAllMetadata();

    const roadmapMetadata = RoadmapPersistence.getAllRoadmapMetadata();
    setRoadmaps(roadmapMetadata);
  };

  const loadStats = () => {
    const roadmapStats = RoadmapPersistence.getRoadmapStats();
    setStats(roadmapStats);
  };

  const handleRoadmapUpload = async (rawData) => {
    try {
      // Validate the data against schema
      const validator = new SchemaValidator(schema);
      const validation = validator.validate(rawData);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setShowValidationModal(true);
        return;
      }

      // Transform data to UI-friendly format
      const transformedData = DataTransformer.transformToUI(rawData);

      if (!transformedData) {
        throw new Error("Failed to transform roadmap data");
      }

      // Save the roadmap
      const roadmapId = RoadmapPersistence.saveRoadmap(
        transformedData,
        rawData
      );

      // Navigate to the roadmap visualizer
      navigate(`/roadmap/${roadmapId}`);

      // Refresh the roadmap list
      loadRoadmaps();
      loadStats();
      setShowUploader(false);
    } catch (error) {
      console.error("Error processing roadmap:", error);
      setValidationErrors([`Failed to process roadmap: ${error.message}`]);
      setShowValidationModal(true);
    }
  };

  const handleSelectRoadmap = (roadmapId) => {
    // Navigate to the roadmap visualizer
    navigate(`/roadmap/${roadmapId}`);
    loadRoadmaps(); // Refresh to update last accessed time
  };

  const handleDeleteRoadmap = (roadmapId) => {
    const success = RoadmapPersistence.deleteRoadmap(roadmapId);
    if (success) {
      loadRoadmaps();
      loadStats();
    }
  };

  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
    setValidationErrors([]);
  };

  // Create subtitle with stats
  const subtitle =
    stats.totalRoadmaps > 0 ? (
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="hidden sm:inline">
            {stats.totalRoadmaps} roadmaps
          </span>
          <span className="sm:hidden">{stats.totalRoadmaps}R</span>
        </span>
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="hidden sm:inline">{stats.totalTasks} tasks</span>
          <span className="sm:hidden">{stats.totalTasks}T</span>
        </span>
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="hidden sm:inline">
            {stats.averageProgress}% progress
          </span>
          <span className="sm:hidden">{stats.averageProgress}%</span>
        </span>
      </div>
    ) : null;

  // Create action buttons
  const actionButtons = !showUploader ? (
    <div className="flex flex-col space-y-3 sm:space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {roadmaps.length === 0 ? "Get Started" : "Quick Actions"}
        </h2>
        {stats.totalRoadmaps > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="hidden sm:inline">
              {Math.floor((stats.totalTasks * stats.averageProgress) / 100)} of{" "}
              {stats.totalTasks} tasks completed
            </span>
            <span className="sm:hidden">
              {Math.floor((stats.totalTasks * stats.averageProgress) / 100)}/
              {stats.totalTasks} tasks done
            </span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
        <Tooltip
          content="Upload a roadmap JSON file"
          position="top"
          maxWidth="200px"
        >
          <button
            onClick={() => setShowUploader(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md"
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>Upload Roadmap</span>
          </button>
        </Tooltip>
        <Tooltip
          content="Build roadmaps from components"
          position="top"
          maxWidth="200px"
        >
          <button
            onClick={() => navigate("/assembler")}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md"
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
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <span>Assembler</span>
          </button>
        </Tooltip>
      </div>
    </div>
  ) : null;

  return (
    <PageLayout
      title="Roadmap Visualizer"
      subtitle={subtitle}
      showBreadcrumb={true}
      breadcrumbProps={{
        roadmapTitle: "Home",
        currentPhase: null,
        isHomePage: true,
      }}
      actions={actionButtons}
    >
      {/* Route Error Alert */}
      {routeError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 mr-3"
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
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                {routeError.error}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {routeError.message}
              </p>
            </div>
            <Tooltip
              content="Dismiss this error message"
              position="left"
              maxWidth="200px"
            >
              <button
                onClick={() => setRouteError(null)}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 ml-3"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {showUploader && (
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upload Roadmap File
              </h3>
              <Tooltip
                content="Cancel upload and return to main view"
                position="left"
                maxWidth="250px"
              >
                <button
                  onClick={() => setShowUploader(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
            <RoadmapUploader onRoadmapLoad={handleRoadmapUpload} />
          </div>
        </div>
      )}

      {/* Roadmap Collection */}
      {roadmaps.length > 0 && (
        <div className="mb-6">
          <RoadmapHistory
            roadmaps={roadmaps}
            onSelectRoadmap={handleSelectRoadmap}
            onDeleteRoadmap={handleDeleteRoadmap}
          />
        </div>
      )}

      {/* Getting Started Guide */}
      {roadmaps.length === 0 && !showUploader && (
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Getting Started
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Upload a JSON roadmap file or use the Assembler to build from
                  components. Files should follow our structured schema for
                  optimal compatibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Modal */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors}
      />
    </PageLayout>
  );
};

export default HomePage;
