import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Enhanced progressive loading hook with better state management and error handling
 */
export const useProgressiveLoading = (initialItems = []) => {
  const [loadingStates, setLoadingStates] = useState(new Map());
  const [loadedItems, setLoadedItems] = useState(new Map());
  const [errors, setErrors] = useState(new Map());
  const [currentlyLoading, setCurrentlyLoading] = useState(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  
  const loadingQueue = useRef([]);
  const isProcessing = useRef(false);

  // Initialize progress tracking
  useEffect(() => {
    if (initialItems.length > 0) {
      setProgress({ loaded: 0, total: initialItems.length });
    }
  }, [initialItems]);

  // Update progress when items are loaded
  useEffect(() => {
    const loadedCount = loadedItems.size;
    const totalCount = initialItems.length;
    setProgress({ loaded: loadedCount, total: totalCount });
  }, [loadedItems.size, initialItems.length]);

  const setItemLoading = useCallback((itemId, isLoading) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      if (isLoading) {
        newMap.set(itemId, true);
      } else {
        newMap.delete(itemId);
      }
      return newMap;
    });
  }, []);

  const setItemLoaded = useCallback((itemId, data) => {
    setLoadedItems(prev => new Map(prev).set(itemId, data));
    setItemLoading(itemId, false);
    setErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId); // Clear any previous errors
      return newMap;
    });
  }, [setItemLoading]);

  const setItemError = useCallback((itemId, error) => {
    setErrors(prev => new Map(prev).set(itemId, error));
    setItemLoading(itemId, false);
  }, [setItemLoading]);

  const isItemLoading = useCallback((itemId) => {
    return loadingStates.has(itemId);
  }, [loadingStates]);

  const isItemLoaded = useCallback((itemId) => {
    return loadedItems.has(itemId);
  }, [loadedItems]);

  const getItemData = useCallback((itemId) => {
    return loadedItems.get(itemId);
  }, [loadedItems]);

  const getItemError = useCallback((itemId) => {
    return errors.get(itemId);
  }, [errors]);

  const hasItemError = useCallback((itemId) => {
    return errors.has(itemId);
  }, [errors]);

  // Queue-based loading to prevent race conditions
  const queueLoad = useCallback((itemId, loadFunction, options = {}) => {
    const { priority = 'normal', delay = 0 } = options;
    
    loadingQueue.current.push({
      itemId,
      loadFunction,
      priority,
      delay,
      timestamp: Date.now()
    });

    // Sort queue by priority (high -> normal -> low)
    loadingQueue.current.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    processQueue();
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing.current || loadingQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;

    while (loadingQueue.current.length > 0) {
      const item = loadingQueue.current.shift();
      const { itemId, loadFunction, delay } = item;

      // Skip if already loaded or loading
      if (isItemLoaded(itemId) || isItemLoading(itemId)) {
        continue;
      }

      try {
        setCurrentlyLoading(itemId);
        setItemLoading(itemId, true);

        // Apply delay if specified
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const data = await loadFunction(itemId);
        setItemLoaded(itemId, data);
      } catch (error) {
        console.error(`Error loading item ${itemId}:`, error);
        setItemError(itemId, error.message || 'Failed to load');
      }
    }

    setCurrentlyLoading(null);
    isProcessing.current = false;
  }, [isItemLoaded, isItemLoading, setItemLoading, setItemLoaded, setItemError]);

  // Batch loading for multiple items
  const loadItems = useCallback(async (itemIds, loadFunction, options = {}) => {
    const { staggerDelay = 0, priority = 'normal' } = options;

    itemIds.forEach((itemId, index) => {
      const delay = staggerDelay * index;
      queueLoad(itemId, loadFunction, { priority, delay });
    });
  }, [queueLoad]);

  // Load single item
  const loadItem = useCallback(async (itemId, loadFunction, options = {}) => {
    queueLoad(itemId, loadFunction, options);
  }, [queueLoad]);

  // Retry failed items
  const retryItem = useCallback((itemId, loadFunction) => {
    setErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
    loadItem(itemId, loadFunction, { priority: 'high' });
  }, [loadItem]);

  // Clear all data
  const reset = useCallback(() => {
    setLoadingStates(new Map());
    setLoadedItems(new Map());
    setErrors(new Map());
    setCurrentlyLoading(null);
    setProgress({ loaded: 0, total: 0 });
    loadingQueue.current = [];
    isProcessing.current = false;
  }, []);

  // Get loading statistics
  const getStats = useCallback(() => {
    return {
      totalItems: initialItems.length,
      loadedCount: loadedItems.size,
      loadingCount: loadingStates.size,
      errorCount: errors.size,
      queuedCount: loadingQueue.current.length,
      progressPercentage: initialItems.length > 0 
        ? Math.round((loadedItems.size / initialItems.length) * 100) 
        : 0,
      isComplete: loadedItems.size === initialItems.length && initialItems.length > 0,
      hasErrors: errors.size > 0,
      isLoading: loadingStates.size > 0 || loadingQueue.current.length > 0
    };
  }, [initialItems.length, loadedItems.size, loadingStates.size, errors.size]);

  return {
    // State
    loadingStates,
    loadedItems,
    errors,
    currentlyLoading,
    progress,

    // Actions
    loadItem,
    loadItems,
    retryItem,
    reset,

    // Getters
    isItemLoading,
    isItemLoaded,
    getItemData,
    getItemError,
    hasItemError,
    getStats,

    // Computed values
    stats: getStats()
  };
};

/**
 * Simplified hook for basic progressive loading scenarios
 */
export const useSimpleProgressiveLoading = () => {
  const [loadedItems, setLoadedItems] = useState(new Set());
  const [loadingItems, setLoadingItems] = useState(new Set());
  const [errors, setErrors] = useState(new Map());

  const startLoading = useCallback((itemId) => {
    setLoadingItems(prev => new Set(prev).add(itemId));
    setErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
  }, []);

  const finishLoading = useCallback((itemId, success = true, error = null) => {
    setLoadingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });

    if (success) {
      setLoadedItems(prev => new Set(prev).add(itemId));
    } else if (error) {
      setErrors(prev => new Map(prev).set(itemId, error));
    }
  }, []);

  const isLoading = useCallback((itemId) => loadingItems.has(itemId), [loadingItems]);
  const isLoaded = useCallback((itemId) => loadedItems.has(itemId), [loadedItems]);
  const hasError = useCallback((itemId) => errors.has(itemId), [errors]);
  const getError = useCallback((itemId) => errors.get(itemId), [errors]);

  const reset = useCallback(() => {
    setLoadedItems(new Set());
    setLoadingItems(new Set());
    setErrors(new Map());
  }, []);

  return {
    startLoading,
    finishLoading,
    isLoading,
    isLoaded,
    hasError,
    getError,
    reset,
    loadedCount: loadedItems.size,
    loadingCount: loadingItems.size,
    errorCount: errors.size
  };
};

export default useProgressiveLoading;
