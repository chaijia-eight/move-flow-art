const SETTINGS_KEY = "chess-app-settings";

export interface AppSettings {
  soundEnabled: boolean;
  boardThemeFollowOpening: boolean; // true = use opening theme, false = use default
  darkMode: boolean;
}

const defaults: AppSettings = {
  soundEnabled: true,
  boardThemeFollowOpening: true,
  darkMode: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function isSoundEnabled(): boolean {
  return loadSettings().soundEnabled;
}
