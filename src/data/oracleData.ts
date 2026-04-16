export interface OraclePosition {
  id: string;
  name: string;
  fen: string;
  mode: "converter" | "defender";
  difficulty: number;
  description: string;
  playerColor: "w" | "b";
  targetMoves?: number;
}

export const oraclePositions: OraclePosition[] = [
  // CONVERTER — mate with advantage
  {
    id: "kr-vs-k-1",
    name: "King & Rook vs King I",
    fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
    mode: "converter",
    difficulty: 1,
    description: "Deliver checkmate with king and rook against a lone king.",
    playerColor: "w",
  },
  {
    id: "kq-vs-k-1",
    name: "King & Queen vs King I",
    fen: "8/8/3k4/8/8/8/8/4K2Q w - - 0 1",
    mode: "converter",
    difficulty: 1,
    description: "Deliver checkmate with king and queen against a lone king.",
    playerColor: "w",
  },
  {
    id: "kr-vs-k-2",
    name: "King & Rook vs King II",
    fen: "8/8/4k3/8/8/8/4K3/7R w - - 0 1",
    mode: "converter",
    difficulty: 2,
    description: "Push the king to the edge and deliver checkmate.",
    playerColor: "w",
  },
  {
    id: "kq-vs-k-2",
    name: "King & Queen vs King II",
    fen: "3k4/8/8/8/8/8/8/Q3K3 w - - 0 1",
    mode: "converter",
    difficulty: 2,
    description: "Use your queen efficiently to deliver a quick checkmate.",
    playerColor: "w",
  },
  {
    id: "kr-vs-k-3",
    name: "King & Rook vs King III",
    fen: "8/8/8/8/4k3/8/8/R3K3 w - - 0 1",
    mode: "converter",
    difficulty: 3,
    description: "An advanced rook ending. Cut off the king and push to the edge.",
    playerColor: "w",
  },

  // DEFENDER — hold the draw (coming soon with tablebases)
  {
    id: "def-kp-vs-k-1",
    name: "Stop the Pawn",
    fen: "8/8/8/8/3Pk3/8/8/4K3 b - d3 0 1",
    mode: "defender",
    difficulty: 1,
    description: "Stop white's passed pawn from promoting. Can you hold?",
    playerColor: "b",
    targetMoves: 20,
  },
  {
    id: "def-kp-vs-k-2",
    name: "Opposition Draw",
    fen: "8/8/4k3/8/4P3/8/4K3/8 b - - 0 1",
    mode: "defender",
    difficulty: 2,
    description: "Use opposition to prevent the pawn from promoting.",
    playerColor: "b",
    targetMoves: 30,
  },
  {
    id: "def-kr-vs-kr-1",
    name: "Rook Endgame Hold",
    fen: "8/8/8/4k3/4P3/8/8/R3K3 b - - 0 1",
    mode: "defender",
    difficulty: 3,
    description: "Hold the position against a rook and pawn. Find the drawing technique.",
    playerColor: "b",
    targetMoves: 40,
  },
];

export function getConverterPositions(): OraclePosition[] {
  return oraclePositions.filter((p) => p.mode === "converter").sort((a, b) => a.difficulty - b.difficulty);
}

export function getDefenderPositions(): OraclePosition[] {
  return oraclePositions.filter((p) => p.mode === "defender").sort((a, b) => a.difficulty - b.difficulty);
}

export function getOraclePositionById(id: string): OraclePosition | undefined {
  return oraclePositions.find((p) => p.id === id);
}
