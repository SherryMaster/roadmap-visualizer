/**
 * Save to Collection Button Component
 * Replaces download functionality for non-owners, allowing them to save roadmaps to their personal collection
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFirestore } from "../../context/FirestoreContext";
import Tooltip from "../tooltips/Tooltip";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";

const SaveToCollectionButton = ({
  roadmapId,
  roadmapTitle,
  isPublic,
  allowDownload,
}) => {
  const { currentUser } = useAuth();
  const {
    saveRoadmapToCollection,
    removeRoadmapFromCollection,
    isRoadmapInCollection,
  } = useFirestore();

  const [isInCollection, setIsInCollection] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  // Set up real-time listener for collection status
  useEffect(() => {
    if (!currentUser || !roadmapId) {
      return;
    }

    let unsubscribe = null;

    try {
      // Set up real-time listener for this specific roadmap in user's collection
      const collectionRef = doc(
        db,
        "userCollections",
        currentUser.uid,
        "savedRoadmaps",
        roadmapId
      );

      unsubscribe = onSnapshot(
        collectionRef,
        (docSnap) => {
          setIsInCollection(docSnap.exists());
          setHasPermissionError(false);
        },
        (error) => {
          console.error("Error in collection status listener:", error);
          if (error.message.includes("Missing or insufficient permissions")) {
            setHasPermissionError(true);
          }
        }
      );
    } catch (error) {
      console.error("Error setting up collection status listener:", error);
      if (error.message.includes("Missing or insufficient permissions")) {
        setHasPermissionError(true);
      }
    }

    // Cleanup listener on unmount or dependency change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, roadmapId]);

  // Only show for authenticated users on public roadmaps that allow downloads
  // Hide if there are permission errors (rules not deployed)
  if (!currentUser || !isPublic || !allowDownload || hasPermissionError) {
    return null;
  }

  const handleSaveToCollection = async () => {
    try {
      if (isInCollection) {
        await removeRoadmapFromCollection(roadmapId);
        // Real-time listener will update the button state automatically
        console.log(`✅ Removed "${roadmapTitle}" from collection`);
      } else {
        await saveRoadmapToCollection(roadmapId);
        // Real-time listener will update the button state automatically
        console.log(`✅ Saved "${roadmapTitle}" to collection`);
      }
    } catch (error) {
      console.error("❌ Failed to update collection:", error);

      // Show user-friendly error message
      if (error.message.includes("Missing or insufficient permissions")) {
        alert(
          "Gallery feature is not yet configured. Please contact the administrator to enable this feature."
        );
      } else {
        alert(
          `Failed to ${
            isInCollection ? "remove from" : "save to"
          } collection: ${error.message}`
        );
      }
    }
  };

  const buttonText = isInCollection
    ? "Remove from Collection"
    : "Save to Collection";
  const buttonIcon = isInCollection ? (
    // Remove icon
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
  ) : (
    // Save/Bookmark icon
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
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );

  const buttonColor = isInCollection
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const tooltipContent = isInCollection
    ? `Remove "${roadmapTitle}" from your collection. Your progress will be lost.`
    : `Save "${roadmapTitle}" to your collection to track your personal progress while preserving the original roadmap's credibility.`;

  return (
    <Tooltip content={tooltipContent} position="top" maxWidth="300px">
      <button
        onClick={handleSaveToCollection}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 ${buttonColor} rounded-lg transition-colors duration-200 min-h-[48px] font-medium shadow-sm hover:shadow-md`}
        aria-label={`${buttonText} for ${roadmapTitle}`}
      >
        {buttonIcon}
        <span>{buttonText}</span>
      </button>
    </Tooltip>
  );
};

export default SaveToCollectionButton;
