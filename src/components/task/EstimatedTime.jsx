const EstimatedTime = ({
  time,
  est_time,
  showRange = false,
  showFactors = false,
}) => {
  // Handle both old format (time) and new format (est_time)
  const timeData = est_time || time;

  if (!timeData) {
    return null;
  }

  // Format a single time value
  const formatTime = (timeObj) => {
    if (!timeObj || (!timeObj.value && !timeObj.amount) || !timeObj.unit) {
      return null;
    }

    const value = timeObj.value || timeObj.amount;
    const unit = timeObj.unit;

    // Handle pluralization
    const unitDisplay = value === 1 ? unit.slice(0, -1) : unit;

    return `${value} ${unitDisplay}`;
  };

  // Get display text for the time estimate
  const getTimeDisplay = () => {
    // If we have min/max range
    if (timeData.min && timeData.max && showRange) {
      const minText = formatTime(timeData.min);
      const maxText = formatTime(timeData.max);
      if (minText && maxText) {
        return `${minText} - ${maxText}`;
      }
    }

    // If we have just min time or primary time
    if (timeData.min) {
      return formatTime(timeData.min);
    }

    // Fallback to old format
    if (timeData.value && timeData.unit) {
      return formatTime(timeData);
    }

    return null;
  };

  const displayText = getTimeDisplay();

  if (!displayText) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Estimated Time
          </span>
        </div>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {displayText}
        </span>
      </div>

      {showFactors && timeData.factors && timeData.factors.length > 0 && (
        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md p-2 border-l-2 border-blue-300 dark:border-blue-600">
          <strong className="text-gray-700 dark:text-gray-300">
            Factors affecting time:
          </strong>
          <br />
          {timeData.factors.join(", ")}
        </div>
      )}
    </div>
  );
};

export default EstimatedTime;
