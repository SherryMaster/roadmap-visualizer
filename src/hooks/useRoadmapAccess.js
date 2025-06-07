/**
 * Custom hook for roadmap access control
 * Determines user permissions for roadmap viewing and progress tracking
 */

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const useRoadmapAccess = (metadata, initialRoadmapData) => {
  const { currentUser } = useAuth();

  const accessInfo = useMemo(() => {
    // Check if current user is the owner of the roadmap
    const isOwner = currentUser && (
      // Check metadata userId (Firestore roadmaps)
      (metadata && currentUser.uid === metadata.userId) ||
      // Check roadmap data userId (alternative source)
      (initialRoadmapData?.userId && currentUser.uid === initialRoadmapData.userId) ||
      // For localStorage roadmaps without userId, assume ownership if user is authenticated
      // and metadata exists but has no userId (localStorage case)
      (metadata && !metadata.userId && !initialRoadmapData?.userId)
    );

    // Determine if roadmap is public
    let isPublic = false;
    if (metadata?.isPublic !== undefined) {
      isPublic = metadata.isPublic;
    } else if (initialRoadmapData?.isPublic !== undefined) {
      isPublic = initialRoadmapData.isPublic;
    }

    // Determine download permissions
    let allowDownload = true; // Default to allow downloads
    if (metadata?.allowDownload !== undefined) {
      allowDownload = metadata.allowDownload;
    } else if (initialRoadmapData?.allowDownload !== undefined) {
      allowDownload = initialRoadmapData.allowDownload;
    }

    // Determine access level
    const accessLevel = isOwner ? 'owner' : (isPublic ? 'public' : 'restricted');
    
    // Can track progress only if owner
    const canTrackProgress = isOwner;
    
    // Can edit only if owner
    const canEdit = isOwner;
    
    // Can download if owner or downloads are allowed
    const canDownload = isOwner || allowDownload;

    return {
      isOwner,
      isPublic,
      allowDownload,
      accessLevel,
      canTrackProgress,
      canEdit,
      canDownload,
      isAuthenticated: !!currentUser,
      userId: currentUser?.uid || null,
    };
  }, [currentUser, metadata, initialRoadmapData]);

  return accessInfo;
};

export default useRoadmapAccess;
