import { useEffect } from 'react';

/**
 * Custom hook to update the page title
 * @param {string} title - The title to set
 * @param {string} suffix - Optional suffix (defaults to "Roadmap Visualizer")
 */
const usePageTitle = (title, suffix = "Roadmap Visualizer") => {
  useEffect(() => {
    const previousTitle = document.title;
    
    if (title) {
      document.title = `${title} - ${suffix}`;
    } else {
      document.title = suffix;
    }

    // Cleanup function to restore previous title
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};

export default usePageTitle;
