// Hand-tagged seed Blitz puzzles for Phase 3.
// Each puzzle has a FEN, the player's color to move, the solution (1-2 SAN moves),
// a weakness tag for personalization in Phase 6, and difficulty 1-10.
//
// FENs and solutions are well-known elementary tactics so we can verify the
// solve loop works end-to-end. Replace / expand later via the Lichess fallback.

export type WeaknessTag =
  | "fork"
  | "pin"
  | "skewer"
  | "back_rank"
  | "discovered_attack"
  | "double_attack"
  | "mate_in_1"
  | "mate_in_2"
  | "hanging_piece"
  | "trapped_piece";

export interface SeedPuzzle {
  id: string;
  fen: string;
  /** Player's color — the side to move in `fen`. */
  playerColor: "w" | "b";
  /** Sequence of correct SAN moves. Player plays moves at even indices (0, 2, ...).
   *  Opponent replies live at odd indices (1, 3, ...). */
  solutionSan: string[];
  weaknessTag: WeaknessTag;
  difficulty: number;
  hint: string;
  title: string;
}

export const SEED_PUZZLES: SeedPuzzle[] = [
  {
    id: "seed-1",
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    playerColor: "w",
    solutionSan: ["Ra8+"],
    weaknessTag: "back_rank",
    difficulty: 2,
    hint: "The back rank is undefended.",
    title: "Back-rank check",
  },
  {
    id: "seed-2",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    playerColor: "w",
    solutionSan: ["Ng5"],
    weaknessTag: "double_attack",
    difficulty: 3,
    hint: "Aim two pieces at f7.",
    title: "Fried-liver setup",
  },
  {
    id: "seed-3",
    fen: "r3k2r/ppp2ppp/2n5/3qp3/3P4/2N5/PPP2PPP/R2QK2R w KQkq - 0 1",
    playerColor: "w",
    solutionSan: ["Nxd5"],
    weaknessTag: "hanging_piece",
    difficulty: 2,
    hint: "What's defending the queen?",
    title: "Free queen",
  },
  {
    id: "seed-4",
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1",
    playerColor: "w",
    solutionSan: ["Bxf7+"],
    weaknessTag: "discovered_attack",
    difficulty: 4,
    hint: "Sacrifice to expose the king.",
    title: "Bishop sac on f7",
  },
  {
    id: "seed-5",
    fen: "6k1/5ppp/8/8/8/2n5/5PPP/3R2K1 w - - 0 1",
    playerColor: "w",
    solutionSan: ["Rd3"],
    weaknessTag: "pin",
    difficulty: 3,
    hint: "Attack the knight that has nowhere to go.",
    title: "Pin the knight",
  },
  {
    id: "seed-6",
    fen: "r5k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    playerColor: "w",
    solutionSan: ["Re8+", "Rxe8"],
    weaknessTag: "back_rank",
    difficulty: 2,
    hint: "Force a trade on the back rank.",
    title: "Rook trade",
  },
  {
    id: "seed-7",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
    playerColor: "w",
    solutionSan: ["Bb5"],
    weaknessTag: "pin",
    difficulty: 1,
    hint: "Pin the knight to the king.",
    title: "Ruy Lopez pin",
  },
  {
    id: "seed-8",
    fen: "r3k2r/ppp2ppp/2n2n2/3pp3/8/2NP1N2/PPP1PPPP/R3K2R w KQkq - 0 1",
    playerColor: "w",
    solutionSan: ["Nxe5"],
    weaknessTag: "fork",
    difficulty: 4,
    hint: "A knight loves central forks.",
    title: "Central fork",
  },
  {
    id: "seed-9",
    fen: "6k1/5p1p/6p1/8/8/8/5PPP/3R2K1 w - - 0 1",
    playerColor: "w",
    solutionSan: ["Rd8+"],
    weaknessTag: "back_rank",
    difficulty: 1,
    hint: "Mate hides on the back rank.",
    title: "Back-rank mate",
  },
  {
    id: "seed-10",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1",
    playerColor: "w",
    solutionSan: ["Nxe5"],
    weaknessTag: "hanging_piece",
    difficulty: 2,
    hint: "Is e5 really defended enough?",
    title: "Grab e5",
  },
];