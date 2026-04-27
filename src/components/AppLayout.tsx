import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sprout, BookOpen, Info, Settings, Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSubscription } from "@/contexts/SubscriptionContext";

const navItems = [
  { icon: Sprout, label: "Garden", path: "/garden" },
  { icon: BookOpen, label: "Bookshelf", path: "/bookshelf" },
];

const bottomItems = [
  { icon: Info, label: "About", path: "/about" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPro } = useSubscription();

  const renderNavButton = (item: { icon: React.ElementType; label: string; path: string }) => {
    const Icon = item.icon;
    const isActive = location.pathname.startsWith(item.path);

    return (
      <Tooltip key={item.path} delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={() => navigate(item.path)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isActive
                ? isPro
                  ? "bg-[hsl(42,90%,60%)]/15 text-[hsl(42,90%,60%)]"
                  : "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            aria-label={item.label}
          >
            <Icon className="w-[18px] h-[18px] depth-icon" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Sidebar */}
      <aside
        className={`w-[60px] border-r flex flex-col items-center py-4 shrink-0 sticky top-0 h-screen z-50 transition-all depth-sidebar ${
          isPro ? "border-r-[hsl(42,90%,60%)]/20" : "border-border"
        }`}
        style={isPro ? { boxShadow: "inset -1px 0 0 hsl(42 90% 60% / 0.15), 4px 0 16px hsl(0 0% 0% / 0.15), 8px 0 32px hsl(0 0% 0% / 0.08)" } : undefined}
      >
        {/* Logo */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              onClick={() => navigate("/")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary transition-all ${
                isPro ? "premium-glow" : ""
              }`}
              aria-label="Dashboard"
            >
              <img src="/favicon.png" alt="ArcChess" className="w-9 h-9 depth-logo" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Dashboard
          </TooltipContent>
        </Tooltip>

        {/* Pro crown indicator */}
        {isPro && (
          <div className="mt-1 mb-4">
            <Crown className="w-3.5 h-3.5 text-[hsl(42,90%,60%)] depth-icon" />
          </div>
        )}
        {!isPro && <div className="mb-6" />}

        {/* Main nav */}
        <nav className="flex flex-col items-center gap-1">
          {navItems.map(renderNavButton)}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom nav */}
        <nav className="flex flex-col items-center gap-1">
          {bottomItems.map(renderNavButton)}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
