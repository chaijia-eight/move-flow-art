import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Index from "./pages/Index.tsx";
import StudyHub from "./pages/StudyHub.tsx";
import Study from "./pages/Study.tsx";
import Settings from "./pages/Settings.tsx";
import About from "./pages/About.tsx";
import NotFound from "./pages/NotFound.tsx";
import Garden from "./pages/Garden.tsx";
import RepertoireBuilder from "./pages/RepertoireBuilder.tsx";
import RepertoireStudy from "./pages/RepertoireStudy.tsx";

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
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="/garden" element={<Garden />} />
              <Route path="/garden/build" element={<RepertoireBuilder />} />
              <Route path="/garden/build/:repertoireId" element={<RepertoireBuilder />} />
              <Route path="/garden/study/:repertoireId" element={<RepertoireStudy />} />
              <Route path="/study/:openingId" element={<StudyHub />} />
              <Route path="/study/:openingId/play" element={<Study />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
