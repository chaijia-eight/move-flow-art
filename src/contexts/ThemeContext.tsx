import React, { createContext, useContext, useState, ReactNode } from "react";
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

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: setThemeId, themeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
