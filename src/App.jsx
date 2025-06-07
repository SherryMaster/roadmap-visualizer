import "./App.css";
import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./context/ThemeContext";
import { TooltipProvider } from "./context/TooltipContext";
import { AuthProvider } from "./context/AuthContext";
import { FirestoreProvider } from "./context/FirestoreContext";
import GlobalTooltip from "./components/tooltips/GlobalTooltip";
import AuthGuard from "./components/auth/AuthGuard";
import ErrorBoundary from "./components/error/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGuard>
          <FirestoreProvider>
            <ThemeProvider>
              <TooltipProvider>
                <AppRouter />
                <GlobalTooltip />
              </TooltipProvider>
            </ThemeProvider>
          </FirestoreProvider>
        </AuthGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
