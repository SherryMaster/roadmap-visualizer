import "./App.css";
import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";
import { TooltipProvider } from "./context/TooltipContext";
import { AuthProvider } from "./context/AuthContext";
import GlobalTooltip from "./components/tooltips/GlobalTooltip";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <AppRouter />
          <GlobalTooltip />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
