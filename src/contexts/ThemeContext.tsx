import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { themes, type OpeningTheme } from "@/data/openings";
import { loadSettings } from "@/lib/settingsStore";

interface ThemeContextType {
  currentTheme: OpeningTheme;
  setTheme: (themeId: string) => void;
  themeId: string;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  boardThemeFollowOpening: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes.italian,
  setTheme: () => {},
  themeId: "italian",
  darkMode: true,
  setDarkMode: () => {},
  boardThemeFollowOpening: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const settings = loadSettings();
  const [themeId, setThemeId] = useState("italian");
  const [darkMode, setDarkModeState] = useState(settings.darkMode);
  const [boardThemeFollowOpening] = useState(settings.boardThemeFollowOpening);

  // Apply dark/light class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
  }, [darkMode]);

  // Re-read settings on storage change (for cross-tab sync)
  useEffect(() => {
    const handler = () => {
      const s = loadSettings();
      setDarkModeState(s.darkMode);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const effectiveThemeId = boardThemeFollowOpening ? themeId : "italian";
  const currentTheme = themes[effectiveThemeId] || themes.italian;

  const setDarkMode = (dark: boolean) => {
    setDarkModeState(dark);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: setThemeId, themeId: effectiveThemeId, darkMode, setDarkMode, boardThemeFollowOpening }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
