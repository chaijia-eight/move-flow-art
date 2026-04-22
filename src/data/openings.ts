// Stub module retained during the Smart Feed pivot.
// Provides just enough types/values for the legacy Chessboard, FeedbackBanner,
// ThemeContext, etc. to compile while we rebuild the feed.

export type MoveCategory =
  | "main"
  | "alternative"
  | "mistake"
  | "trap"
  | "main_line"
  | "legit_alternative";

export interface CustomArrow {
  from: string;
  to: string;
  color: string;
}

export interface CustomHighlight {
  square: string;
  color: string;
}

export type NagSymbol = string;

export interface NagSymbolDef {
  key: string;
  icon: string;
  label: string;
}

export const NAG_SYMBOLS: NagSymbolDef[] = [];

export interface OpeningTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlightSquare: string;
  lastMoveSquare: string;
  accentColor: string;
  primaryColor: string;
  boardLight: string;
  boardDark: string;
}

const defaultTheme: OpeningTheme = {
  id: "italian",
  name: "Classic",
  lightSquare: "hsl(40, 35%, 85%)",
  darkSquare: "hsl(25, 30%, 45%)",
  highlightSquare: "hsl(50, 80%, 60%)",
  lastMoveSquare: "hsl(50, 80%, 60%)",
  accentColor: "hsl(45, 90%, 55%)",
  primaryColor: "hsl(45, 90%, 55%)",
  boardLight: "hsl(40, 35%, 85%)",
  boardDark: "hsl(25, 30%, 45%)",
};

export const themes: Record<string, OpeningTheme> = {
  italian: defaultTheme,
};
