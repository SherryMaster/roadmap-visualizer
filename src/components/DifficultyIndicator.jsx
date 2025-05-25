const DifficultyIndicator = ({
  difficulty,
  level,
  showReason = false,
  showPrerequisites = false,
}) => {
  // Handle both old format (level) and new format (difficulty object)
  const difficultyData = difficulty || { level: level || 3 };

  // Extract level from difficulty object or use direct level
  let difficultyLevel;
  if (typeof difficultyData.level === "number") {
    difficultyLevel = difficultyData.level;
  } else if (typeof difficultyData.level === "string") {
    // Map string levels to numbers
    const levelMap = {
      very_easy: 1,
      easy: 2,
      normal: 3,
      moderate: 3,
      difficult: 4,
      challenging: 5,
      hard: 4,
      very_hard: 5,
    };
    difficultyLevel = levelMap[difficultyData.level] || 3;
  } else {
    difficultyLevel = level || 3;
  }

  // Ensure level is between 1 and 5
  difficultyLevel = Math.min(Math.max(1, difficultyLevel), 5);

  // Define colors and labels based on difficulty level
  const getColorClass = () => {
    switch (difficultyLevel) {
      case 1:
        return "bg-green-500";
      case 2:
        return "bg-green-400";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-orange-500";
      case 5:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTextColorClass = () => {
    switch (difficultyLevel) {
      case 1:
        return "text-green-600 dark:text-green-400";
      case 2:
        return "text-green-500 dark:text-green-400";
      case 3:
        return "text-yellow-600 dark:text-yellow-400";
      case 4:
        return "text-orange-600 dark:text-orange-400";
      case 5:
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getLabel = () => {
    // Use original text if available, otherwise map number to text
    if (difficultyData.level_text) {
      return difficultyData.level_text
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    switch (difficultyLevel) {
      case 1:
        return "Very Easy";
      case 2:
        return "Easy";
      case 3:
        return "Moderate";
      case 4:
        return "Hard";
      case 5:
        return "Very Hard";
      default:
        return "Unknown";
    }
  };

  // Create an array of 5 elements to represent the difficulty dots
  const dots = Array.from({ length: 5 }, (_, index) => index + 1);

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
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Difficulty
          </span>
        </div>
        <span className={`text-sm font-bold ${getTextColorClass()}`}>
          {getLabel()}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex space-x-1.5">
          {dots.map((dot) => (
            <div
              key={dot}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                dot <= difficultyLevel
                  ? getColorClass()
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {difficultyLevel}/5
        </span>
      </div>

      {showReason && difficultyData.reason && (
        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md p-2 border-l-2 border-gray-300 dark:border-gray-600">
          <strong className="text-gray-700 dark:text-gray-300">
            Why this difficulty:
          </strong>
          <br />
          {difficultyData.reason}
        </div>
      )}

      {showPrerequisites &&
        difficultyData.prerequisites &&
        difficultyData.prerequisites.length > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400 ml-6">
            <strong>Prerequisites:</strong>{" "}
            {difficultyData.prerequisites.join(", ")}
          </div>
        )}
    </div>
  );
};

export default DifficultyIndicator;
