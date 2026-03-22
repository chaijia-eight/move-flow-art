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
  primaryColor: string;
  primaryLight: string;
  accentColor: string;
  glowColor: string;
  textureName: string;
  ambientDescription: string;
}

export interface VariationInfo {
  id: string;
  name: string;
  description: string;
  plan: string; // Strategic plan and expected result of this line
  startingMoves: string; // e.g. "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6"
  tree: OpeningNode[];
  depth: number;
}

export interface Opening {
  id: string;
  name: string;
  family: string;
  description: string;
  themeId: string;
  startingFen: string;
  primarySide: "w" | "b";
  tree: OpeningNode[];
  variations: VariationInfo[];
  totalVariations: number;
}

export const themes: Record<string, OpeningTheme> = {
  italian: {
    id: "italian",
    boardLight: "hsl(40, 30%, 88%)",
    boardDark: "hsl(25, 18%, 48%)",
    primaryColor: "hsl(345, 45%, 35%)",
    primaryLight: "hsl(345, 40%, 50%)",
    accentColor: "hsl(38, 80%, 65%)",
    glowColor: "hsl(38, 80%, 60%)",
    textureName: "marble",
    ambientDescription: "Renaissance scrollwork, warm vignette",
  },
  sicilian: {
    id: "sicilian",
    boardLight: "hsl(0, 0%, 28%)",
    boardDark: "hsl(0, 0%, 16%)",
    primaryColor: "hsl(0, 70%, 45%)",
    primaryLight: "hsl(0, 65%, 55%)",
    accentColor: "hsl(0, 80%, 55%)",
    glowColor: "hsl(0, 80%, 50%)",
    textureName: "obsidian",
    ambientDescription: "Volcanic texture, lava glow beneath edges",
  },
  queensgambit: {
    id: "queensgambit",
    boardLight: "hsl(30, 30%, 55%)",
    boardDark: "hsl(25, 25%, 30%)",
    primaryColor: "hsl(150, 30%, 30%)",
    primaryLight: "hsl(150, 25%, 40%)",
    accentColor: "hsl(150, 35%, 45%)",
    glowColor: "hsl(150, 40%, 40%)",
    textureName: "wood",
    ambientDescription: "Tooled leather borders, subtle stitching",
  },
  kingsindian: {
    id: "kingsindian",
    boardLight: "hsl(35, 20%, 60%)",
    boardDark: "hsl(30, 15%, 35%)",
    primaryColor: "hsl(15, 55%, 45%)",
    primaryLight: "hsl(15, 50%, 55%)",
    accentColor: "hsl(230, 40%, 45%)",
    glowColor: "hsl(15, 60%, 50%)",
    textureName: "woven",
    ambientDescription: "Woven textile patterns, warm earth tones",
  },
  french: {
    id: "french",
    boardLight: "hsl(40, 15%, 75%)",
    boardDark: "hsl(220, 10%, 50%)",
    primaryColor: "hsl(270, 25%, 55%)",
    primaryLight: "hsl(270, 20%, 65%)",
    accentColor: "hsl(270, 30%, 60%)",
    glowColor: "hsl(270, 30%, 55%)",
    textureName: "limestone",
    ambientDescription: "Art nouveau flourishes, soft diffused lighting",
  },
  carokann: {
    id: "carokann",
    boardLight: "hsl(15, 30%, 45%)",
    boardDark: "hsl(10, 25%, 25%)",
    primaryColor: "hsl(20, 70%, 50%)",
    primaryLight: "hsl(20, 65%, 60%)",
    accentColor: "hsl(25, 75%, 55%)",
    glowColor: "hsl(25, 70%, 50%)",
    textureName: "mahogany",
    ambientDescription: "Industrial chic meets classic, warm metallic accents",
  },
  ruylopez: {
    id: "ruylopez",
    boardLight: "hsl(45, 35%, 82%)",
    boardDark: "hsl(20, 30%, 40%)",
    primaryColor: "hsl(30, 60%, 40%)",
    primaryLight: "hsl(30, 55%, 50%)",
    accentColor: "hsl(45, 70%, 55%)",
    glowColor: "hsl(45, 65%, 50%)",
    textureName: "parchment",
    ambientDescription: "Aged parchment, Spanish colonial warmth",
  },
  london: {
    id: "london",
    boardLight: "hsl(210, 8%, 70%)",
    boardDark: "hsl(210, 12%, 35%)",
    primaryColor: "hsl(210, 20%, 30%)",
    primaryLight: "hsl(210, 18%, 45%)",
    accentColor: "hsl(45, 50%, 55%)",
    glowColor: "hsl(45, 45%, 50%)",
    textureName: "fog",
    ambientDescription: "Victorian elegance, foggy London tones",
  },
  scotch: {
    id: "scotch",
    boardLight: "hsl(25, 35%, 65%)",
    boardDark: "hsl(20, 40%, 30%)",
    primaryColor: "hsl(15, 50%, 35%)",
    primaryLight: "hsl(15, 45%, 45%)",
    accentColor: "hsl(30, 65%, 50%)",
    glowColor: "hsl(30, 60%, 45%)",
    textureName: "highland",
    ambientDescription: "Peaty warmth, Highland stone textures",
  },
  dutch: {
    id: "dutch",
    boardLight: "hsl(200, 25%, 75%)",
    boardDark: "hsl(210, 30%, 35%)",
    primaryColor: "hsl(25, 70%, 50%)",
    primaryLight: "hsl(25, 65%, 60%)",
    accentColor: "hsl(200, 50%, 55%)",
    glowColor: "hsl(200, 45%, 50%)",
    textureName: "delft",
    ambientDescription: "Delft blue porcelain, windmill countryside",
  },
  pirc: {
    id: "pirc",
    boardLight: "hsl(50, 25%, 70%)",
    boardDark: "hsl(140, 15%, 30%)",
    primaryColor: "hsl(140, 30%, 35%)",
    primaryLight: "hsl(140, 25%, 45%)",
    accentColor: "hsl(50, 55%, 55%)",
    glowColor: "hsl(50, 50%, 50%)",
    textureName: "jungle",
    ambientDescription: "Dense tropical foliage, hidden paths",
  },
  scandinavian: {
    id: "scandinavian",
    boardLight: "hsl(200, 10%, 80%)",
    boardDark: "hsl(210, 15%, 40%)",
    primaryColor: "hsl(220, 35%, 40%)",
    primaryLight: "hsl(220, 30%, 55%)",
    accentColor: "hsl(0, 55%, 50%)",
    glowColor: "hsl(0, 50%, 45%)",
    textureName: "nordic",
    ambientDescription: "Scandinavian minimalism, aurora accents",
  },
  english: {
    id: "english",
    boardLight: "hsl(120, 10%, 75%)",
    boardDark: "hsl(150, 15%, 35%)",
    primaryColor: "hsl(150, 30%, 30%)",
    primaryLight: "hsl(150, 25%, 42%)",
    accentColor: "hsl(35, 55%, 55%)",
    glowColor: "hsl(35, 50%, 50%)",
    textureName: "garden",
    ambientDescription: "English garden, hedgerow patterns",
  },
  nimzoindian: {
    id: "nimzoindian",
    boardLight: "hsl(45, 20%, 72%)",
    boardDark: "hsl(280, 12%, 35%)",
    primaryColor: "hsl(280, 25%, 40%)",
    primaryLight: "hsl(280, 20%, 52%)",
    accentColor: "hsl(45, 60%, 55%)",
    glowColor: "hsl(45, 55%, 50%)",
    textureName: "silk",
    ambientDescription: "Silk road elegance, ornate patterns",
  },
  grunfeld: {
    id: "grunfeld",
    boardLight: "hsl(40, 15%, 65%)",
    boardDark: "hsl(0, 0%, 22%)",
    primaryColor: "hsl(0, 0%, 20%)",
    primaryLight: "hsl(0, 0%, 35%)",
    accentColor: "hsl(50, 70%, 55%)",
    glowColor: "hsl(50, 65%, 50%)",
    textureName: "steel",
    ambientDescription: "Modernist steel and gold, sharp contrasts",
  },
  alekhine: {
    id: "alekhine",
    boardLight: "hsl(260, 15%, 70%)",
    boardDark: "hsl(260, 20%, 30%)",
    primaryColor: "hsl(260, 35%, 35%)",
    primaryLight: "hsl(260, 30%, 48%)",
    accentColor: "hsl(170, 50%, 50%)",
    glowColor: "hsl(170, 45%, 45%)",
    textureName: "cosmic",
    ambientDescription: "Deep space, nebula swirls, cosmic mystery",
  },
  vienna: {
    id: "vienna",
    boardLight: "hsl(50, 30%, 80%)",
    boardDark: "hsl(20, 20%, 42%)",
    primaryColor: "hsl(0, 55%, 42%)",
    primaryLight: "hsl(0, 50%, 55%)",
    accentColor: "hsl(45, 75%, 55%)",
    glowColor: "hsl(45, 70%, 50%)",
    textureName: "baroque",
    ambientDescription: "Viennese coffeehouse warmth, gilded accents",
  },
  catalan: {
    id: "catalan",
    boardLight: "hsl(40, 25%, 78%)",
    boardDark: "hsl(20, 30%, 38%)",
    primaryColor: "hsl(35, 60%, 40%)",
    primaryLight: "hsl(35, 55%, 52%)",
    accentColor: "hsl(10, 65%, 55%)",
    glowColor: "hsl(10, 60%, 50%)",
    textureName: "terracotta",
    ambientDescription: "Mediterranean terracotta, warm Catalan sunlight",
  },
  benoni: {
    id: "benoni",
    boardLight: "hsl(45, 20%, 68%)",
    boardDark: "hsl(30, 25%, 28%)",
    primaryColor: "hsl(25, 65%, 45%)",
    primaryLight: "hsl(25, 60%, 55%)",
    accentColor: "hsl(50, 70%, 50%)",
    glowColor: "hsl(50, 65%, 45%)",
    textureName: "savanna",
    ambientDescription: "African savanna warmth, golden hour tones",
  },
  philidor: {
    id: "philidor",
    boardLight: "hsl(30, 20%, 75%)",
    boardDark: "hsl(210, 15%, 40%)",
    primaryColor: "hsl(220, 30%, 38%)",
    primaryLight: "hsl(220, 25%, 50%)",
    accentColor: "hsl(40, 60%, 55%)",
    glowColor: "hsl(40, 55%, 50%)",
    textureName: "neoclassical",
    ambientDescription: "French neoclassical elegance, velvet tones",
  },
  reti: {
    id: "reti",
    boardLight: "hsl(180, 8%, 75%)",
    boardDark: "hsl(190, 12%, 38%)",
    primaryColor: "hsl(180, 25%, 35%)",
    primaryLight: "hsl(180, 20%, 48%)",
    accentColor: "hsl(30, 55%, 55%)",
    glowColor: "hsl(30, 50%, 50%)",
    textureName: "modernist",
    ambientDescription: "Czech modernism, clean geometric lines",
  },
};
