import { useTheme } from "../context/ThemeContext";
import Tooltip from "./Tooltip";

const ThemeSelector = () => {
  const { themePreference, setLightTheme, setDarkTheme, setSystemTheme } =
    useTheme();

  const options = [
    {
      value: "light",
      label: "Light",
      icon: "☀️",
      onClick: setLightTheme,
      tooltip:
        "Switch to light theme for better visibility in bright environments",
    },
    {
      value: "dark",
      label: "Dark",
      icon: "🌙",
      onClick: setDarkTheme,
      tooltip:
        "Switch to dark theme to reduce eye strain in low-light conditions",
    },
    {
      value: "system",
      label: "System",
      icon: "💻",
      onClick: setSystemTheme,
      tooltip: "Automatically match your system theme preference",
    },
  ];

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
      {options.map((option) => (
        <Tooltip
          key={option.value}
          content={option.tooltip}
          position="bottom"
          maxWidth="300px"
        >
          <button
            onClick={option.onClick}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                themePreference === option.value
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }
            `}
            aria-label={`Switch to ${option.label.toLowerCase()} theme`}
          >
            <span className="text-base" role="img" aria-hidden="true">
              {option.icon}
            </span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default ThemeSelector;
