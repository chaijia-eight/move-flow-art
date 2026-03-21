export type MoveCategory = "main_line" | "legit_alternative" | "mistake";

export interface OpeningNode {
  fen: string;
  move: string;
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
  primarySide: "w" | "b"; // which side "plays" this opening
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
      "--theme-accent": "38 80% 65%",
    },
  },
  sicilian: {
    id: "sicilian",
    boardLight: "hsl(0, 0%, 28%)",
    boardDark: "hsl(0, 0%, 16%)",
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
      "--theme-accent": "0 80% 55%",
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
      "--theme-accent": "150 35% 45%",
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
    accentColor: "hsl(230, 40%, 45%)",
    glowColor: "hsl(15, 60%, 50%)",
    textureName: "woven",
    ambientDescription: "Woven textile patterns, warm earth tones",
    cssVars: {
      "--theme-primary": "15 55% 45%",
      "--theme-accent": "230 40% 45%",
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
      "--theme-accent": "270 30% 60%",
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
      "--theme-accent": "25 75% 55%",
    },
  },
};

// ============ ITALIAN GAME ============
const italianGameTree: OpeningNode[] = [
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
                            fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4",
                            move: "c3",
                            category: "main_line",
                            children: [
                              {
                                fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5",
                                move: "Nf6",
                                category: "main_line",
                                children: [
                                  {
                                    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq d3 0 5",
                                    move: "d4",
                                    category: "main_line",
                                    children: [],
                                  },
                                ],
                              },
                              {
                                fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4",
                                move: "d6",
                                category: "legit_alternative",
                                variationName: "Giuoco Pianissimo",
                                children: [],
                              },
                            ],
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
                            fen: "r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4",
                            move: "Ng5",
                            category: "main_line",
                            children: [
                              {
                                fen: "r1bqkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq d6 0 5",
                                move: "d5",
                                category: "main_line",
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        fen: "r1bqkbnr/pppp1pp1/2n4p/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
                        move: "h6",
                        category: "mistake",
                        explanation: "h6 wastes a tempo. Focus on developing pieces and controlling the center.",
                        suggestedMove: "Bc5",
                        children: [],
                      },
                      {
                        fen: "r1bqkbnr/1ppp1ppp/p1n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
                        move: "a6",
                        category: "mistake",
                        explanation: "a6 is too slow. Develop a piece like Bc5 or Nf6 to contest the center.",
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
                fen: "rnbqkbnr/1ppp1ppp/p7/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
                move: "a6",
                category: "mistake",
                explanation: "a6 doesn't develop a piece or control the center. Nc6 defends e5 and develops naturally.",
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

// ============ SICILIAN DEFENSE ============
const sicilianDefenseTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4",
    category: "main_line",
    children: [
      {
        fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
        move: "c5",
        category: "main_line",
        children: [
          {
            fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
            move: "Nf3",
            category: "main_line",
            children: [
              {
                fen: "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
                move: "d6",
                category: "main_line",
                children: [
                  {
                    fen: "rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3",
                    move: "d4",
                    category: "main_line",
                    children: [
                      {
                        fen: "rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
                        move: "cxd4",
                        category: "main_line",
                        children: [
                          {
                            fen: "rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4",
                            move: "Nxd4",
                            category: "main_line",
                            children: [
                              {
                                fen: "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5",
                                move: "Nf6",
                                category: "main_line",
                                children: [
                                  {
                                    fen: "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5",
                                    move: "Nc3",
                                    category: "main_line",
                                    children: [
                                      {
                                        fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
                                        move: "a6",
                                        category: "main_line",
                                        variationName: "Najdorf Variation",
                                        children: [],
                                      },
                                      {
                                        fen: "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
                                        move: "g6",
                                        category: "legit_alternative",
                                        variationName: "Dragon Variation",
                                        children: [],
                                      },
                                      {
                                        fen: "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 2 6",
                                        move: "Nc6",
                                        category: "legit_alternative",
                                        variationName: "Classical Variation",
                                        children: [],
                                      },
                                      {
                                        fen: "rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
                                        move: "e6",
                                        category: "legit_alternative",
                                        variationName: "Scheveningen Variation",
                                        children: [],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                fen: "r1bqkbnr/pp2pppp/2np4/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5",
                                move: "Nc6",
                                category: "legit_alternative",
                                variationName: "Classical Sicilian",
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                fen: "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                move: "Nc6",
                category: "legit_alternative",
                variationName: "Old Sicilian",
                children: [],
              },
              {
                fen: "rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
                move: "e6",
                category: "legit_alternative",
                variationName: "Kan / Taimanov Setup",
                children: [],
              },
              {
                fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
                move: "a6",
                category: "mistake",
                explanation: "a6 is too slow. You should develop with d6, Nc6, or e6 to contest the center.",
                suggestedMove: "d6",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

// ============ QUEEN'S GAMBIT ============
const queensGambitTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
    move: "d4",
    category: "main_line",
    children: [
      {
        fen: "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2",
        move: "d5",
        category: "main_line",
        children: [
          {
            fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
            move: "c4",
            category: "main_line",
            children: [
              {
                fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
                move: "e6",
                category: "main_line",
                variationName: "Queen's Gambit Declined",
                children: [
                  {
                    fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
                    move: "Nc3",
                    category: "main_line",
                    children: [
                      {
                        fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
                        move: "Nf6",
                        category: "main_line",
                        children: [
                          {
                            fen: "rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4",
                            move: "Bg5",
                            category: "main_line",
                            children: [
                              {
                                fen: "rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 4 5",
                                move: "Be7",
                                category: "main_line",
                                children: [],
                              },
                            ],
                          },
                          {
                            fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4",
                            move: "Nf3",
                            category: "legit_alternative",
                            variationName: "QGD Modern",
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
                move: "dxc4",
                category: "legit_alternative",
                variationName: "Queen's Gambit Accepted",
                children: [
                  {
                    fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3",
                    move: "Nf3",
                    category: "main_line",
                    children: [
                      {
                        fen: "rnbqkb1r/ppp1pppp/5n2/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4",
                        move: "Nf6",
                        category: "main_line",
                        children: [],
                      },
                    ],
                  },
                ],
              },
              {
                fen: "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
                move: "c6",
                category: "legit_alternative",
                variationName: "Slav Defense",
                children: [
                  {
                    fen: "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3",
                    move: "Nf3",
                    category: "main_line",
                    children: [
                      {
                        fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4",
                        move: "Nf6",
                        category: "main_line",
                        children: [],
                      },
                    ],
                  },
                ],
              },
              {
                fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
                move: "a6",
                category: "mistake",
                explanation: "a6 doesn't address the center. Respond with e6, dxc4, or c6 to fight for control.",
                suggestedMove: "e6",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

// ============ KING'S INDIAN DEFENSE ============
const kingsIndianTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
    move: "d4",
    category: "main_line",
    children: [
      {
        fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
        move: "Nf6",
        category: "main_line",
        children: [
          {
            fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
            move: "c4",
            category: "main_line",
            children: [
              {
                fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
                move: "g6",
                category: "main_line",
                children: [
                  {
                    fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
                    move: "Nc3",
                    category: "main_line",
                    children: [
                      {
                        fen: "rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
                        move: "Bg7",
                        category: "main_line",
                        children: [
                          {
                            fen: "rnbqk2r/ppppppbp/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 4",
                            move: "e4",
                            category: "main_line",
                            children: [
                              {
                                fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5",
                                move: "d6",
                                category: "main_line",
                                children: [
                                  {
                                    fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 5",
                                    move: "Nf3",
                                    category: "main_line",
                                    variationName: "Classical KID",
                                    children: [
                                      {
                                        fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 2 6",
                                        move: "O-O",
                                        category: "main_line",
                                        children: [
                                          {
                                            fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 3 6",
                                            move: "Be2",
                                            category: "main_line",
                                            children: [
                                              {
                                                fen: "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ e6 0 7",
                                                move: "e5",
                                                category: "main_line",
                                                variationName: "Classical Main Line",
                                                children: [],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                  {
                                    fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq - 0 5",
                                    move: "f3",
                                    category: "legit_alternative",
                                    variationName: "Sämisch Variation",
                                    children: [],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
                move: "e6",
                category: "legit_alternative",
                variationName: "Nimzo/QID Setup",
                children: [],
              },
              {
                fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
                move: "b6",
                category: "mistake",
                explanation: "b6 is premature. Complete your King's Indian setup with g6 and Bg7 first.",
                suggestedMove: "g6",
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

// ============ FRENCH DEFENSE ============
const frenchDefenseTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4",
    category: "main_line",
    children: [
      {
        fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        move: "e6",
        category: "main_line",
        children: [
          {
            fen: "rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
            move: "d4",
            category: "main_line",
            children: [
              {
                fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3",
                move: "d5",
                category: "main_line",
                children: [
                  {
                    fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3",
                    move: "Nc3",
                    category: "main_line",
                    children: [
                      {
                        fen: "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
                        move: "Bb4",
                        category: "main_line",
                        variationName: "Winawer Variation",
                        children: [
                          {
                            fen: "rnbqk1nr/ppp2ppp/4p3/3pP3/1b1P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4",
                            move: "e5",
                            category: "main_line",
                            children: [
                              {
                                fen: "rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/2N5/PPP2PPP/R1BQKBNR w KQkq c6 0 5",
                                move: "c5",
                                category: "main_line",
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
                        move: "Nf6",
                        category: "legit_alternative",
                        variationName: "Classical French",
                        children: [
                          {
                            fen: "rnbqkb1r/ppp2ppp/4pn2/3p2B1/3PP3/2N5/PPP2PPP/R2QKBNR b KQkq - 3 4",
                            move: "Bg5",
                            category: "main_line",
                            children: [
                              {
                                fen: "rnbqkb1r/ppp2ppp/4pn2/3pP1B1/3P4/2N5/PPP2PPP/R2QKBNR b KQkq - 0 5",
                                move: "dxe4",
                                category: "mistake",
                                explanation: "Taking with dxe4 loses the tension too early. Better to develop with Be7 or play dxe4 only after Bg5.",
                                suggestedMove: "Be7",
                                children: [],
                              },
                              {
                                fen: "rnbqk2r/ppp1bppp/4pn2/3p2B1/3PP3/2N5/PPP2PPP/R2QKBNR w KQkq - 4 5",
                                move: "Be7",
                                category: "main_line",
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
                    move: "e5",
                    category: "legit_alternative",
                    variationName: "Advance Variation",
                    children: [
                      {
                        fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq c6 0 4",
                        move: "c5",
                        category: "main_line",
                        children: [
                          {
                            fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/3B4/PPP2PPP/RNBQK1NR b KQkq - 1 4",
                            move: "c3",
                            category: "main_line",
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    fen: "rnbqkbnr/ppp2ppp/4p3/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
                    move: "exd5",
                    category: "legit_alternative",
                    variationName: "Exchange Variation",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

// ============ CARO-KANN DEFENSE ============
const caroKannTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4",
    category: "main_line",
    children: [
      {
        fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        move: "c6",
        category: "main_line",
        children: [
          {
            fen: "rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
            move: "d4",
            category: "main_line",
            children: [
              {
                fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3",
                move: "d5",
                category: "main_line",
                children: [
                  {
                    fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3",
                    move: "Nc3",
                    category: "main_line",
                    children: [
                      {
                        fen: "rnbqkbnr/pp2pppp/2p5/3P4/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4",
                        move: "dxe4",
                        category: "main_line",
                        children: [
                          {
                            fen: "rnbqkbnr/pp2pppp/2p5/3P4/3Pn3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4",
                            move: "Nxe4",
                            category: "main_line",
                            children: [
                              {
                                fen: "rn1qkbnr/pp2pppp/2p5/3P1b2/3Pn3/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 5",
                                move: "Bf5",
                                category: "main_line",
                                variationName: "Classical Caro-Kann",
                                children: [],
                              },
                              {
                                fen: "r1bqkbnr/pp2pppp/2n5/3P4/3Pn3/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 5",
                                move: "Nd7",
                                category: "legit_alternative",
                                variationName: "Modern Caro-Kann",
                                children: [],
                              },
                              {
                                fen: "rnbqkb1r/pp2pppp/2p2n2/3P4/3Pn3/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 5",
                                move: "Nf6",
                                category: "mistake",
                                explanation: "Nf6 allows Nxf6+ which damages your pawn structure. Play Bf5 to develop with tempo.",
                                suggestedMove: "Bf5",
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    fen: "rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
                    move: "e5",
                    category: "legit_alternative",
                    variationName: "Advance Caro-Kann",
                    children: [
                      {
                        fen: "rn1qkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
                        move: "Bf5",
                        category: "main_line",
                        children: [],
                      },
                    ],
                  },
                  {
                    fen: "rnbqkbnr/pp2pppp/2p5/8/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
                    move: "exd5",
                    category: "legit_alternative",
                    variationName: "Exchange Caro-Kann",
                    children: [],
                  },
                ],
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
    description: "A classical opening developing the bishop to c4, targeting f7. Leads to rich tactical and strategic play.",
    themeId: "italian",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w",
    tree: italianGameTree,
    totalVariations: 5,
  },
  {
    id: "sicilian-defense",
    name: "Sicilian Defense",
    family: "Sicilian",
    description: "The most popular response to 1.e4. Black fights for the center asymmetrically with sharp, complex positions.",
    themeId: "sicilian",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b",
    tree: sicilianDefenseTree,
    totalVariations: 6,
  },
  {
    id: "queens-gambit",
    name: "Queen's Gambit",
    family: "Queen's Gambit",
    description: "White offers a pawn to gain central control. A sophisticated opening with deep strategic themes.",
    themeId: "queensgambit",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w",
    tree: queensGambitTree,
    totalVariations: 4,
  },
  {
    id: "kings-indian",
    name: "King's Indian Defense",
    family: "King's Indian",
    description: "A hypermodern defense where Black lets White build a center, planning to strike back later.",
    themeId: "kingsindian",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b",
    tree: kingsIndianTree,
    totalVariations: 4,
  },
  {
    id: "french-defense",
    name: "French Defense",
    family: "French",
    description: "A solid defense creating a pawn chain. Black aims for a counterattack on White's center.",
    themeId: "french",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b",
    tree: frenchDefenseTree,
    totalVariations: 4,
  },
  {
    id: "caro-kann",
    name: "Caro-Kann Defense",
    family: "Caro-Kann",
    description: "A reliable defense with solid pawn structure and flexible development.",
    themeId: "carokann",
    startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b",
    tree: caroKannTree,
    totalVariations: 4,
  },
];
