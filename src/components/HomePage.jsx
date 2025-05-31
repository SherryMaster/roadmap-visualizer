import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RoadmapUploader from "./RoadmapUploader";
import RoadmapHistory from "./RoadmapHistory";
import ValidationErrorModal from "./ValidationErrorModal";
import ThemeSelector from "./ThemeSelector";
import Tooltip from "./Tooltip";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Modern Header with Hero Section */}
        <div className="relative">
          {/* Theme Selector - Positioned absolutely */}
          <div className="absolute top-0 right-0 z-10">
            <ThemeSelector />
          </div>

          {/* Hero Section */}
          <div className="text-center py-12 mb-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent mb-6">
                Roadmap Visualizer
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Transform your learning journey with interactive roadmaps,
                <br className="hidden md:block" />
                progress tracking, and intelligent dependency management
              </p>

              {/* Quick Stats for Returning Users */}
              {stats.totalRoadmaps > 0 && (
                <div className="flex justify-center items-center space-x-8 mb-8 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{stats.totalRoadmaps} roadmaps</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{stats.totalTasks} tasks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{stats.averageProgress}% average progress</span>
                  </div>
                </div>
              )}
            </div>
          </div>
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

        {/* Enhanced Stats Dashboard */}
        {stats.totalRoadmaps > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Your Learning Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Track your progress across all roadmaps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Tooltip
                content="Total number of roadmaps in your collection"
                position="top"
                maxWidth="200px"
              >
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {stats.totalRoadmaps}
                      </p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        +
                        {stats.totalRoadmaps > 1
                          ? Math.floor(stats.totalRoadmaps / 2)
                          : 0}{" "}
                        this month
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Total Roadmaps
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Learning paths in your collection
                    </p>
                  </div>
                </div>
              </Tooltip>

              <Tooltip
                content="Total number of tasks across all your roadmaps"
                position="top"
                maxWidth="200px"
              >
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-green-600 dark:text-green-400"
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
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {stats.totalTasks}
                      </p>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {Math.floor(
                          (stats.totalTasks * stats.averageProgress) / 100
                        )}{" "}
                        completed
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Total Tasks
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Learning objectives to master
                    </p>
                  </div>
                </div>
              </Tooltip>

              <Tooltip
                content="Average completion percentage across all your roadmaps"
                position="top"
                maxWidth="200px"
              >
                <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-purple-600 dark:text-purple-400"
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
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {stats.averageProgress}%
                      </p>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {stats.averageProgress >= 75
                          ? "Excellent!"
                          : stats.averageProgress >= 50
                          ? "Good pace"
                          : "Keep going!"}
                      </p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Average Progress
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Overall completion rate
                    </p>
                  </div>
                  {/* Progress Ring */}
                  <div className="relative w-16 h-16 mx-auto">
                    <svg
                      className="w-16 h-16 transform -rotate-90"
                      viewBox="0 0 64 64"
                    >
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 28 * (1 - stats.averageProgress / 100)
                        }`}
                        className="text-purple-600 dark:text-purple-400 transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {stats.averageProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </div>
          </div>
        )}

        {/* Modern Action Section */}
        {!showUploader ? (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {roadmaps.length === 0
                  ? "Start Your Journey"
                  : "Continue Building"}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {roadmaps.length === 0
                  ? "Choose how you'd like to create your first roadmap and begin tracking your learning progress"
                  : "Add new roadmaps to expand your learning collection"}
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Upload Card */}
              <Tooltip
                content="Upload a complete roadmap JSON file to start tracking your learning progress"
                position="top"
                maxWidth="300px"
              >
                <div
                  onClick={() => setShowUploader(true)}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Upload Roadmap
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      Have a complete roadmap file? Upload it directly and start
                      tracking your progress immediately.
                    </p>

                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform duration-300">
                      <span>Get Started</span>
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Tooltip>

              {/* Assembler Card */}
              <Tooltip
                content="Create roadmaps by combining skeleton and task files using our assembly tool"
                position="top"
                maxWidth="300px"
              >
                <div
                  onClick={() => navigate("/assembler")}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-green-600 dark:text-green-400"
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
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      Roadmap Assembler
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      Build roadmaps from modular components. Combine skeleton
                      and task files for maximum flexibility.
                    </p>

                    <div className="flex items-center text-green-600 dark:text-green-400 font-medium group-hover:translate-x-2 transition-transform duration-300">
                      <span>Start Building</span>
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Upload Roadmap File
                </h3>
                <Tooltip
                  content="Cancel upload and return to main view"
                  position="left"
                  maxWidth="250px"
                >
                  <button
                    onClick={() => setShowUploader(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                </Tooltip>
              </div>
              <RoadmapUploader onRoadmapLoad={handleRoadmapUpload} />
            </div>
          </div>
        )}

        {/* Enhanced Roadmap Collection */}
        {roadmaps.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Your Roadmap Collection
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Continue your learning journey where you left off
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <RoadmapHistory
                roadmaps={roadmaps}
                onSelectRoadmap={handleSelectRoadmap}
                onDeleteRoadmap={handleDeleteRoadmap}
              />
            </div>
          </div>
        )}

        {/* Enhanced Getting Started Guide */}
        {roadmaps.length === 0 && !showUploader && (
          <div className="mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                    Getting Started Guide
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-blue-800 dark:text-blue-200">
                          <strong>JSON Format:</strong> Roadmap files should
                          follow our structured schema for optimal compatibility
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-blue-800 dark:text-blue-200">
                          <strong>Rich Content:</strong> Include phases, tasks,
                          dependencies, and progress tracking
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-blue-800 dark:text-blue-200">
                          <strong>Schema Template:</strong> Download from
                          validation dialogs or help sections
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-blue-800 dark:text-blue-200">
                          <strong>Sample Files:</strong> Try uploading example
                          roadmaps to explore features
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-blue-800 dark:text-blue-200">
                          <strong>Modular Assembly:</strong> Use the{" "}
                          <strong>Roadmap Assembler</strong> for flexible
                          creation
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-blue-800 dark:text-blue-200">
                          <strong>Progress Tracking:</strong> Automatic state
                          management and completion tracking
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
