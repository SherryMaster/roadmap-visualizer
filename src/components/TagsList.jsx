const TagsList = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Define a set of colors to cycle through for tags
  const tagColors = [
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => {
        // Create unique key for tag
        const uniqueKey = `tag-${index}-${tag}`;

        return (
          <span
            key={uniqueKey}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 hover:opacity-80 ${
              tagColors[index % tagColors.length]
            } border border-opacity-20`}
          >
            <svg
              className="w-3 h-3 mr-1.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {tag}
          </span>
        );
      })}
    </div>
  );
};

export default TagsList;
