import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ThemeProvider from "@/components/ThemeProvider";
import { BackendStatusBanner } from "@/components/BackendStatusBanner";
import { useBackendHealth } from "@/hooks/useBackendHealth";
import Landing from "./pages/Landing";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/account" element={<Account />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const { status } = useBackendHealth();

  if (status === "unknown") {
    return null;
  }

  if (status === "offline") {
    return <BackendStatusBanner />;
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
