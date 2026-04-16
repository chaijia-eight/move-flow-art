import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Forge from "./pages/Forge";
import Campaigns from "./pages/Campaigns";
import CampaignDrill from "./pages/CampaignDrill";
import Oracle from "./pages/Oracle";
import OracleTrial from "./pages/OracleTrial";
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
                      <Route path="/" element={<Index />} />
                      <Route path="/forge" element={<Forge />} />
                      <Route path="/campaigns" element={<Campaigns />} />
                      <Route path="/campaigns/drill/:nodeId" element={<CampaignDrill />} />
                      <Route path="/oracle" element={<Oracle />} />
                      <Route path="/oracle/trial/:positionId" element={<OracleTrial />} />
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
