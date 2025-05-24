import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RoadmapUploader from "./RoadmapUploader";
import RoadmapHistory from "./RoadmapHistory";
import ValidationErrorModal from "./ValidationErrorModal";
import ThemeSelector from "./ThemeSelector";
import RoadmapPersistence from "../utils/RoadmapPersistence";
import SchemaValidator from "../utils/SchemaValidator";
import DataTransformer from "../utils/DataTransformer";
import usePageTitle from "../hooks/usePageTitle";
import schema from "../data/schema.json";

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Roadmap Visualizer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload and track your learning roadmaps with interactive progress
              tracking
            </p>
          </div>
          <ThemeSelector />
        </div>

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
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats.totalRoadmaps > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Roadmaps
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalRoadmaps}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalTasks}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Progress
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats.averageProgress}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {roadmaps.length === 0 ? "Get Started" : "Upload New Roadmap"}
            </h2>

            {!showUploader ? (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {roadmaps.length === 0
                    ? "Upload your first roadmap JSON file to begin tracking your learning journey"
                    : "Add another roadmap to your collection"}
                </p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Upload Roadmap
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Upload Roadmap File
                  </h3>
                  <button
                    onClick={() => setShowUploader(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg
                      className="w-6 h-6"
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
                </div>
                <RoadmapUploader onRoadmapLoad={handleRoadmapUpload} />
              </div>
            )}
          </div>
        </div>

        {/* Roadmap History */}
        {roadmaps.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <RoadmapHistory
              roadmaps={roadmaps}
              onSelectRoadmap={handleSelectRoadmap}
              onDeleteRoadmap={handleDeleteRoadmap}
            />
          </div>
        )}

        {/* Getting Started Help */}
        {roadmaps.length === 0 && !showUploader && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Need a roadmap file?
            </h3>
            <div className="text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                • Roadmap files should be in JSON format following our schema
              </p>
              <p>
                • Each roadmap contains phases with tasks, dependencies, and
                progress tracking
              </p>
              <p>
                • You can download the schema template from the validation error
                dialog
              </p>
              <p>
                • Try uploading a sample file to see how the visualizer works
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Error Modal */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors}
      />
    </div>
  );
};

export default HomePage;
