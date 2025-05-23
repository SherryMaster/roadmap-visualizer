import "./App.css";
import RoadmapVisualizer from "./components/RoadmapVisualizer";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <RoadmapVisualizer />
      </div>
    </ThemeProvider>
  );
}

export default App;
