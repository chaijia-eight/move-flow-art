import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import AppLayout from "./components/AppLayout";
import ForgeHub from "./pages/ForgeHub";
import DailyRitual from "./pages/DailyRitual";
import PillarView from "./pages/PillarView";
import TrialBattle from "./pages/TrialBattle";
import Developments from "./pages/Developments";
import Gauntlet from "./pages/Gauntlet";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Connect from "./pages/Connect";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

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
                      <Route path="/" element={<ForgeHub />} />
                      <Route path="/ritual" element={<DailyRitual />} />
                      <Route path="/developments" element={<Developments />} />
                      <Route path="/pillar/:pillarId" element={<PillarView />} />
                      <Route path="/trial/:pillarId/:floorNum" element={<TrialBattle />} />
                      <Route path="/stats" element={<Stats />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/connect" element={<Connect />} />
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
