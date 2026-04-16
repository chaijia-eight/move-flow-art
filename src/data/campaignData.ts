export interface CampaignPuzzle {
  fen: string;
  solutionSan: string;
  hint: string;
}

export interface CampaignNode {
  id: string;
  branch: "tactics" | "positional" | "endgames";
  name: string;
  description: string;
  position: number;
  xpReward: number;
  puzzles: CampaignPuzzle[];
}

export const campaignNodes: CampaignNode[] = [
  // ===== TACTICS BRANCH =====
  {
    id: "forks",
    branch: "tactics",
    name: "Forks",
    description: "Attack two pieces at once with a single move.",
    position: 0,
    xpReward: 50,
    puzzles: [
      { fen: "r3k3/8/4N3/8/8/8/8/4K3 w - - 0 1", solutionSan: "Nc7+", hint: "Fork the king and rook with the knight" },
      { fen: "8/4k1q1/8/8/3N4/8/8/4K3 w - - 0 1", solutionSan: "Nf5+", hint: "Fork the king and queen" },
      { fen: "8/1r3k2/8/8/2N5/8/8/4K3 w - - 0 1", solutionSan: "Nd6+", hint: "Fork the king and rook" },
      { fen: "8/8/5k2/4N3/8/4q3/8/K7 w - - 0 1", solutionSan: "Ng4+", hint: "Fork the king and queen" },
      { fen: "8/r1k5/8/8/3N4/8/8/K7 w - - 0 1", solutionSan: "Nb5+", hint: "Fork the king and rook" },
    ],
  },
  {
    id: "pins",
    branch: "tactics",
    name: "Pins",
    description: "Immobilize a piece by attacking through it to a more valuable one.",
    position: 1,
    xpReward: 60,
    puzzles: [
      { fen: "8/2k5/3r4/8/8/8/1B6/4K3 w - - 0 1", solutionSan: "Be5", hint: "Pin the rook to the king" },
      { fen: "4q3/8/8/4b3/8/8/8/R5K1 w - - 0 1", solutionSan: "Re1", hint: "Pin the bishop to the queen" },
      { fen: "6q1/8/8/3n4/8/8/8/1B2K3 w - - 0 1", solutionSan: "Ba2", hint: "Pin the knight to the queen" },
    ],
  },
  {
    id: "skewers",
    branch: "tactics",
    name: "Skewers",
    description: "Attack a valuable piece, forcing it to move and exposing one behind it.",
    position: 2,
    xpReward: 70,
    puzzles: [
      { fen: "r7/8/8/k7/8/8/8/1R2K3 w - - 0 1", solutionSan: "Ra1+", hint: "Skewer the king to win the rook" },
      { fen: "7r/8/8/4k3/8/8/8/2B1K3 w - - 0 1", solutionSan: "Bb2+", hint: "Skewer the king to win the rook" },
      { fen: "q7/8/8/k7/8/8/8/1R2K3 w - - 0 1", solutionSan: "Ra1+", hint: "Skewer the king to win the queen" },
    ],
  },
  {
    id: "discovered-attacks",
    branch: "tactics",
    name: "Discovered Attacks",
    description: "Move one piece to reveal an attack from another.",
    position: 3,
    xpReward: 80,
    puzzles: [
      { fen: "3qk3/8/8/8/3B4/8/8/3RK3 w - - 0 1", solutionSan: "Bf6", hint: "Move the bishop to discover an attack on the queen" },
      { fen: "4k3/8/8/8/q3N3/8/8/4RK2 w - - 0 1", solutionSan: "Nd6", hint: "Double check with the knight" },
      { fen: "7k/6q1/8/8/8/2N5/8/B3K3 w - - 0 1", solutionSan: "Ne4", hint: "Move the knight to discover an attack on the queen" },
    ],
  },
  {
    id: "deflection",
    branch: "tactics",
    name: "Deflection",
    description: "Force a defending piece away from its critical duty.",
    position: 4,
    xpReward: 100,
    puzzles: [], // Coming soon
  },

  // ===== POSITIONAL BRANCH =====
  { id: "pawn-structure", branch: "positional", name: "Pawn Structure", description: "Understand doubled, isolated, and passed pawns.", position: 0, xpReward: 50, puzzles: [] },
  { id: "outposts", branch: "positional", name: "Outposts", description: "Plant pieces on strong squares your opponent can't challenge.", position: 1, xpReward: 60, puzzles: [] },
  { id: "open-files", branch: "positional", name: "Open Files", description: "Control open files with your rooks.", position: 2, xpReward: 70, puzzles: [] },
  { id: "piece-coordination", branch: "positional", name: "Piece Coordination", description: "Make your pieces work together harmoniously.", position: 3, xpReward: 80, puzzles: [] },
  { id: "prophylaxis", branch: "positional", name: "Prophylaxis", description: "Prevent your opponent's plans before they happen.", position: 4, xpReward: 100, puzzles: [] },

  // ===== ENDGAMES BRANCH =====
  { id: "king-activity", branch: "endgames", name: "King Activity", description: "Activate your king as a fighting piece.", position: 0, xpReward: 50, puzzles: [] },
  { id: "opposition", branch: "endgames", name: "Opposition", description: "Master the key concept of king opposition.", position: 1, xpReward: 60, puzzles: [] },
  { id: "rook-endgames", branch: "endgames", name: "Rook Endgames", description: "The most common and complex endgame type.", position: 2, xpReward: 70, puzzles: [] },
  { id: "minor-piece-endgames", branch: "endgames", name: "Minor Piece Endgames", description: "Bishop vs knight and same-piece endings.", position: 3, xpReward: 80, puzzles: [] },
  { id: "zugzwang", branch: "endgames", name: "Zugzwang", description: "When any move worsens your opponent's position.", position: 4, xpReward: 100, puzzles: [] },
];

export function getNodesByBranch(branch: CampaignNode["branch"]): CampaignNode[] {
  return campaignNodes.filter((n) => n.branch === branch).sort((a, b) => a.position - b.position);
}

export function getNodeById(id: string): CampaignNode | undefined {
  return campaignNodes.find((n) => n.id === id);
}

export const STARS_THRESHOLDS = { three: 0.8, two: 0.5 };

export function getStars(correct: number, total: number): number {
  if (total === 0) return 0;
  const ratio = correct / total;
  if (ratio >= STARS_THRESHOLDS.three) return 3;
  if (ratio >= STARS_THRESHOLDS.two) return 2;
  return 1;
}
