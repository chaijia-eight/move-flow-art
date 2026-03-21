import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { themes, type OpeningTheme } from "@/data/openings";

interface ThemeContextType {
  currentTheme: OpeningTheme;
  setTheme: (themeId: string) => void;
  themeId: string;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes.italian,
  setTheme: () => {},
  themeId: "italian",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState("italian");
  const currentTheme = themes[themeId] || themes.italian;

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: setThemeId, themeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
