/**
 * Collection Roadmaps List Component
 * Displays roadmaps saved to user's collection with individual progress tracking
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useFirestore } from "../../context/FirestoreContext";
import Tooltip from "../tooltips/Tooltip";
import RoadmapCard from "../roadmap/RoadmapCard";

const CollectionRoadmapsList = () => {
  const { collectionRoadmaps, error, removeRoadmapFromCollection } =
    useFirestore();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const handleRemoveFromCollection = async (roadmapId, roadmapTitle) => {
    if (
      !confirm(
        `Remove "${roadmapTitle}" from your collection? Your progress will be lost.`
      )
    ) {
      return;
    }

    try {
      await removeRoadmapFromCollection(roadmapId);
      // Real-time listener will update the collection automatically
      console.log(`✅ Removed "${roadmapTitle}" from collection`);
    } catch (error) {
      console.error("❌ Failed to remove from collection:", error);
    }
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="font-medium">Error loading collection</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (collectionRoadmaps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">No Saved Roadmaps</h3>
          <p className="text-sm">
            Save public roadmaps to your collection to track your personal
            progress.
          </p>
          <p className="text-sm mt-1">
            Browse the{" "}
            <Link
              to="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Community
            </Link>{" "}
            section to find roadmaps to save.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              My Collection ({collectionRoadmaps.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Roadmaps you've saved with your personal progress tracking
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              aria-label="List view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectionRoadmaps.map((roadmap) => (
              <RoadmapCard
                key={roadmap.id}
                roadmap={roadmap}
                section="my-collection"
                viewMode="grid"
                onRemoveFromCollection={handleRemoveFromCollection}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {collectionRoadmaps.map((roadmap) => (
              <RoadmapCard
                key={roadmap.id}
                roadmap={roadmap}
                section="my-collection"
                viewMode="list"
                onRemoveFromCollection={handleRemoveFromCollection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionRoadmapsList;
