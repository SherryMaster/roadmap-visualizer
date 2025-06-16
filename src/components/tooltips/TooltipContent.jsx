/**
 * Professional Tooltip Content Components
 * Provides pre-built content layouts for common tooltip use cases
 */

// Basic tooltip content with title and description
export const BasicTooltipContent = ({ title, description, icon }) => (
  <div className="space-y-2">
    {icon && (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        {title && <span className="font-semibold text-gray-900 dark:text-gray-100">{title}</span>}
      </div>
    )}
    {!icon && title && (
      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</div>
    )}
    {description && (
      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </div>
    )}
  </div>
);

// Rich tooltip content with multiple sections
export const RichTooltipContent = ({ 
  title, 
  description, 
  sections = [], 
  footer,
  icon,
  badge 
}) => (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
        <div>
          {title && (
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {badge && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 flex-shrink-0">
          {badge}
        </span>
      )}
    </div>

    {/* Sections */}
    {sections.length > 0 && (
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={index} className="border-t border-gray-200 dark:border-gray-700 pt-3 first:border-t-0 first:pt-0">
            {section.title && (
              <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-2">
                {section.title}
              </h5>
            )}
            {section.content && (
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {section.content}
              </div>
            )}
            {section.items && (
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mt-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-2">
                    <span className="text-gray-400 dark:text-gray-500 mt-1">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Footer */}
    {footer && (
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {footer}
        </div>
      </div>
    )}
  </div>
);

// Status tooltip content with colored indicators
export const StatusTooltipContent = ({ 
  status, 
  message, 
  details,
  timestamp 
}) => {
  const getStatusStyles = (status) => {
    const styles = {
      success: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
      warning: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
      error: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
      info: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
      neutral: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700",
    };
    return styles[status] || styles.neutral;
  };

  const getStatusIcon = (status) => {
    const icons = {
      success: "✓",
      warning: "⚠",
      error: "✕",
      info: "ℹ",
      neutral: "•",
    };
    return icons[status] || icons.neutral;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getStatusStyles(status)}`}>
          {getStatusIcon(status)}
        </span>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {message}
          </div>
          {timestamp && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {timestamp}
            </div>
          )}
        </div>
      </div>
      
      {details && (
        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-9">
          {details}
        </div>
      )}
    </div>
  );
};

// Keyboard shortcut tooltip content
export const ShortcutTooltipContent = ({ 
  action, 
  shortcuts = [], 
  description 
}) => (
  <div className="space-y-2">
    <div className="font-medium text-gray-900 dark:text-gray-100">
      {action}
    </div>
    
    {shortcuts.length > 0 && (
      <div className="flex items-center space-x-1">
        {shortcuts.map((key, index) => (
          <span key={index} className="inline-flex items-center">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              {key}
            </kbd>
            {index < shortcuts.length - 1 && (
              <span className="mx-1 text-gray-400 dark:text-gray-500">+</span>
            )}
          </span>
        ))}
      </div>
    )}
    
    {description && (
      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </div>
    )}
  </div>
);

// Progress tooltip content
export const ProgressTooltipContent = ({ 
  label, 
  current, 
  total, 
  percentage,
  details 
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
        {percentage !== undefined ? `${percentage}%` : `${current}/${total}`}
      </span>
    </div>
    
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage || (current / total) * 100}%` }}
      />
    </div>
    
    {details && (
      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {details}
      </div>
    )}
  </div>
);

export default {
  BasicTooltipContent,
  RichTooltipContent,
  StatusTooltipContent,
  ShortcutTooltipContent,
  ProgressTooltipContent,
};
