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
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag, index) => {
        // Create unique key for tag
        const uniqueKey = `tag-${index}-${tag}`;

        return (
          <span
            key={uniqueKey}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              tagColors[index % tagColors.length]
            }`}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};

export default TagsList;
