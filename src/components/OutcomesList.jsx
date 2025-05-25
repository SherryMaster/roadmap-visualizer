const OutcomesList = ({ outcomes }) => {
  if (!outcomes || outcomes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
        <svg
          className="w-4 h-4 mr-2 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Learning Outcomes
      </h4>
      <ul className="space-y-3">
        {outcomes.map((outcome, index) => {
          // Create unique key for outcome
          const uniqueKey = `outcome-${index}-${outcome.slice(0, 20)}`;

          return (
            <li key={uniqueKey} className="flex items-start space-x-3">
              <svg
                className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {outcome}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OutcomesList;
