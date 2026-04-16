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
    name: "Tactical",
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
          { fen: "6k1/4Rppp/8/8/8/8/5PPP/6K1 w - - 0 1", solutionSan: "Re8#", hint: "Back rank with the rook" },
          { fen: "5rk1/5ppp/8/8/8/8/4RPPP/4R1K1 w - - 0 1", solutionSan: "Re8", hint: "Double rook back rank threat" },
          { fen: "4r1k1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1", solutionSan: "Qf8+", hint: "Queen sacrifice for back rank" },
          { fen: "6k1/pp3ppp/8/8/8/8/PP2QPPP/6K1 w - - 0 1", solutionSan: "Qe8#", hint: "Back rank checkmate" },
          { fen: "6rk/5Npp/8/8/8/8/6PP/6K1 w - - 0 1", solutionSan: "Nf7#", hint: "Smothered-adjacent mate" },
          { fen: "r4rk1/5ppp/8/8/1Q6/8/5PPP/6K1 w - - 0 1", solutionSan: "Qb8", hint: "Back rank pressure" },
          { fen: "2r3k1/5ppp/8/8/8/4Q3/5PPP/6K1 w - - 0 1", solutionSan: "Qe8+", hint: "Queen to the 8th rank" },
          { fen: "6k1/5p1p/8/8/8/5B2/5PPP/3R2K1 w - - 0 1", solutionSan: "Rd8#", hint: "Rook delivers mate" },
          { fen: "5rk1/4Qppp/8/8/8/8/5PPP/6K1 w - - 0 1", solutionSan: "Qe8", hint: "Trade into back rank mate" },
        ],
      },
      {
        id: "t-f2",
        name: "Forks, Pins & Skewers",
        description: "Attack two pieces at once. Immobilize. Skewer.",
        trials: [
          { fen: "r3k3/8/4N3/8/8/8/8/4K3 w - - 0 1", solutionSan: "Nc7+", hint: "Fork the king and rook" },
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
          { fen: "3qk3/8/8/8/3B4/8/8/3RK3 w - - 0 1", solutionSan: "Bf6", hint: "Discover the rook's attack on the queen" },
          { fen: "4k3/8/8/8/q3N3/8/8/4RK2 w - - 0 1", solutionSan: "Nd6+", hint: "Double check with the knight" },
          { fen: "7k/6q1/8/8/8/2N5/8/B3K3 w - - 0 1", solutionSan: "Ne4", hint: "Discover the bishop's attack" },
          { fen: "3qk3/4p3/8/4B3/8/8/8/3QK3 w - - 0 1", solutionSan: "Bc7", hint: "Discover the queen's attack" },
          { fen: "4k3/8/3q4/4N3/8/8/8/4RK2 w - - 0 1", solutionSan: "Nc4+", hint: "Check and attack the queen" },
          { fen: "2kr4/8/8/3N4/8/8/8/R3K3 w - - 0 1", solutionSan: "Nb6+", hint: "Fork with discovered rook attack" },
          { fen: "3qk3/8/5N2/8/8/8/8/3RK3 w - - 0 1", solutionSan: "Ne4", hint: "Discovered attack on the queen" },
          { fen: "r3k3/8/8/8/3B4/8/8/R3K3 w - - 0 1", solutionSan: "Bc5", hint: "Double attack with bishop and rook" },
          { fen: "r1b1k3/8/2N5/8/8/8/8/R3K3 w - - 0 1", solutionSan: "Nd4", hint: "Discovered attack on the rook" },
          { fen: "4k3/q7/4N3/8/8/8/8/4RK2 w - - 0 1", solutionSan: "Nc5+", hint: "Fork with discovered rook" },
        ],
      },
      {
        id: "t-f4",
        name: "Deflection & Decoys",
        description: "Force a defender away from its critical duty.",
        trials: [
          { fen: "3r2k1/5ppp/8/8/8/8/4QPPP/1R4K1 w - - 0 1", solutionSan: "Rb8", hint: "Deflect the rook from the back rank" },
          { fen: "r5k1/5p1p/6pQ/8/8/8/5PPP/6K1 w - - 0 1", solutionSan: "Qf8+", hint: "Deflect the rook for mate" },
          { fen: "3rk3/8/8/8/8/8/4Q3/2R1K3 w - - 0 1", solutionSan: "Rc8", hint: "Deflect the rook, queen mates" },
          { fen: "r4rk1/ppp2ppp/8/3q4/8/2N5/PPP2PPP/R2Q1RK1 w - - 0 1", solutionSan: "Nd5", hint: "Attack the queen, threaten fork" },
          { fen: "6k1/5ppp/4r3/8/8/8/4RPPP/4Q1K1 w - - 0 1", solutionSan: "Re8+", hint: "Deflect the rook" },
          { fen: "2r2rk1/5ppp/8/8/8/4Q3/5PPP/4R1K1 w - - 0 1", solutionSan: "Qe8", hint: "Force rook to abandon defense" },
          { fen: "4k3/8/8/8/8/2q5/3N4/4K2R w - - 0 1", solutionSan: "Nb3", hint: "Decoy the queen from its square" },
          { fen: "r3k2r/ppp2ppp/8/3Nn3/8/8/PPP2PPP/R3K2R w KQkq - 0 1", solutionSan: "Nc7+", hint: "Fork after deflecting defender" },
          { fen: "6k1/3r1ppp/8/8/8/3B4/5PPP/3R2K1 w - - 0 1", solutionSan: "Be4", hint: "Attack rook, threaten back rank" },
          { fen: "r5k1/5p1p/5Qp1/8/8/8/5PPP/6K1 w - - 0 1", solutionSan: "Qf8+", hint: "Deflect for mate" },
        ],
      },
      {
        id: "t-f5",
        name: "Advanced Calculation",
        description: "Find the winning move in complex positions.",
        trials: [
          { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", solutionSan: "Ng5", hint: "Threaten f7 with multiple pieces" },
          { fen: "r3k2r/ppp2ppp/2n1bn2/2bqp3/8/2NP1NP1/PPP2PBP/R1BQ1RK1 w kq - 0 1", solutionSan: "Nxe5", hint: "Central pawn capture with tactical justification" },
          { fen: "r1b1k2r/ppppqppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1", solutionSan: "Nd5", hint: "Central knight invasion" },
          { fen: "r2qk2r/ppp1bppp/2n1bn2/3pp3/4P3/1BN2N2/PPPP1PPP/R1BQ1RK1 w kq - 0 1", solutionSan: "exd5", hint: "Open the center" },
          { fen: "rnbq1rk1/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 0 1", solutionSan: "cxd5", hint: "Capture towards the center" },
          { fen: "r2qkbnr/ppp1pppp/2n5/3pNb2/3P4/8/PPP1PPPP/RNBQKB1R w KQkq - 0 1", solutionSan: "Nxc6", hint: "Capture the knight, damage structure" },
          { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1", solutionSan: "Nxe5", hint: "Tactical pawn grab" },
          { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 1", solutionSan: "d5", hint: "Push the pawn to gain space" },
          { fen: "rnbqkb1r/pp2pppp/5n2/2ppN3/3P4/8/PPP1PPPP/RNBQKB1R w KQkq - 0 1", solutionSan: "Nxf7", hint: "Sacrifice on f7" },
          { fen: "r1bqk2r/ppp2ppp/2n1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 1", solutionSan: "cxd5", hint: "Open lines in the center" },
        ],
      },
    ],
  },
  {
    id: "positional",
    name: "Positional",
    icon: "🏛️",
    color: "text-blue-400",
    glowColor: "shadow-blue-500/30",
    floors: [
      {
        id: "p-f1",
        name: "Piece Activity",
        description: "Activate your worst-placed piece.",
        trials: [
          { fen: "r1bqkb1r/pppppppp/2n2n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1", solutionSan: "Nf3", hint: "Develop a knight to its best square" },
          { fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", solutionSan: "e5", hint: "Control the center with a pawn" },
          { fen: "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1", solutionSan: "Bc4", hint: "Develop the bishop to an active diagonal" },
          { fen: "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1", solutionSan: "e5", hint: "Gain space and attack the knight" },
          { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1", solutionSan: "Bc4", hint: "Develop with tempo" },
          { fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1", solutionSan: "d4", hint: "Seize the center" },
          { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", solutionSan: "O-O", hint: "Castle to safety and connect rooks" },
          { fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1", solutionSan: "d5", hint: "Contest the center immediately" },
          { fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 1", solutionSan: "Nc3", hint: "Develop and support the center" },
          { fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1", solutionSan: "Bb5", hint: "Pin the knight, develop with purpose" },
        ],
      },
      {
        id: "p-f2",
        name: "Pawn Structure",
        description: "Create or exploit pawn weaknesses.",
        trials: [
          { fen: "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 1", solutionSan: "exd4", hint: "Trade to avoid a cramped position" },
          { fen: "rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 1", solutionSan: "dxe4", hint: "Capture to create an imbalance" },
          { fen: "r1bqkbnr/pppppppp/2n5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 1", solutionSan: "d5", hint: "Challenge the center immediately" },
          { fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/2N5/PPP1PPPP/R1BQKBNR w KQkq - 0 1", solutionSan: "Bf4", hint: "Develop without weakening pawns" },
          { fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 1", solutionSan: "cxd5", hint: "Exchange to open the position" },
          { fen: "r1bqkb1r/ppp2ppp/2n1pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 1", solutionSan: "cxd5", hint: "Capture to isolate or target the pawn" },
          { fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1", solutionSan: "e5", hint: "Advance to gain space" },
          { fen: "rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1", solutionSan: "d4", hint: "Build a strong center" },
          { fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 1", solutionSan: "e6", hint: "Solid structure, prepare development" },
          { fen: "rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 1", solutionSan: "d5", hint: "Challenge the center pawn" },
        ],
      },
      {
        id: "p-f3",
        name: "Outposts & Weak Squares",
        description: "Plant pieces on squares your opponent can't challenge.",
        trials: [
          { fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/2N1PN2/PPP2PPP/R1BQKB1R w KQkq - 0 1", solutionSan: "Bb5", hint: "Pin the knight guarding d5" },
          { fen: "r1bqkbnr/ppp2ppp/2n5/3pp3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1", solutionSan: "Nd5", hint: "Occupy the outpost" },
          { fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2N5/PPP1PPPP/R2QKBNR b KQkq - 0 1", solutionSan: "e6", hint: "Solidify the center, control d5" },
          { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1", solutionSan: "Nd5", hint: "The ideal outpost for the knight" },
          { fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 1", solutionSan: "exd4", hint: "Open the position to exploit weak squares" },
          { fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 0 1", solutionSan: "Ne5", hint: "Centralize with an outpost" },
          { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", solutionSan: "d3", hint: "Support the center, prepare outpost control" },
          { fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 0 1", solutionSan: "d4", hint: "Push to gain space and create weak squares" },
          { fen: "r1bqk2r/ppp2ppp/2n1pn2/3p4/3P4/2N1PN2/PPP2PPP/R1BQKB1R w KQkq - 0 1", solutionSan: "Bd3", hint: "Develop aiming at the kingside" },
          { fen: "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 1", solutionSan: "e6", hint: "Maintain the pawn chain" },
        ],
      },
      {
        id: "p-f4",
        name: "Open Files & Diagonals",
        description: "Seize open lines for your rooks and bishops.",
        trials: [
          { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1", solutionSan: "d3", hint: "Prepare to open the center" },
          { fen: "r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 0 1", solutionSan: "cxd5", hint: "Open the c-file for your rook" },
          { fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 1", solutionSan: "dxe4", hint: "Open the d-file" },
          { fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/4P3/2NP1N2/PPP2PPP/R1BQKB1R w - - 0 1", solutionSan: "Be2", hint: "Prepare to castle and use the open file" },
          { fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 1", solutionSan: "e3", hint: "Solid center, prepare to open the bishop" },
          { fen: "r2qkb1r/ppp1pppp/2n2n2/3p1b2/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 0 1", solutionSan: "Bg5", hint: "Pin on the open diagonal" },
          { fen: "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 0 1", solutionSan: "cxd5", hint: "Open lines in the center" },
          { fen: "r1bqkbnr/ppp2ppp/2n1p3/3p4/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 1", solutionSan: "Nc3", hint: "Develop, support the center tension" },
          { fen: "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 1", solutionSan: "cxd5", hint: "Open the c-file" },
          { fen: "r1bq1rk1/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1", solutionSan: "d3", hint: "Maintain tension, keep lines flexible" },
        ],
      },
      {
        id: "p-f5",
        name: "Prophylaxis & Restriction",
        description: "Prevent your opponent's plans before they happen.",
        trials: [
          { fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1", solutionSan: "Nf3", hint: "Develop and prevent Qh4" },
          { fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1", solutionSan: "c3", hint: "Prevent Bb4 and prepare d4" },
          { fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 1", solutionSan: "Nc3", hint: "Develop and control e4" },
          { fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1", solutionSan: "exd5", hint: "Prevent Black from building a pawn center" },
          { fen: "r1bqk2r/ppppbppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1", solutionSan: "d4", hint: "Strike the center before Black consolidates" },
          { fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 0 1", solutionSan: "d5", hint: "Prevent White from dominating the center" },
          { fen: "r1bqkb1r/pppppppp/2n2n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1", solutionSan: "Nc3", hint: "Protect d4 before Black attacks it" },
          { fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 1", solutionSan: "O-O", hint: "Castle before complications arise" },
          { fen: "r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 1", solutionSan: "Nf6", hint: "Develop and pressure e4" },
          { fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1", solutionSan: "Nf3", hint: "Flexible development, avoid premature d4" },
        ],
      },
    ],
  },
  {
    id: "endgame",
    name: "Endgame",
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
          { fen: "k7/8/1K6/8/8/8/8/7R w - - 0 1", solutionSan: "Ra1#", hint: "Rook delivers checkmate" },
          { fen: "8/8/8/3k4/8/8/3QK3/8 w - - 0 1", solutionSan: "Qd3", hint: "Mirror the king, push to edge" },
          { fen: "8/8/8/8/8/1k6/8/1KR5 w - - 0 1", solutionSan: "Rc3", hint: "Cut off the king, prepare mate" },
          { fen: "8/8/1k6/8/8/1K6/8/7Q w - - 0 1", solutionSan: "Qa8", hint: "Drive the king to the corner" },
          { fen: "k7/8/K7/8/8/8/8/1R6 w - - 0 1", solutionSan: "Rb8#", hint: "Checkmate on the back rank" },
        ],
      },
      {
        id: "e-f2",
        name: "Opposition & Key Squares",
        description: "Master the concept of king vs king battles.",
        trials: [
          { fen: "8/8/8/8/4k3/8/4P3/4K3 w - - 0 1", solutionSan: "Ke2", hint: "Take the opposition" },
          { fen: "8/4k3/8/4K3/4P3/8/8/8 w - - 0 1", solutionSan: "Kd5", hint: "Outflank the defending king" },
          { fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1", solutionSan: "Kf3", hint: "Support the pawn's advance" },
          { fen: "8/8/4k3/8/4K3/4P3/8/8 w - - 0 1", solutionSan: "Kd5", hint: "Outflank — don't push the pawn yet" },
          { fen: "8/8/8/8/8/3k4/3P4/3K4 w - - 0 1", solutionSan: "Ke2", hint: "Step to the side to gain opposition" },
          { fen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1", solutionSan: "Kd6", hint: "Outflank to escort the pawn" },
          { fen: "8/3k4/8/3K4/3P4/8/8/8 w - - 0 1", solutionSan: "Ke5", hint: "Gain the opposition" },
          { fen: "8/8/3k4/8/3PK3/8/8/8 w - - 0 1", solutionSan: "Ke5", hint: "Step forward with the king" },
          { fen: "8/8/8/3k4/8/3PK3/8/8 w - - 0 1", solutionSan: "Ke4", hint: "Take direct opposition" },
          { fen: "3k4/8/3PK3/8/8/8/8/8 w - - 0 1", solutionSan: "Ke7", hint: "Shoulder the king away" },
        ],
      },
      {
        id: "e-f3",
        name: "Rook Endgames",
        description: "The most common and complex endgame type.",
        trials: [
          { fen: "8/8/8/4k3/4p3/8/4R3/4K3 w - - 0 1", solutionSan: "Re2", hint: "Attack the pawn from behind" },
          { fen: "8/4k3/8/8/8/8/r3P3/4K3 w - - 0 1", solutionSan: "Kd2", hint: "Protect the pawn and advance" },
          { fen: "8/8/4k3/8/4P3/8/8/4K1R1 w - - 0 1", solutionSan: "Ke2", hint: "King supports the pawn" },
          { fen: "8/8/8/8/4Pk2/8/4R3/4K3 w - - 0 1", solutionSan: "Re3", hint: "Cut off the king" },
          { fen: "4k3/8/8/4P3/8/8/8/R3K3 w - - 0 1", solutionSan: "Ke2", hint: "Bring the king forward" },
          { fen: "8/R7/8/4k3/4p3/8/8/4K3 w - - 0 1", solutionSan: "Ra5+", hint: "Check and cut off the king" },
          { fen: "8/8/5k2/4R3/4P3/8/8/4K3 w - - 0 1", solutionSan: "Ke2", hint: "Support the pawn" },
          { fen: "8/4k3/8/4P3/8/8/8/R3K3 w - - 0 1", solutionSan: "Ra7+", hint: "Push the king back" },
          { fen: "R7/4k3/8/4P3/8/8/8/4K3 w - - 0 1", solutionSan: "Ke2", hint: "March the king forward" },
          { fen: "8/8/4k3/8/r3P3/8/8/R3K3 w - - 0 1", solutionSan: "Ra6+", hint: "Active rook, push the king" },
        ],
      },
      {
        id: "e-f4",
        name: "Minor Piece Endgames",
        description: "Bishop vs knight and same-piece endings.",
        trials: [
          { fen: "8/5k2/8/8/8/3BK3/3P4/8 w - - 0 1", solutionSan: "Ke4", hint: "Centralize the king" },
          { fen: "8/5k2/8/8/3NK3/8/3P4/8 w - - 0 1", solutionSan: "Ke5", hint: "Advance the king aggressively" },
          { fen: "8/8/4k3/8/2B1K3/8/2P5/8 w - - 0 1", solutionSan: "Kd4", hint: "King supports the pawn" },
          { fen: "8/8/4k3/8/4K3/3N4/3P4/8 w - - 0 1", solutionSan: "Kd5", hint: "Outflank with the king" },
          { fen: "8/8/3k4/8/3BK3/3P4/8/8 w - - 0 1", solutionSan: "Ke5", hint: "Push the king forward" },
          { fen: "8/3k4/8/3NK3/8/3P4/8/8 w - - 0 1", solutionSan: "Ke6", hint: "Gain space with the king" },
          { fen: "8/8/8/3k4/8/2BK4/2P5/8 w - - 0 1", solutionSan: "Kc4", hint: "Advance king to support the pawn" },
          { fen: "8/8/8/4k3/4N3/4K3/4P3/8 w - - 0 1", solutionSan: "Kd3", hint: "Centralize and prepare to advance" },
          { fen: "8/8/5k2/8/4BK2/8/4P3/8 w - - 0 1", solutionSan: "Ke5", hint: "King activity is key" },
          { fen: "8/4k3/8/4N3/4K3/8/4P3/8 w - - 0 1", solutionSan: "Kd5", hint: "March the king forward" },
        ],
      },
      {
        id: "e-f5",
        name: "Complex Conversions",
        description: "Convert winning advantages into checkmate.",
        trials: [
          { fen: "8/5pk1/8/5P2/6K1/8/8/8 w - - 0 1", solutionSan: "Kf4", hint: "Bring the king closer" },
          { fen: "8/8/5k2/5p2/5K2/5P2/8/8 w - - 0 1", solutionSan: "Ke4", hint: "Take the opposition" },
          { fen: "8/8/8/1k6/1P6/1K6/8/8 w - - 0 1", solutionSan: "Kc4", hint: "Outflank the defending king" },
          { fen: "8/8/8/8/3k4/8/3PK3/8 w - - 0 1", solutionSan: "Kf3", hint: "Support the pawn from behind" },
          { fen: "8/3k4/8/3PK3/8/8/8/8 w - - 0 1", solutionSan: "Ke6", hint: "Take the opposition to promote" },
          { fen: "8/8/3k4/3P4/3K4/8/8/8 w - - 0 1", solutionSan: "Kc4", hint: "Outflank — don't push the pawn" },
          { fen: "8/8/8/2k5/8/2K5/2P5/8 w - - 0 1", solutionSan: "Kd4", hint: "Gain the opposition" },
          { fen: "8/8/1k6/8/1PK5/8/8/8 w - - 0 1", solutionSan: "Kb3", hint: "Outflank from the side" },
          { fen: "8/8/8/8/2k5/8/2PK4/8 w - - 0 1", solutionSan: "Kd3", hint: "Direct opposition" },
          { fen: "8/2k5/8/2PK4/8/8/8/8 w - - 0 1", solutionSan: "Kd6", hint: "Shoulder the king, escort the pawn" },
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
