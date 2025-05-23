import { createContext, useState, useEffect, useContext } from "react";

// Create Theme Context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  // Theme can be 'light', 'dark', or 'system'
  const [themePreference, setThemePreference] = useState(() => {
    const savedTheme = localStorage.getItem("theme-preference");
    return savedTheme || "system";
  });

  // Computed dark mode state based on preference and system
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to get system preference
  const getSystemPreference = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  // Function to compute actual dark mode state
  const computeDarkMode = (preference) => {
    switch (preference) {
      case "light":
        return false;
      case "dark":
        return true;
      case "system":
        return getSystemPreference();
      default:
        return getSystemPreference();
    }
  };

  // Apply theme when preference changes or system preference changes
  useEffect(() => {
    const updateTheme = () => {
      const shouldBeDark = computeDarkMode(themePreference);
      setIsDarkMode(shouldBeDark);

      // Apply to DOM
      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Save preference to localStorage
      localStorage.setItem("theme-preference", themePreference);
    };

    updateTheme();

    // Listen for system theme changes (only matters when preference is 'system')
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (themePreference === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [themePreference]);

  // Functions to set specific theme preferences
  const setLightTheme = () => setThemePreference("light");
  const setDarkTheme = () => setThemePreference("dark");
  const setSystemTheme = () => setThemePreference("system");

  // Legacy toggle function for backward compatibility
  const toggleTheme = () => {
    if (themePreference === "light") {
      setDarkTheme();
    } else {
      setLightTheme();
    }
  };

  const value = {
    // Current state
    themePreference,
    isDarkMode,
    darkMode: isDarkMode, // Legacy compatibility
    theme: isDarkMode ? "dark" : "light",

    // Theme setters
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    setThemePreference,

    // Legacy toggle
    toggleTheme,

    // System preference info
    systemPreference: getSystemPreference() ? "dark" : "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
