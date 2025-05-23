const OutcomesList = ({ outcomes }) => {
  if (!outcomes || outcomes.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Learning Outcomes
      </h4>
      <ul className="list-disc pl-5 space-y-1">
        {outcomes.map((outcome, index) => (
          <li key={index} className="text-gray-700 dark:text-gray-300">
            {outcome}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OutcomesList;
