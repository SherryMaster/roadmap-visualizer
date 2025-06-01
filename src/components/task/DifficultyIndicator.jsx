import Tooltip from "../tooltips/Tooltip";

const DifficultyIndicator = ({
  difficulty,
  level,
  showReason = false,
  showPrerequisites = false,
  compact = false,
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
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex items-center space-x-2">
            {showReason && difficultyData.reason ? (
              <Tooltip
                content={
                  <div className="w-full">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-base border-b border-gray-200 dark:border-gray-600 pb-2">
                      Why this difficulty level?
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                      {difficultyData.reason}
                    </div>
                  </div>
                }
                position="bottom"
                maxWidth="600px"
              >
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-help hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Difficulty
                </span>
              </Tooltip>
            ) : (
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Difficulty
              </span>
            )}

            {showPrerequisites &&
              difficultyData.prerequisites &&
              difficultyData.prerequisites.length > 0 && (
                <Tooltip
                  content={
                    <div className="w-full">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-base border-b border-gray-200 dark:border-gray-600 pb-2">
                        Prerequisites
                      </div>
                      <div className="space-y-3">
                        {difficultyData.prerequisites.map((prereq, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex-1">
                              {prereq}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                  position="bottom"
                  maxWidth="550px"
                >
                  <svg
                    className="w-4 h-4 text-blue-500 dark:text-blue-400 cursor-help hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-3a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zM9 9a1 1 0 112 0 1 1 0 01-2 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Tooltip>
              )}
          </div>
        </div>
        <span className={`text-xs sm:text-sm font-bold ${getTextColorClass()}`}>
          {getLabel()}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex space-x-1 sm:space-x-1.5">
          {dots.map((dot) => (
            <div
              key={dot}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors duration-200 ${
                dot <= difficultyLevel
                  ? getColorClass()
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 sm:ml-2">
          {difficultyLevel}/5
        </span>
      </div>
    </div>
  );
};

export default DifficultyIndicator;
