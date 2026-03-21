export type MoveCategory = "main_line" | "legit_alternative" | "mistake";

export interface OpeningNode {
  fen: string;
  move: string; // SAN
  category: MoveCategory;
  variationName?: string;
  explanation?: string;
  suggestedMove?: string;
  children: OpeningNode[];
}

export interface OpeningTheme {
  id: string;
  boardLight: string;
  boardDark: string;
  pieceLight: string;
  pieceDark: string;
  primaryColor: string;
  primaryLight: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  textureName: string;
  ambientDescription: string;
  cssVars: Record<string, string>;
}

export interface Opening {
  id: string;
  name: string;
  family: string;
  description: string;
  themeId: string;
  startingFen: string;
  tree: OpeningNode[];
  totalVariations: number;
}

export const themes: Record<string, OpeningTheme> = {
  italian: {
    id: "italian",
  boardLight: "hsl(40, 30%, 88%)",
    boardDark: "hsl(25, 18%, 48%)",
    pieceLight: "hsl(38, 50%, 65%)",
    pieceDark: "hsl(30, 15%, 25%)",
    primaryColor: "hsl(345, 45%, 35%)",
    primaryLight: "hsl(345, 40%, 50%)",
    secondaryColor: "hsl(38, 70%, 55%)",
    accentColor: "hsl(38, 80%, 65%)",
    glowColor: "hsl(38, 80%, 60%)",
    textureName: "marble",
    ambientDescription: "Renaissance scrollwork, warm vignette",
    cssVars: {
      "--theme-primary": "345 45% 35%",
      "--theme-primary-light": "345 40% 50%",
      "--theme-secondary": "38 70% 55%",
      "--theme-accent": "38 80% 65%",
      "--theme-board-light": "35 25% 82%",
      "--theme-board-dark": "30 10% 55%",
      "--theme-glow": "38 80% 60%",
    },
  },
  sicilian: {
    id: "sicilian",
    boardLight: "hsl(0, 0%, 25%)",
    boardDark: "hsl(0, 0%, 15%)",
    pieceLight: "hsl(0, 0%, 60%)",
    pieceDark: "hsl(0, 0%, 20%)",
    primaryColor: "hsl(0, 70%, 45%)",
    primaryLight: "hsl(0, 65%, 55%)",
    secondaryColor: "hsl(0, 50%, 35%)",
    accentColor: "hsl(0, 80%, 55%)",
    glowColor: "hsl(0, 80%, 50%)",
    textureName: "obsidian",
    ambientDescription: "Volcanic texture, lava glow beneath edges",
    cssVars: {
      "--theme-primary": "0 70% 45%",
      "--theme-primary-light": "0 65% 55%",
      "--theme-secondary": "0 50% 35%",
      "--theme-accent": "0 80% 55%",
      "--theme-board-light": "0 0% 30%",
      "--theme-board-dark": "0 0% 18%",
      "--theme-glow": "0 80% 50%",
    },
  },
  queensgambit: {
    id: "queensgambit",
    boardLight: "hsl(30, 30%, 55%)",
    boardDark: "hsl(25, 25%, 30%)",
    pieceLight: "hsl(30, 20%, 50%)",
    pieceDark: "hsl(25, 30%, 15%)",
    primaryColor: "hsl(150, 30%, 30%)",
    primaryLight: "hsl(150, 25%, 40%)",
    secondaryColor: "hsl(30, 35%, 45%)",
    accentColor: "hsl(150, 35%, 45%)",
    glowColor: "hsl(150, 40%, 40%)",
    textureName: "wood",
    ambientDescription: "Tooled leather borders, subtle stitching",
    cssVars: {
      "--theme-primary": "150 30% 30%",
      "--theme-primary-light": "150 25% 40%",
      "--theme-secondary": "30 35% 45%",
      "--theme-accent": "150 35% 45%",
      "--theme-board-light": "30 30% 55%",
      "--theme-board-dark": "25 25% 30%",
      "--theme-glow": "150 40% 40%",
    },
  },
  kingsindian: {
    id: "kingsindian",
    boardLight: "hsl(35, 20%, 60%)",
    boardDark: "hsl(30, 15%, 35%)",
    pieceLight: "hsl(30, 40%, 55%)",
    pieceDark: "hsl(25, 20%, 20%)",
    primaryColor: "hsl(15, 55%, 45%)",
    primaryLight: "hsl(15, 50%, 55%)",
    secondaryColor: "hsl(35, 30%, 50%)",
    accentColor: "hsl(230, 40% ,45%)",
    glowColor: "hsl(15, 60%, 50%)",
    textureName: "woven",
    ambientDescription: "Woven textile patterns, warm earth tones",
    cssVars: {
      "--theme-primary": "15 55% 45%",
      "--theme-primary-light": "15 50% 55%",
      "--theme-secondary": "35 30% 50%",
      "--theme-accent": "230 40% 45%",
      "--theme-board-light": "35 20% 60%",
      "--theme-board-dark": "30 15% 35%",
      "--theme-glow": "15 60% 50%",
    },
  },
  french: {
    id: "french",
    boardLight: "hsl(40, 15%, 75%)",
    boardDark: "hsl(220, 10%, 50%)",
    pieceLight: "hsl(0, 0%, 65%)",
    pieceDark: "hsl(220, 10%, 30%)",
    primaryColor: "hsl(270, 25%, 55%)",
    primaryLight: "hsl(270, 20%, 65%)",
    secondaryColor: "hsl(220, 15%, 50%)",
    accentColor: "hsl(270, 30%, 60%)",
    glowColor: "hsl(270, 30%, 55%)",
    textureName: "limestone",
    ambientDescription: "Art nouveau flourishes, soft diffused lighting",
    cssVars: {
      "--theme-primary": "270 25% 55%",
      "--theme-primary-light": "270 20% 65%",
      "--theme-secondary": "220 15% 50%",
      "--theme-accent": "270 30% 60%",
      "--theme-board-light": "40 15% 75%",
      "--theme-board-dark": "220 10% 50%",
      "--theme-glow": "270 30% 55%",
    },
  },
  carokann: {
    id: "carokann",
    boardLight: "hsl(15, 30%, 45%)",
    boardDark: "hsl(10, 25%, 25%)",
    pieceLight: "hsl(25, 60%, 55%)",
    pieceDark: "hsl(15, 30%, 18%)",
    primaryColor: "hsl(20, 70%, 50%)",
    primaryLight: "hsl(20, 65%, 60%)",
    secondaryColor: "hsl(35, 25%, 75%)",
    accentColor: "hsl(25, 75%, 55%)",
    glowColor: "hsl(25, 70%, 50%)",
    textureName: "mahogany",
    ambientDescription: "Industrial chic meets classic, warm metallic accents",
    cssVars: {
      "--theme-primary": "20 70% 50%",
      "--theme-primary-light": "20 65% 60%",
      "--theme-secondary": "35 25% 75%",
      "--theme-accent": "25 75% 55%",
      "--theme-board-light": "15 30% 45%",
      "--theme-board-dark": "10 25% 25%",
      "--theme-glow": "25 70% 50%",
    },
  },
};

// Italian Game decision tree - comprehensive
export const italianGameTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4",
    category: "main_line",
    children: [
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
        move: "e5",
        category: "main_line",
        children: [
          {
            fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
            move: "Nf3",
            category: "main_line",
            children: [
              {
                fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                move: "Nc6",
                category: "main_line",
                children: [
                  {
                    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                    move: "Bc4",
                    category: "main_line",
                    children: [
                      {
                        fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
                        move: "Bc5",
                        category: "main_line",
                        variationName: "Giuoco Piano",
                        children: [
                          {
                            fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4",
                            move: "c3",
                            category: "main_line",
                            children: [],
                          },
                          {
                            fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq d3 0 4",
                            move: "d4",
                            category: "legit_alternative",
                            variationName: "Italian Gambit",
                            children: [],
                          },
                        ],
                      },
                      {
                        fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
                        move: "Nf6",
                        category: "legit_alternative",
                        variationName: "Two Knights Defense",
                        children: [
                          {
                            fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
                            move: "Ng5",
                            category: "main_line",
                            children: [],
                          },
                        ],
                      },
                      {
                        fen: "r1bqkbnr/pppp1pp1/2n4p/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
                        move: "h6",
                        category: "mistake",
                        explanation: "h6 wastes a tempo. In the opening, you should focus on developing pieces and controlling the center, not making pawn moves on the wing.",
                        suggestedMove: "Bc5",
                        children: [],
                      },
                      {
                        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
                        move: "a6",
                        category: "mistake",
                        explanation: "a6 is too slow here. You should develop a piece like Bc5 or Nf6 to contest the center.",
                        suggestedMove: "Bc5",
                        children: [],
                      },
                    ],
                  },
                  {
                    fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                    move: "Bb5",
                    category: "legit_alternative",
                    variationName: "Ruy López",
                    children: [],
                  },
                ],
              },
              {
                fen: "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                move: "Nf6",
                category: "legit_alternative",
                variationName: "Petrov's Defense",
                children: [],
              },
              {
                fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
                move: "a6",
                category: "mistake",
                explanation: "a6 doesn't develop a piece or control the center. Nc6 defends e5 and develops a knight to its ideal square.",
                suggestedMove: "Nc6",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const openings: Opening[] = [
  {
    id: "italian-game",
    name: "Italian Game",
    family: "Italian",
    description: "A classical opening that develops the bishop to c4, targeting the vulnerable f7 square. Leads to rich tactical and strategic play.",
    themeId: "italian",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tree: italianGameTree,
    totalVariations: 4,
  },
  {
    id: "sicilian-defense",
    name: "Sicilian Defense",
    family: "Sicilian",
    description: "The most popular response to 1.e4. Black fights for the center asymmetrically, leading to sharp, complex positions.",
    themeId: "sicilian",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tree: [],
    totalVariations: 8,
  },
  {
    id: "queens-gambit",
    name: "Queen's Gambit",
    family: "Queen's Gambit",
    description: "White offers a pawn to gain central control. A sophisticated opening with deep strategic themes.",
    themeId: "queensgambit",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tree: [],
    totalVariations: 6,
  },
  {
    id: "kings-indian",
    name: "King's Indian Defense",
    family: "King's Indian",
    description: "A hypermodern defense where Black lets White build a pawn center, planning to strike back later.",
    themeId: "kingsindian",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tree: [],
    totalVariations: 5,
  },
  {
    id: "french-defense",
    name: "French Defense",
    family: "French",
    description: "A solid defense creating a pawn chain. Black aims for a counterattack on White's center.",
    themeId: "french",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tree: [],
    totalVariations: 5,
  },
  {
    id: "caro-kann",
    name: "Caro-Kann Defense",
    family: "Caro-Kann",
    description: "A reliable defense that develops solidly while maintaining a flexible pawn structure.",
    themeId: "carokann",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tree: [],
    totalVariations: 4,
  },
];
