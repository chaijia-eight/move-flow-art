// === Pillar Trial Puzzle Data ===

export interface Trial {
  fen: string;
  solutionSan: string;
  hint: string;
}

export interface Floor {
  id: string;
  name: string;
  description: string;
  trials: Trial[];
}

export interface PillarDef {
  id: "tactical" | "positional" | "endgame";
  name: string;
  icon: string;
  color: string;
  glowColor: string;
  floors: Floor[];
}

export const PILLARS: PillarDef[] = [
  {
    id: "tactical",
    name: "Tactical Pillar",
    icon: "⚔️",
    color: "text-red-400",
    glowColor: "shadow-red-500/30",
    floors: [
      {
        id: "t-f1",
        name: "Mating Patterns",
        description: "Find the checkmate in one move.",
        trials: [
          { fen: "6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1", solutionSan: "Qe8#", hint: "Back rank mate" },
          { fen: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1", solutionSan: "Qf7#", hint: "Scholar's mate pattern" },
          { fen: "6k1/4Rppp/8/8/8/8/5PPP/6K1 w - - 0 1", solutionSan: "Re8#", hint: "Back rank with the rook" },
          { fen: "5rk1/5ppp/8/8/8/8/4RPPP/4R1K1 w - - 0 1", solutionSan: "Re8", hint: "Double rook back rank threat" },
          { fen: "4r1k1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1", solutionSan: "Qf8+", hint: "Queen sacrifice for back rank" },
          { fen: "2r3k1/5ppp/8/8/1Q6/8/5PPP/6K1 w - - 0 1", solutionSan: "Qb8", hint: "Force the exchange and checkmate idea" },
          { fen: "6k1/pp3ppp/8/8/8/8/PP2QPPP/6K1 w - - 0 1", solutionSan: "Qe8#", hint: "Back rank checkmate" },
          { fen: "r4rk1/5ppp/8/8/8/5N2/5PPP/R4RK1 w - - 0 1", solutionSan: "Nh4", hint: "Set up a mating net" },
          { fen: "6rk/5Npp/8/8/8/8/6PP/6K1 w - - 0 1", solutionSan: "Nf7#", hint: "Smothered-adjacent mate" },
          { fen: "r1b2rk1/ppppqppp/2n2n2/8/3NP3/2N5/PPP2PPP/R1BQR1K1 w - - 0 1", solutionSan: "Nd5", hint: "Fork the queen and threaten mate" },
        ],
      },
      {
        id: "t-f2",
        name: "Forks, Pins & Skewers",
        description: "Attack two pieces at once. Immobilize. Skewer.",
        trials: [
          { fen: "r3k3/8/4N3/8/8/8/8/4K3 w - - 0 1", solutionSan: "Nc7+", hint: "Fork the king and rook with the knight" },
          { fen: "8/4k1q1/8/8/3N4/8/8/4K3 w - - 0 1", solutionSan: "Nf5+", hint: "Fork the king and queen" },
          { fen: "8/1r3k2/8/8/2N5/8/8/4K3 w - - 0 1", solutionSan: "Nd6+", hint: "Fork the king and rook" },
          { fen: "8/2k5/3r4/8/8/8/1B6/4K3 w - - 0 1", solutionSan: "Be5", hint: "Pin the rook to the king" },
          { fen: "4q3/8/8/4b3/8/8/8/R5K1 w - - 0 1", solutionSan: "Re1", hint: "Pin the bishop to the queen" },
          { fen: "r7/8/8/k7/8/8/8/1R2K3 w - - 0 1", solutionSan: "Ra1+", hint: "Skewer the king to win the rook" },
          { fen: "7r/8/8/4k3/8/8/8/2B1K3 w - - 0 1", solutionSan: "Bb2+", hint: "Skewer the king to win the rook" },
          { fen: "8/r1k5/8/8/3N4/8/8/K7 w - - 0 1", solutionSan: "Nb5+", hint: "Fork the king and rook" },
          { fen: "8/8/5k2/4N3/8/4q3/8/K7 w - - 0 1", solutionSan: "Ng4+", hint: "Fork the king and queen" },
          { fen: "q7/8/8/k7/8/8/8/1R2K3 w - - 0 1", solutionSan: "Ra1+", hint: "Skewer the king to win the queen" },
        ],
      },
      {
        id: "t-f3",
        name: "Discovered & Double Attacks",
        description: "Move one piece to reveal a devastating attack.",
        trials: [
          { fen: "3qk3/8/8/8/3B4/8/8/3RK3 w - - 0 1", solutionSan: "Bf6", hint: "Move the bishop to discover an attack on the queen" },
          { fen: "4k3/8/8/8/q3N3/8/8/4RK2 w - - 0 1", solutionSan: "Nd6+", hint: "Double check with the knight" },
          { fen: "7k/6q1/8/8/8/2N5/8/B3K3 w - - 0 1", solutionSan: "Ne4", hint: "Move the knight to discover an attack on the queen" },
          { fen: "r3k3/8/4N3/8/8/8/8/4K3 w - - 0 1", solutionSan: "Nc7+", hint: "Fork with discovered attack potential" },
          { fen: "3qk3/4p3/8/4B3/8/8/8/3QK3 w - - 0 1", solutionSan: "Bc7", hint: "Discover the queen's attack" },
          { fen: "r1b1k3/8/2N5/8/8/8/8/R3K3 w - - 0 1", solutionSan: "Nd4", hint: "Discovered attack on the rook" },
          { fen: "4k3/8/3q4/4N3/8/8/8/4RK2 w - - 0 1", solutionSan: "Nc4+", hint: "Check the king, attack the queen" },
          { fen: "2kr4/8/8/3N4/8/8/8/R3K3 w - - 0 1", solutionSan: "Nb6+", hint: "Fork with discovered rook attack" },
          { fen: "3qk3/8/5N2/8/8/8/8/3RK3 w - - 0 1", solutionSan: "Ne4", hint: "Discovered attack on the queen" },
          { fen: "r3k3/8/8/8/3B4/8/8/R3K3 w - - 0 1", solutionSan: "Bc5", hint: "Double attack with bishop and rook" },
        ],
      },
    ],
  },
  {
    id: "positional",
    name: "Positional Pillar",
    icon: "🏛️",
    color: "text-blue-400",
    glowColor: "shadow-blue-500/30",
    floors: [
      {
        id: "p-f1",
        name: "Piece Activity",
        description: "Activate your worst piece.",
        trials: [], // Coming in Sprint 3
      },
    ],
  },
  {
    id: "endgame",
    name: "Endgame Pillar",
    icon: "🛡️",
    color: "text-emerald-400",
    glowColor: "shadow-emerald-500/30",
    floors: [
      {
        id: "e-f1",
        name: "Basic Mates",
        description: "KQ vs K, KR vs K fundamentals.",
        trials: [
          { fen: "8/8/8/4k3/8/8/8/4K1R1 w - - 0 1", solutionSan: "Rg5+", hint: "Cut off the king with the rook" },
          { fen: "8/8/8/8/4k3/8/4Q3/4K3 w - - 0 1", solutionSan: "Qd3", hint: "Restrict the king's movement" },
          { fen: "8/8/8/4k3/8/4Q3/8/4K3 w - - 0 1", solutionSan: "Qd4", hint: "Push the king to the edge" },
          { fen: "4k3/8/4K3/8/8/8/8/7R w - - 0 1", solutionSan: "Rh8#", hint: "Back rank checkmate" },
          { fen: "8/8/3k4/8/8/3K4/8/7Q w - - 0 1", solutionSan: "Qe4", hint: "Opposition with queen support" },
        ],
      },
    ],
  },
];

export function getPillar(id: string): PillarDef | undefined {
  return PILLARS.find((p) => p.id === id);
}

export function getFloor(pillarId: string, floorIndex: number): Floor | undefined {
  return getPillar(pillarId)?.floors[floorIndex];
}

export const TRIALS_PER_FLOOR = 10;
export const TRIALS_TO_PASS = 8;
