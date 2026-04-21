// Stub module retained during the Smart Feed pivot.
// The real opening catalogue was deleted; these types/values exist only so
// that the chessboard, theme system, and feedback banner continue to compile.
// They will be replaced or removed in later phases.

export type MoveCategory = "main" | "alternative" | "mistake" | "trap";

export interface CustomArrow {
  from: string;
  to: string;
  color: string;
}

export interface CustomHighlight {
  square: string;
  color: string;
}

export type NagSymbol = "!" | "!!" | "?" | "??" | "!?" | "?!";

export const NAG_SYMBOLS: NagSymbol[] = ["!", "!!", "?", "??", "!?", "?!"];

export interface OpeningTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlightSquare: string;
  lastMoveSquare: string;
}

const defaultTheme: OpeningTheme = {
  id: "italian",
  name: "Classic",
  lightSquare: "hsl(40, 35%, 85%)",
  darkSquare: "hsl(25, 30%, 45%)",
  highlightSquare: "hsl(50, 80%, 60%)",
  lastMoveSquare: "hsl(50, 80%, 60%)",
};

export const themes: Record<string, OpeningTheme> = {
  italian: defaultTheme,
};
