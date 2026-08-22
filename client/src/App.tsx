import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import BatchesPage from "@/pages/BatchesPage";
import NotFound from "@/pages/NotFound";
import OperationsPage from "@/pages/OperationsPage";
import ReelsPage from "@/pages/ReelsPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const withDashboard = (Page: React.ComponentType) => () => <DashboardLayout><Page /></DashboardLayout>;
const OverviewRoute = withDashboard(Home);
const ReelsRoute = withDashboard(ReelsPage);
const BatchesRoute = withDashboard(BatchesPage);
const OperationsRoute = withDashboard(OperationsPage);

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={OverviewRoute} />
      <Route path={"/reels"} component={ReelsRoute} />
      <Route path={"/batches"} component={BatchesRoute} />
      <Route path={"/operations"} component={OperationsRoute} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
