import Tooltip from "../tooltips/Tooltip";

const PrivacyIndicator = ({ isPublic, size = "sm", showLabel = false, className = "" }) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4", 
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const iconSize = sizeClasses[size] || sizeClasses.sm;

  const PrivateIcon = () => (
    <svg
      className={`${iconSize} text-gray-600 dark:text-gray-400`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );

  const PublicIcon = () => (
    <svg
      className={`${iconSize} text-green-600 dark:text-green-400`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const tooltipContent = isPublic 
    ? "Public roadmap - visible to everyone and appears in public listings"
    : "Private roadmap - only visible to you";

  const labelText = isPublic ? "Public" : "Private";
  const labelClasses = isPublic 
    ? "text-green-600 dark:text-green-400" 
    : "text-gray-600 dark:text-gray-400";

  return (
    <Tooltip content={tooltipContent} position="top" maxWidth="250px">
      <div className={`flex items-center space-x-1 ${className}`}>
        {isPublic ? <PublicIcon /> : <PrivateIcon />}
        {showLabel && (
          <span className={`text-xs font-medium ${labelClasses}`}>
            {labelText}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default PrivacyIndicator;
