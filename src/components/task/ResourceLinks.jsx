const ResourceLinks = ({
  links,
  resource_links,
  showType = false,
  groupByType = false,
  highlightEssential = true,
}) => {
  // Handle both old format (links) and new format (resource_links)
  const resourceData = resource_links || links;

  if (!resourceData || resourceData.length === 0) {
    return null;
  }

  // Get icon for resource type
  const getTypeIcon = (type) => {
    switch (type) {
      case "video":
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case "document":
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "tool":
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        );
    }
  };

  // Group resources by type if requested
  const organizedLinks = groupByType
    ? resourceData.reduce((groups, link) => {
        const type = link.type || "other";
        if (!groups[type]) groups[type] = [];
        groups[type].push(link);
        return groups;
      }, {})
    : { all: resourceData };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Resources
      </h4>

      {Object.entries(organizedLinks).map(([groupName, groupLinks]) => (
        <div key={groupName} className="mb-3">
          {groupByType && groupName !== "all" && (
            <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
              {groupName}s
            </h5>
          )}

          <ul className="space-y-2">
            {groupLinks.map((link, index) => (
              <li key={index} className="flex items-start">
                <div className="flex items-center mr-2 flex-shrink-0 mt-0.5">
                  {showType && link.type ? (
                    <span className="text-blue-500">
                      {getTypeIcon(link.type)}
                    </span>
                  ) : (
                    <svg
                      className="h-4 w-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <a
                    href={link.url || link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors ${
                      highlightEssential && link.is_essential
                        ? "font-semibold"
                        : ""
                    }`}
                  >
                    {link.display_text}
                  </a>

                  {highlightEssential && link.is_essential && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-1.5 py-0.5 rounded">
                      Essential
                    </span>
                  )}

                  {showType && link.type && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {link.type}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ResourceLinks;
