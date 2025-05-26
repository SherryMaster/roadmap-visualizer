import "./App.css";
import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";
import { TooltipProvider } from "./context/TooltipContext";
import GlobalTooltip from "./components/GlobalTooltip";

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AppRouter />
        <GlobalTooltip />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
