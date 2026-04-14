import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index.tsx";
import Decks from "./pages/Decks.tsx";
import Connect from "./pages/Connect.tsx";
import Stats from "./pages/Stats.tsx";
import Settings from "./pages/Settings.tsx";
import About from "./pages/About.tsx";
import NotFound from "./pages/NotFound.tsx";
import RepertoireBuilder from "./pages/RepertoireBuilder.tsx";
import RepertoireStudy from "./pages/RepertoireStudy.tsx";
import Auth from "./pages/Auth.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/decks" element={<Decks />} />
                      <Route path="/decks/build" element={<RepertoireBuilder />} />
                      <Route path="/decks/build/:repertoireId" element={<RepertoireBuilder />} />
                      <Route path="/decks/study/:repertoireId" element={<RepertoireStudy />} />
                      <Route path="/connect" element={<Connect />} />
                      <Route path="/stats" element={<Stats />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/about" element={<About />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
