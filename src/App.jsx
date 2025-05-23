import { useEffect } from "react";
import "./App.css";
import RoadmapVisualizer from "./components/RoadmapVisualizer";

function App() {
  // Set up dark mode on initial load
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // If no saved preference, check system preference
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <RoadmapVisualizer />
    </div>
  );
}

export default App;
