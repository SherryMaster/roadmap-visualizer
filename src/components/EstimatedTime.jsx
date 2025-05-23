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
    <div className="space-y-1">
      <div className="flex items-center">
        <svg
          className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Estimated time: <span className="font-medium">{displayText}</span>
        </span>
      </div>

      {showFactors && timeData.factors && timeData.factors.length > 0 && (
        <div className="text-xs text-gray-600 dark:text-gray-400 ml-7">
          <strong>Factors affecting time:</strong> {timeData.factors.join(", ")}
        </div>
      )}
    </div>
  );
};

export default EstimatedTime;
