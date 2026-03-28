import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sprout, BookOpen, Info, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            aria-label={item.label}
          >
            <Icon className="w-[18px] h-[18px]" />
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
      <aside className="w-[60px] border-r border-border flex flex-col items-center py-4 shrink-0 sticky top-0 h-screen z-50">
        {/* Logo */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 hover:bg-secondary transition-colors"
              aria-label="Dashboard"
            >
              <span className="text-lg font-bold text-foreground tracking-tighter">A</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Dashboard
          </TooltipContent>
        </Tooltip>

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
