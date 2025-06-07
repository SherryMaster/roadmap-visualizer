import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RoadmapUploader from "../roadmap/RoadmapUploader";
import RoadmapHistory from "../roadmap/RoadmapHistory";
import PublicRoadmapsList from "../roadmap/PublicRoadmapsList";
import CollectionRoadmapsList from "../collection/CollectionRoadmapsList";
import ValidationErrorModal from "../modals/ValidationErrorModal";

import PageLayout from "../layout/PageLayout";
import Tooltip from "../tooltips/Tooltip";
import { LoadingSpinner, ProgressBar } from "../feedback/LoadingStates";
import { useAuth } from "../../context/AuthContext";
import { useFirestore } from "../../context/FirestoreContext";

import SchemaValidator from "../../utils/SchemaValidator";
import DataTransformer from "../../utils/DataTransformer";
import usePageTitle from "../../hooks/usePageTitle";
import schema from "../../data/schema.json";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle("Home");

  const { currentUser } = useAuth();
  const {
    userRoadmaps,
    publicRoadmaps,
    collectionRoadmaps,
    saveRoadmap,
    deleteRoadmap,
    loadCollectionRoadmaps,
  } = useFirestore();

  const [showUploader, setShowUploader] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const [activeTab, setActiveTab] = useState("my-roadmaps");
  const [routeError, setRouteError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    step: "",
    message: "",
    progress: 0,
  });

  // Handle route error state
  useEffect(() => {
    if (location.state?.error) {
      setRouteError(location.state);
      // Clear the error from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Calculate stats from user roadmaps
  const stats = {
    totalRoadmaps: userRoadmaps.length,
    totalTasks: userRoadmaps.reduce(
      (total, roadmap) => total + (roadmap.totalTasks || 0),
      0
    ),
    averageProgress:
      userRoadmaps.length > 0
        ? Math.round(
            userRoadmaps.reduce(
              (total, roadmap) => total + (roadmap.progressPercentage || 0),
              0
            ) / userRoadmaps.length
          )
        : 0,
  };

  const handleRoadmapUpload = async (rawData) => {
    if (!currentUser) {
      setValidationErrors(["You must be signed in to upload roadmaps"]);
      setShowValidationModal(true);
      return;
    }

    try {
      // Start upload process
      setIsUploading(true);
      setUploadProgress({
        step: "validation",
        message: "Validating roadmap data...",
        progress: 10,
      });

      // Validate the data against schema
      const validator = new SchemaValidator(schema);
      const validation = validator.validate(rawData);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setShowValidationModal(true);
        setIsUploading(false);
        return;
      }

      setUploadProgress({
        step: "transformation",
        message: "Transforming data format...",
        progress: 30,
      });

      // Transform data to UI-friendly format
      const transformedData = DataTransformer.transformToUI(rawData);

      if (!transformedData) {
        throw new Error("Failed to transform roadmap data");
      }

      setUploadProgress({
        step: "saving",
        message: "Saving roadmap to database...",
        progress: 50,
      });

      // Require authentication for saving roadmaps
      if (!currentUser || !saveRoadmap) {
        throw new Error("You must be signed in to upload roadmaps");
      }

      // Save the roadmap to Firestore
      const roadmapId = await saveRoadmap(transformedData);

      setUploadProgress({
        step: "finalizing",
        message: "Finalizing upload...",
        progress: 90,
      });

      // Small delay to show completion
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUploadProgress({
        step: "complete",
        message: "Upload successful! Redirecting...",
        progress: 100,
      });

      // Navigate to the roadmap visualizer
      navigate(`/roadmap/${roadmapId}`);
      setShowUploader(false);
      setIsUploading(false);
    } catch (error) {
      console.error("Error processing roadmap:", error);
      setValidationErrors([`Failed to process roadmap: ${error.message}`]);
      setShowValidationModal(true);
      setIsUploading(false);
      setUploadProgress({
        step: "",
        message: "",
        progress: 0,
      });
    }
  };

  const handleSelectRoadmap = (roadmapId) => {
    // Navigate to the roadmap visualizer
    navigate(`/roadmap/${roadmapId}`);
  };

  const handleDeleteRoadmap = async (roadmapId) => {
    if (!currentUser) return;

    try {
      console.log("🗑️ Deleting roadmap:", roadmapId);
      await deleteRoadmap(roadmapId);
      console.log("✅ Roadmap deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting roadmap:", error);
      // The error will be handled by the Firestore context and shown in the UI
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
          {currentUser
            ? stats.totalRoadmaps === 0
              ? "Get Started"
              : "Quick Actions"
            : "Welcome"}
        </h2>
        {currentUser && stats.totalRoadmaps > 0 && (
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
        {!currentUser && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to create and manage your personal roadmaps
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
        <Tooltip
          content={
            currentUser
              ? "Upload a roadmap JSON file"
              : "Sign in to upload roadmaps"
          }
          position="top"
          maxWidth="200px"
        >
          <button
            onClick={() =>
              currentUser ? setShowUploader(true) : navigate("/login")
            }
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md disabled:opacity-50"
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
            <span>{currentUser ? "Upload Roadmap" : "Sign In"}</span>
          </button>
        </Tooltip>
        <Tooltip
          content={
            currentUser
              ? "Build roadmaps from components"
              : "Sign in to use the assembler"
          }
          position="top"
          maxWidth="200px"
        >
          <button
            onClick={() =>
              currentUser ? navigate("/assembler") : navigate("/login")
            }
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md disabled:opacity-50"
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
            <span>{currentUser ? "Assembler" : "Sign In"}</span>
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
                content={
                  isUploading
                    ? "Cannot close during upload"
                    : "Cancel upload and return to main view"
                }
                position="left"
                maxWidth="250px"
              >
                <button
                  onClick={() => !isUploading && setShowUploader(false)}
                  disabled={isUploading}
                  className={`p-1 rounded transition-colors ${
                    isUploading
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
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
            <RoadmapUploader
              onRoadmapLoad={handleRoadmapUpload}
              disabled={isUploading}
            />
          </div>
        </div>
      )}

      {/* Roadmap Sections */}
      {currentUser ? (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("my-roadmaps")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "my-roadmaps"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                My Roadmaps ({userRoadmaps.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("my-collection");
                  // Refresh collection roadmaps when tab is clicked
                  loadCollectionRoadmaps();
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "my-collection"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                My Collection ({collectionRoadmaps.length})
              </button>
              <button
                onClick={() => setActiveTab("public-roadmaps")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "public-roadmaps"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Community ({publicRoadmaps.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "my-roadmaps" && (
            <RoadmapHistory
              roadmaps={userRoadmaps}
              onSelectRoadmap={handleSelectRoadmap}
              onDeleteRoadmap={handleDeleteRoadmap}
              onUpload={() => setShowUploader(true)}
              showPrivacyControls={true}
            />
          )}

          {activeTab === "my-collection" && <CollectionRoadmapsList />}

          {activeTab === "public-roadmaps" && <PublicRoadmapsList />}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Public Roadmaps for Non-Authenticated Users */}
          <PublicRoadmapsList />

          {/* Getting Started Guide */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
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
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Welcome to Roadmap Visualizer
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Sign in to create, manage, and track your personal learning
                roadmaps. Upload JSON files or use our Assembler to build custom
                roadmaps.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              {/* Upload Icon */}
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {uploadProgress.step === "complete" ? (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <LoadingSpinner size="lg" color="blue" />
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {uploadProgress.step === "complete"
                  ? "Upload Complete!"
                  : "Uploading Roadmap"}
              </h3>

              {/* Progress Message */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {uploadProgress.message}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <ProgressBar
                  progress={uploadProgress.progress}
                  text=""
                  showPercentage={true}
                />
              </div>

              {/* Step Indicator */}
              <div className="flex justify-center space-x-2 mb-4">
                {[
                  "validation",
                  "transformation",
                  "saving",
                  "finalizing",
                  "complete",
                ].map((step, index) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      uploadProgress.step === step
                        ? "bg-blue-600"
                        : index <
                          [
                            "validation",
                            "transformation",
                            "saving",
                            "finalizing",
                            "complete",
                          ].indexOf(uploadProgress.step)
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Status Text */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {uploadProgress.step === "complete"
                  ? "Redirecting to your roadmap..."
                  : "Please wait while we process your roadmap..."}
              </p>
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
