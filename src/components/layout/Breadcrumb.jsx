import { Link, useParams } from "react-router-dom";
import Tooltip from "../tooltips/Tooltip";

const Breadcrumb = ({ roadmapTitle, currentPhase, isEditing = false }) => {
  const { roadmapId, phaseId } = useParams();

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
      tooltip: "Return to homepage and roadmap collection",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: roadmapTitle || "Roadmap",
      href: `/roadmap/${roadmapId}`,
      tooltip: "Return to roadmap overview and phase list",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  // Add phase breadcrumb if we're viewing a specific phase
  if (phaseId && currentPhase) {
    breadcrumbItems.push({
      label: currentPhase.phase_title || `Phase ${currentPhase.phase_number}`,
      href: `/roadmap/${roadmapId}/phase/${phaseId}`,
      tooltip: `Current phase: ${
        currentPhase.phase_title || `Phase ${currentPhase.phase_number}`
      }`,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      current: !isEditing,
    });
  }

  // Add editing breadcrumb if we're in edit mode
  if (isEditing) {
    breadcrumbItems.push({
      label: "Edit Mode",
      href: `/roadmap/${roadmapId}/edit`,
      tooltip: "Currently editing this roadmap",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      current: true,
    });
  }

  return (
    <nav className="flex mb-4 sm:mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex flex-wrap items-center gap-1 sm:gap-1 md:gap-3">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}

            {item.current ? (
              <Tooltip
                content={item.tooltip}
                position="bottom"
                maxWidth="250px"
              >
                <span className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  <span className="w-3 h-3 sm:w-4 sm:h-4">{item.icon}</span>
                  <span className="ml-1 md:ml-2">{item.label}</span>
                </span>
              </Tooltip>
            ) : (
              <Tooltip
                content={item.tooltip}
                position="bottom"
                maxWidth="250px"
              >
                <Link
                  to={item.href}
                  className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="w-3 h-3 sm:w-4 sm:h-4">{item.icon}</span>
                  <span className="ml-1 md:ml-2">{item.label}</span>
                </Link>
              </Tooltip>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
