import { useState } from "react";
import { useLocation } from "react-router-dom";
import Tooltip from "../tooltips/Tooltip";

const ShareButton = ({ roadmapTitle }) => {
  const [showCopied, setShowCopied] = useState(false);
  const location = useLocation();

  const handleShare = async () => {
    const url = window.location.origin + location.pathname;
    const shareData = {
      title: `${roadmapTitle} - Roadmap Visualizer`,
      text: `Check out this learning roadmap: ${roadmapTitle}`,
      url: url,
    };

    try {
      // Try to use the Web Share API if available
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      console.log(
        "Web Share API not supported or failed, falling back to clipboard"
      );
    }

    // Fallback to copying URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL to clipboard:", error);
      // Final fallback - show URL in a prompt
      prompt("Copy this URL to share:", url);
    }
  };

  return (
    <div className="relative">
      <Tooltip
        content="Share this roadmap URL with others or copy to clipboard"
        position="bottom"
        maxWidth="250px"
      >
        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 min-h-[44px] shadow-sm hover:shadow-md"
          aria-label="Share this roadmap"
        >
          <svg
            className="w-4 h-4 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
          <span>Share</span>
        </button>
      </Tooltip>

      {/* Copied notification */}
      {showCopied && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg shadow-lg z-50">
          URL copied!
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-green-600"></div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
