import { useTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
  const { themePreference, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();

  const options = [
    {
      value: 'light',
      label: 'Light',
      icon: '☀️',
      onClick: setLightTheme,
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: '🌙',
      onClick: setDarkTheme,
    },
    {
      value: 'system',
      label: 'System',
      icon: '💻',
      onClick: setSystemTheme,
    },
  ];

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={option.onClick}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${
              themePreference === option.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }
          `}
          aria-label={`Switch to ${option.label.toLowerCase()} theme`}
        >
          <span className="text-base" role="img" aria-hidden="true">
            {option.icon}
          </span>
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
