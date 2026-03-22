import type { OpeningNode, Opening, VariationInfo } from "./openings";

// =============================================
// ITALIAN GAME
// =============================================
const italianMainTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
      move: "e5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        move: "Nf3", category: "main_line",
        children: [{
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          move: "Nc6", category: "main_line",
          children: [{
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
            move: "Bc4", category: "main_line",
            children: [
              {
                fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
                move: "Bc5", category: "main_line", variationName: "Giuoco Piano",
                children: [
                  {
                    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4",
                    move: "c3", category: "main_line", variationName: "Giuoco Piano",
                    children: [
                      {
                        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5",
                        move: "Nf6", category: "main_line",
                        children: [{
                          fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq d3 0 5",
                          move: "d4", category: "main_line",
                          children: [{
                            fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/2BpP3/2P2N2/PP3PPP/RNBQK2R w KQkq - 0 6",
                            move: "cxd4", category: "main_line",
                            children: [{
                              fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/2BPP3/5N2/PP3PPP/RNBQK2R b KQkq - 0 6",
                              move: "cxd4", category: "main_line",
                              children: []
                            }]
                          }]
                        }]
                      },
                      {
                        fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4",
                        move: "d6", category: "legit_alternative", variationName: "Giuoco Pianissimo",
                        children: []
                      },
                    ]
                  },
                  {
                    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq d3 0 4",
                    move: "d4", category: "legit_alternative", variationName: "Italian Gambit",
                    children: []
                  },
                  {
                    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq b3 0 4",
                    move: "b4", category: "legit_alternative", variationName: "Evans Gambit",
                    children: [{
                      fen: "r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/5N2/P1PP1PPP/RNBQK2R w KQkq - 0 5",
                      move: "Bxb4", category: "main_line",
                      children: [{
                        fen: "r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/2P2N2/P2P1PPP/RNBQK2R b KQkq - 0 5",
                        move: "c3", category: "main_line",
                        children: [{
                          fen: "r1bqk1nr/pppp1ppp/2n5/b3p3/2B1P3/2P2N2/P2P1PPP/RNBQK2R w KQkq - 1 6",
                          move: "Ba5", category: "main_line",
                          children: [{
                            fen: "r1bqk1nr/pppp1ppp/2n5/b3p3/2BPP3/2P2N2/P4PPP/RNBQK2R b KQkq - 0 6",
                            move: "d4", category: "main_line",
                            children: [{
                              fen: "r1bqk1nr/pppp1ppp/2n5/b7/2BpP3/2P2N2/P4PPP/RNBQK2R w KQkq - 0 7",
                              move: "exd4", category: "main_line",
                              children: [{
                                fen: "r1bqk1nr/pppp1ppp/2n5/b7/2BpP3/2P2N2/P4PPP/RNBQ1RK1 b kq - 1 7",
                                move: "O-O", category: "main_line",
                                children: [{
                                  fen: "r1bqk1nr/pppp1ppp/2n5/b7/2B1P3/2p2N2/P4PPP/RNBQ1RK1 w kq - 0 8",
                                  move: "dxc3", category: "main_line",
                                  children: [{
                                    fen: "r1bqk1nr/pppp1ppp/2n5/b7/2B1P3/1Qp2N2/P4PPP/RNB2RK1 b kq - 1 8",
                                    move: "Qb3", category: "main_line",
                                    children: [{
                                      fen: "r1b1k1nr/pppp1ppp/2n5/bq6/2B1P3/1Qp2N2/P4PPP/RNB2RK1 w kq - 2 9",
                                      move: "Qe7", category: "main_line",
                                      children: []
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  },
                ]
              },
              {
                fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
                move: "Nf6", category: "legit_alternative", variationName: "Two Knights Defense",
                children: [{
                  fen: "r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4",
                  move: "Ng5", category: "main_line",
                  children: [{
                    fen: "r1bqkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq d6 0 5",
                    move: "d5", category: "main_line",
                    children: [{
                      fen: "r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 5",
                      move: "exd5", category: "main_line",
                      children: [{
                        fen: "r1bqkb1r/ppp2ppp/5n2/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 6",
                        move: "Na5", category: "main_line", variationName: "Traxler/Fried Liver Attack territory",
                        children: []
                      }]
                    }]
                  }]
                }]
              },
              {
                fen: "r1bqkbnr/pppp1pp1/2n4p/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
                move: "h6", category: "mistake",
                explanation: "h6 wastes a tempo. Focus on developing pieces and controlling the center.",
                suggestedMove: "Bc5", children: []
              },
              {
                fen: "r1bqkbnr/1ppp1ppp/p1n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
                move: "a6", category: "mistake",
                explanation: "a6 is too slow. Develop a piece like Bc5 or Nf6.",
                suggestedMove: "Bc5", children: []
              },
            ]
          },
          {
            fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
            move: "Bb5", category: "legit_alternative", variationName: "Ruy López",
            children: []
          }]
        },
        {
          fen: "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          move: "Nf6", category: "legit_alternative", variationName: "Petrov's Defense",
          children: []
        },
        {
          fen: "rnbqkbnr/1ppp1ppp/p7/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
          move: "a6", category: "mistake",
          explanation: "a6 doesn't develop or control center. Nc6 is natural.",
          suggestedMove: "Nc6", children: []
        }]
      }]
    }]
  }
];

// =============================================
// SICILIAN DEFENSE
// =============================================
const sicilianMainTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
      move: "c5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        move: "Nf3", category: "main_line",
        children: [
          {
            fen: "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
            move: "d6", category: "main_line",
            children: [{
              fen: "rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3",
              move: "d4", category: "main_line",
              children: [{
                fen: "rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
                move: "cxd4", category: "main_line",
                children: [{
                  fen: "rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4",
                  move: "Nxd4", category: "main_line",
                  children: [{
                    fen: "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5",
                    move: "Nf6", category: "main_line",
                    children: [{
                      fen: "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5",
                      move: "Nc3", category: "main_line",
                      children: [
                        {
                          fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
                          move: "a6", category: "main_line", variationName: "Najdorf Variation",
                          children: [{
                            fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq - 1 6",
                            move: "Be2", category: "main_line",
                            children: [{
                              fen: "rnbqkb1r/1p3ppp/p2ppn2/8/3NP3/2N5/PPP1BPPP/R1BQK2R w KQkq - 0 7",
                              move: "e6", category: "main_line",
                              children: [{
                                fen: "rnbqkb1r/1p3ppp/p2ppn2/8/3NP3/2N5/PPP1BPPP/R1BQ1RK1 b kq - 1 7",
                                move: "O-O", category: "main_line",
                                children: [{
                                  fen: "rn1qkb1r/1p3ppp/p2ppn2/8/3NP1b1/2N5/PPP1BPPP/R1BQ1RK1 w kq - 2 8",
                                  move: "Be7", category: "main_line",
                                  children: [{
                                    fen: "rnbqk2r/1p2bppp/p2ppn2/8/3NPP2/2N5/PPP1B1PP/R1BQ1RK1 b kq - 0 8",
                                    move: "f4", category: "main_line",
                                    children: [{
                                      fen: "rnbq1rk1/1p2bppp/p2ppn2/8/3NPP2/2N5/PPP1B1PP/R1BQ1RK1 w - - 1 9",
                                      move: "O-O", category: "main_line",
                                      children: [{
                                        fen: "rnbq1rk1/1p2bppp/p2ppn2/8/3NPP2/2N1B3/PPP1B1PP/R2Q1RK1 b - - 2 9",
                                        move: "Be3", category: "main_line",
                                        children: [{
                                          fen: "rn1q1rk1/1p2bppp/p2ppn2/8/3NPP2/2N1B3/PPPbB1PP/R2Q1RK1 w - - 3 10",
                                          move: "Qc7", category: "main_line",
                                          children: []
                                        }]
                                      }]
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          },
                          {
                            fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP1P1/2N5/PPP2P1P/R1BQKB1R b KQkq g3 0 6",
                            move: "Bg5", category: "legit_alternative", variationName: "Najdorf Bg5 (Polugaevsky)",
                            children: []
                          }]
                        },
                        {
                          fen: "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
                          move: "g6", category: "legit_alternative", variationName: "Dragon Variation",
                          children: [{
                            fen: "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6",
                            move: "Be3", category: "main_line",
                            children: [{
                              fen: "rnbqk2r/pp2ppbp/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 2 7",
                              move: "Bg7", category: "main_line",
                              children: [{
                                fen: "rnbqk2r/pp2ppbp/3p1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R b KQkq - 0 7",
                                move: "f3", category: "main_line", variationName: "Yugoslav Attack",
                                children: [{
                                  fen: "rnbq1rk1/pp2ppbp/3p1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQ - 1 8",
                                  move: "O-O", category: "main_line",
                                  children: [{
                                    fen: "rnbq1rk1/pp2ppbp/3p1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R b KQ - 2 8",
                                    move: "Qd2", category: "main_line",
                                    children: [{
                                      fen: "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 3 9",
                                      move: "Nc6", category: "main_line",
                                      children: [{
                                        fen: "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1BP2/PPPQ2PP/R3K2R b KQ - 4 9",
                                        move: "Bc4", category: "main_line",
                                        children: []
                                      }]
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        },
                        {
                          fen: "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 2 6",
                          move: "Nc6", category: "legit_alternative", variationName: "Classical Variation",
                          children: []
                        },
                        {
                          fen: "rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
                          move: "e6", category: "legit_alternative", variationName: "Scheveningen Variation",
                          children: []
                        },
                        {
                          fen: "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5",
                          move: "h6", category: "mistake",
                          explanation: "h6 wastes time. Develop with a6, g6, Nc6 or e6 to build your Sicilian structure.",
                          suggestedMove: "a6", children: []
                        }
                      ]
                    }]
                  }]
                }]
              }]
            }]
          },
          {
            fen: "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
            move: "Nc6", category: "legit_alternative", variationName: "Old Sicilian",
            children: []
          },
          {
            fen: "rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
            move: "e6", category: "legit_alternative", variationName: "Kan / Taimanov",
            children: []
          },
          {
            fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
            move: "a6", category: "mistake",
            explanation: "a6 is too slow. Develop with d6, Nc6, or e6.",
            suggestedMove: "d6", children: []
          }
        ]
      }]
    }]
  }
];

// =============================================
// QUEEN'S GAMBIT
// =============================================
const queensGambitTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
    move: "d4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2",
      move: "d5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
        move: "c4", category: "main_line",
        children: [
          {
            fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
            move: "e6", category: "main_line", variationName: "Queen's Gambit Declined",
            children: [{
              fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
              move: "Nc3", category: "main_line",
              children: [{
                fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
                move: "Nf6", category: "main_line",
                children: [
                  {
                    fen: "rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4",
                    move: "Bg5", category: "main_line",
                    children: [{
                      fen: "rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 4 5",
                      move: "Be7", category: "main_line",
                      children: [{
                        fen: "rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N5/PP1NPPPP/R2QKB1R b KQkq - 5 5",
                        move: "e3", category: "main_line",
                        children: [{
                          fen: "rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR w KQ - 0 6",
                          move: "O-O", category: "main_line",
                          children: [{
                            fen: "rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R b KQ - 1 6",
                            move: "Nf3", category: "main_line",
                            children: [{
                              fen: "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ - 3 7",
                              move: "Nbd7", category: "main_line",
                              children: [{
                                fen: "r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/2RQKB1R b K - 4 7",
                                move: "Rc1", category: "main_line",
                                children: [{
                                  fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2N1PN2/PP3PPP/2RQKB1R w K - 0 8",
                                  move: "c6", category: "main_line",
                                  children: [{
                                    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p2B1/2PP4/2NBPN2/PP3PPP/2RQK2R b K - 1 8",
                                    move: "Bd3", category: "main_line",
                                    children: []
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  },
                  {
                    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4",
                    move: "Nf3", category: "legit_alternative", variationName: "QGD Modern",
                    children: []
                  }
                ]
              }]
            }]
          },
          {
            fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
            move: "dxc4", category: "legit_alternative", variationName: "Queen's Gambit Accepted",
            children: [{
              fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3",
              move: "Nf3", category: "main_line",
              children: [{
                fen: "rnbqkb1r/ppp1pppp/5n2/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4",
                move: "Nf6", category: "main_line",
                children: [{
                  fen: "rnbqkb1r/ppp1pppp/5n2/8/2pP4/4PN2/PP3PPP/RNBQKB1R b KQkq - 0 4",
                  move: "e3", category: "main_line",
                  children: []
                }]
              }]
            }]
          },
          {
            fen: "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
            move: "c6", category: "legit_alternative", variationName: "Slav Defense",
            children: [{
              fen: "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3",
              move: "Nf3", category: "main_line",
              children: [{
                fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4",
                move: "Nf6", category: "main_line",
                children: [{
                  fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4",
                  move: "Nc3", category: "main_line",
                  children: [{
                    fen: "rn1qkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
                    move: "dxc4", category: "main_line", variationName: "Semi-Slav",
                    children: []
                  }]
                }]
              }]
            }]
          },
          {
            fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
            move: "a6", category: "mistake",
            explanation: "a6 doesn't address the center. Respond with e6, dxc4, or c6.",
            suggestedMove: "e6", children: []
          }
        ]
      }]
    }]
  }
];

// =============================================
// KING'S INDIAN DEFENSE
// =============================================
const kingsIndianTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
    move: "d4", category: "main_line",
    children: [{
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [{
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
        move: "c4", category: "main_line",
        children: [{
          fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "g6", category: "main_line",
          children: [{
            fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [{
              fen: "rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
              move: "Bg7", category: "main_line",
              children: [{
                fen: "rnbqk2r/ppppppbp/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 4",
                move: "e4", category: "main_line",
                children: [{
                  fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5",
                  move: "d6", category: "main_line",
                  children: [
                    {
                      fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 5",
                      move: "Nf3", category: "main_line", variationName: "Classical KID",
                      children: [{
                        fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 2 6",
                        move: "O-O", category: "main_line",
                        children: [{
                          fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 3 6",
                          move: "Be2", category: "main_line",
                          children: [{
                            fen: "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ e6 0 7",
                            move: "e5", category: "main_line", variationName: "Classical Main Line",
                            children: [{
                              fen: "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 b - - 1 7",
                              move: "O-O", category: "main_line",
                              children: []
                            }]
                          }]
                        }]
                      }]
                    },
                    {
                      fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq - 0 5",
                      move: "f3", category: "legit_alternative", variationName: "Sämisch Variation",
                      children: [{
                        fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR w KQ - 1 6",
                        move: "O-O", category: "main_line",
                        children: [{
                          fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N1BP2/PP4PP/R2QKBNR b KQ - 2 6",
                          move: "Be3", category: "main_line",
                          children: []
                        }]
                      }]
                    },
                    {
                      fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5",
                      move: "h6", category: "mistake",
                      explanation: "h6 wastes time. Complete development with d6 to build the KID structure.",
                      suggestedMove: "d6", children: []
                    }
                  ]
                }]
              }]
            }]
          }]
        },
        {
          fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
          move: "e6", category: "legit_alternative", variationName: "Nimzo/QID Setup",
          children: []
        },
        {
          fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
          move: "b6", category: "mistake",
          explanation: "b6 is premature. Complete your KID setup with g6 and Bg7 first.",
          suggestedMove: "g6", children: []
        }]
      }]
    }]
  }
];

// =============================================
// FRENCH DEFENSE
// =============================================
const frenchDefenseTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "e6", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
        move: "d4", category: "main_line",
        children: [{
          fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3",
          move: "d5", category: "main_line",
          children: [
            {
              fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3",
              move: "Nc3", category: "main_line",
              children: [
                {
                  fen: "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
                  move: "Bb4", category: "main_line", variationName: "Winawer Variation",
                  children: [{
                    fen: "rnbqk1nr/ppp2ppp/4p3/3pP3/1b1P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4",
                    move: "e5", category: "main_line",
                    children: [{
                      fen: "rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/2N5/PPP2PPP/R1BQKBNR w KQkq c6 0 5",
                      move: "c5", category: "main_line",
                      children: [{
                        fen: "rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/P1N5/1PP2PPP/R1BQKBNR b KQkq - 0 5",
                        move: "a3", category: "main_line",
                        children: [{
                          fen: "rnbqk1nr/pp3ppp/4p3/2ppP3/3P4/P1b5/1PP2PPP/R1BQKBNR w KQkq - 0 6",
                          move: "Bxc3+", category: "main_line",
                          children: [{
                            fen: "rnbqk1nr/pp3ppp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1BQKBNR b KQkq - 0 6",
                            move: "bxc3", category: "main_line",
                            children: []
                          }]
                        }]
                      }]
                    }]
                  }]
                },
                {
                  fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
                  move: "Nf6", category: "legit_alternative", variationName: "Classical French",
                  children: [{
                    fen: "rnbqkb1r/ppp2ppp/4pn2/3p2B1/3PP3/2N5/PPP2PPP/R2QKBNR b KQkq - 3 4",
                    move: "Bg5", category: "main_line",
                    children: [{
                      fen: "rnbqk2r/ppp1bppp/4pn2/3p2B1/3PP3/2N5/PPP2PPP/R2QKBNR w KQkq - 4 5",
                      move: "Be7", category: "main_line",
                      children: [{
                        fen: "rnbqk2r/ppp1bppp/4pn2/3pP1B1/3P4/2N5/PPP2PPP/R2QKBNR b KQkq - 0 5",
                        move: "e5", category: "main_line", variationName: "Classical Main Line",
                        children: []
                      }]
                    }]
                  }]
                },
                {
                  fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3",
                  move: "a6", category: "mistake",
                  explanation: "a6 is too passive. Choose Bb4 (Winawer) or Nf6 (Classical) for active play.",
                  suggestedMove: "Bb4", children: []
                }
              ]
            },
            {
              fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
              move: "e5", category: "legit_alternative", variationName: "Advance Variation",
              children: [{
                fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq c6 0 4",
                move: "c5", category: "main_line",
                children: [{
                  fen: "rnbqkbnr/pp3ppp/4p3/2ppP3/3P4/3B4/PPP2PPP/RNBQK1NR b KQkq - 1 4",
                  move: "c3", category: "main_line",
                  children: [{
                    fen: "r1bqkbnr/pp3ppp/2n1p3/2ppP3/3P4/3B4/PPP2PPP/RNBQK1NR w KQkq - 2 5",
                    move: "Nc6", category: "main_line",
                    children: [{
                      fen: "r1bqkbnr/pp3ppp/2n1p3/2ppP3/3P4/2PB4/PP3PPP/RNBQK1NR b KQkq - 0 5",
                      move: "Nf3", category: "main_line",
                      children: []
                    }]
                  }]
                }]
              }]
            },
            {
              fen: "rnbqkbnr/ppp2ppp/4p3/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
              move: "exd5", category: "legit_alternative", variationName: "Exchange Variation",
              children: [{
                fen: "rnbqkbnr/ppp2ppp/8/3pp3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
                move: "exd5", category: "main_line",
                children: [{
                  fen: "rnbqkbnr/ppp2ppp/8/3pp3/3P4/5N2/PPP2PPP/RNBQKB1R b KQkq - 1 4",
                  move: "Nf3", category: "main_line",
                  children: []
                }]
              }]
            }
          ]
        }]
      }]
    }]
  }
];

// =============================================
// CARO-KANN DEFENSE
// =============================================
const caroKannTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "c6", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
        move: "d4", category: "main_line",
        children: [{
          fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3",
          move: "d5", category: "main_line",
          children: [
            {
              fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3",
              move: "Nc3", category: "main_line",
              children: [{
                fen: "rnbqkbnr/pp2pppp/2p5/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4",
                move: "dxe4", category: "main_line",
                children: [{
                  fen: "rnbqkbnr/pp2pppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR b KQkq - 0 4",
                  move: "Nxe4", category: "main_line",
                  children: [
                    {
                      fen: "rn1qkbnr/pp2pppp/2p5/5b2/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5",
                      move: "Bf5", category: "main_line", variationName: "Classical Caro-Kann",
                      children: [{
                        fen: "rn1qkbnr/pp2pppp/2p5/5b2/3P4/4N3/PPP2PPP/R1BQKBNR b KQkq - 2 5",
                        move: "Ng3", category: "main_line",
                        children: [{
                          fen: "rn1qkbnr/pp2pppp/2p5/8/3P4/4N1b1/PPP2PPP/R1BQKBNR w KQkq - 3 6",
                          move: "Bg6", category: "main_line",
                          children: [{
                            fen: "rn1qkbnr/pp2pppp/2p5/8/3P4/4NNb1/PPP2PPP/R1BQKB1R b KQkq - 4 6",
                            move: "h4", category: "main_line",
                            children: [{
                              fen: "rn1qkbnr/pp2pppp/2p5/8/3P3h/4NNb1/PPP2PPP/R1BQKB1R w KQkq - 0 7",
                              move: "h6", category: "main_line",
                              children: []
                            }]
                          }]
                        }]
                      }]
                    },
                    {
                      fen: "r1bqkbnr/pp2pppp/2n5/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5",
                      move: "Nd7", category: "legit_alternative", variationName: "Modern Caro-Kann",
                      children: [{
                        fen: "r1bqkbnr/pp2pppp/2n5/8/3P4/4N3/PPP2PPP/R1BQKBNR b KQkq - 2 5",
                        move: "Ng3", category: "main_line",
                        children: [{
                          fen: "r1bqkb1r/pp2pppp/2n2n2/8/3P4/4N3/PPP2PPP/R1BQKBNR w KQkq - 3 6",
                          move: "Ngf6", category: "main_line",
                          children: []
                        }]
                      }]
                    },
                    {
                      fen: "rnbqkb1r/pp2pppp/2p2n2/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5",
                      move: "Nf6", category: "mistake",
                      explanation: "Nf6 allows Nxf6+ damaging your pawn structure. Play Bf5 first.",
                      suggestedMove: "Bf5", children: []
                    }
                  ]
                }]
              }]
            },
            {
              fen: "rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
              move: "e5", category: "legit_alternative", variationName: "Advance Caro-Kann",
              children: [{
                fen: "rn1qkbnr/pp2pppp/2p5/3pP3/3P2b1/8/PPP2PPP/RNBQKBNR w KQkq - 1 4",
                move: "Bf5", category: "main_line",
                children: [{
                  fen: "rn1qkbnr/pp2pppp/2p5/3pP3/3P2b1/3B4/PPP2PPP/RNBQK1NR b KQkq - 2 4",
                  move: "Bd3", category: "main_line",
                  children: [{
                    fen: "rn1qkbnr/pp2pppp/2p5/3pP3/3P4/3b4/PPP2PPP/RNBQK1NR w KQkq - 0 5",
                    move: "Bxd3", category: "main_line",
                    children: [{
                      fen: "rn1qkbnr/pp2pppp/2p5/3pP3/3P4/3Q4/PPP2PPP/RNB1K1NR b KQkq - 0 5",
                      move: "Qxd3", category: "main_line",
                      children: []
                    }]
                  }]
                }]
              }]
            },
            {
              fen: "rnbqkbnr/pp2pppp/2p5/8/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
              move: "exd5", category: "legit_alternative", variationName: "Exchange Caro-Kann",
              children: [{
                fen: "rnbqkbnr/pp2pppp/8/2pp4/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
                move: "cxd5", category: "main_line",
                children: []
              }]
            }
          ]
        }]
      }]
    }]
  }
];

// =============================================
// RUY LÓPEZ
// =============================================
const ruyLopezTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
      move: "e5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        move: "Nf3", category: "main_line",
        children: [{
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          move: "Nc6", category: "main_line",
          children: [{
            fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
            move: "Bb5", category: "main_line",
            children: [
              {
                fen: "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
                move: "a6", category: "main_line", variationName: "Morphy Defense",
                children: [{
                  fen: "r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 4",
                  move: "Ba4", category: "main_line",
                  children: [{
                    fen: "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5",
                    move: "Nf6", category: "main_line",
                    children: [{
                      fen: "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 3 5",
                      move: "O-O", category: "main_line",
                      children: [{
                        fen: "r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 4 6",
                        move: "Be7", category: "main_line", variationName: "Closed Ruy López",
                        children: [{
                          fen: "r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQR1K1 b kq - 5 6",
                          move: "Re1", category: "main_line",
                          children: [{
                            fen: "r1bqk2r/2ppbppp/p1n2n2/1p2p3/B3P3/5N2/PPPP1PPP/RNBQR1K1 w kq b6 0 7",
                            move: "b5", category: "main_line",
                            children: [{
                              fen: "r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 b kq - 1 7",
                              move: "Bb3", category: "main_line",
                              children: [{
                                fen: "r1bqk2r/2p1bppp/p1np1n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 w kq - 0 8",
                                move: "d6", category: "main_line",
                                children: [{
                                  fen: "r1bqk2r/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 b kq - 0 8",
                                  move: "c3", category: "main_line",
                                  children: [{
                                    fen: "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w - - 1 9",
                                    move: "O-O", category: "main_line",
                                    children: [{
                                      fen: "r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 b - - 0 9",
                                      move: "h3", category: "main_line",
                                      children: [{
                                        fen: "r1bq1rk1/2p1bppp/p1n2n2/1p1pp3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 w - - 0 10",
                                        move: "d5", category: "main_line",
                                        children: []
                                      }]
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              },
              {
                fen: "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
                move: "Nf6", category: "legit_alternative", variationName: "Berlin Defense",
                children: [{
                  fen: "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
                  move: "O-O", category: "main_line",
                  children: [{
                    fen: "r1bqkb1r/pppp1ppp/2n5/1B2p3/4n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 5",
                    move: "Nxe4", category: "main_line", variationName: "Berlin Wall",
                    children: []
                  }]
                }]
              },
              {
                fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                move: "d6", category: "legit_alternative", variationName: "Old Steinitz Defense",
                children: []
              },
              {
                fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                move: "h6", category: "mistake",
                explanation: "h6 wastes time. Play a6 (Morphy Defense) or Nf6 (Berlin) to develop.",
                suggestedMove: "a6", children: []
              }
            ]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// LONDON SYSTEM
// =============================================
const londonSystemTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [{
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [{
        fen: "rnbqkb1r/pppppppp/5n2/8/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2",
        move: "Bf4", category: "main_line",
        children: [
          // MAIN: 2...d5 — the standard London
          {
            fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 0 3",
            move: "d5", category: "main_line",
            children: [{
              fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 3",
              move: "e3", category: "main_line",
              children: [
                // 3...e6 — Classical London
                {
                  fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4",
                  move: "e6", category: "main_line", variationName: "Classical London",
                  children: [{
                    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3P1B2/4P3/PPPN1PPP/R2QKBNR b KQkq - 1 4",
                    move: "Nd2", category: "main_line",
                    children: [{
                      fen: "rnbqkb1r/pp3ppp/4pn2/2pp4/3P1B2/4P3/PPPN1PPP/R2QKBNR w KQkq - 0 5",
                      move: "c5", category: "main_line",
                      children: [{
                        fen: "rnbqkb1r/pp3ppp/4pn2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR b KQkq - 0 5",
                        move: "c3", category: "main_line",
                        children: [{
                          fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR w KQkq - 1 6",
                          move: "Nc6", category: "main_line",
                          children: [{
                            fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2P1PN2/PP1N1PPP/R2QKB1R b KQkq - 2 6",
                            move: "Ngf3", category: "main_line",
                            children: [{
                              fen: "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P1B2/2P1PN2/PP1N1PPP/R2QKB1R w KQkq - 3 7",
                              move: "Bd6", category: "main_line",
                              children: [{
                                fen: "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P4/2P1PNB1/PP1N1PPP/R2QKB1R b KQkq - 4 7",
                                move: "Bg3", category: "main_line",
                                children: [{
                                  fen: "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2P1PNB1/PP1N1PPP/R2QKB1R w KQ - 5 8",
                                  move: "O-O", category: "main_line",
                                  children: [{
                                    fen: "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2PBPNB1/PP1N1PPP/R2QK2R b KQ - 6 8",
                                    move: "Bd3", category: "main_line",
                                    children: [{
                                      fen: "r1bq1rk1/p4ppp/1pnbpn2/2pp4/3P4/2PBPNB1/PP1N1PPP/R2QK2R w KQ - 0 9",
                                      move: "b6", category: "main_line",
                                      children: [{
                                        fen: "r1bq1rk1/p4ppp/1pnbpn2/2ppN3/3P4/2PBP1B1/PP1N1PPP/R2QK2R b KQ - 1 9",
                                        move: "Ne5", category: "main_line",
                                        children: [{
                                          fen: "r2q1rk1/pb3ppp/1pnbpn2/2ppN3/3P4/2PBP1B1/PP1N1PPP/R2QK2R w KQ - 2 10",
                                          move: "Bb7", category: "main_line",
                                          children: [{
                                            fen: "r2q1rk1/pb3ppp/1pnbpn2/2ppN3/3P1P2/2PBP1B1/PP1N2PP/R2QK2R b KQ - 0 10",
                                            move: "f4", category: "main_line",
                                            children: []
                                          }]
                                        }]
                                      }]
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                },
                // 3...c5 — Early c5 Counter
                {
                  fen: "rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4",
                  move: "c5", category: "legit_alternative", variationName: "Early c5 Counter",
                  children: [{
                    fen: "rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/2P1P3/PP3PPP/RN1QKBNR b KQkq - 0 4",
                    move: "c3", category: "main_line",
                    children: [{
                      fen: "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P1B2/2P1P3/PP3PPP/RN1QKBNR w KQkq - 1 5",
                      move: "Nc6", category: "main_line",
                      children: [{
                        fen: "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR b KQkq - 2 5",
                        move: "Nd2", category: "main_line",
                        children: [{
                          fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR w KQkq - 0 6",
                          move: "e6", category: "main_line",
                          children: [{
                            fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2P1PN2/PP1N1PPP/R2QKB1R b KQkq - 1 6",
                            move: "Ngf3", category: "main_line",
                            children: [{
                              fen: "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P1B2/2P1PN2/PP1N1PPP/R2QKB1R w KQkq - 2 7",
                              move: "Bd6", category: "main_line",
                              children: [{
                                fen: "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P4/2P1PNB1/PP1N1PPP/R2QKB1R b KQkq - 3 7",
                                move: "Bg3", category: "main_line",
                                children: [{
                                  fen: "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2P1PNB1/PP1N1PPP/R2QKB1R w KQ - 4 8",
                                  move: "O-O", category: "main_line",
                                  children: [{
                                    fen: "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2PBPNB1/PP1N1PPP/R2QK2R b KQ - 5 8",
                                    move: "Bd3", category: "main_line",
                                    children: []
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                },
                // 3...Bf5 — Bishop Sortie
                {
                  fen: "rn1qkb1r/ppp1pppp/5n2/3p1b2/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 1 4",
                  move: "Bf5", category: "legit_alternative", variationName: "Bishop Sortie",
                  children: [{
                    fen: "rn1qkb1r/ppp1pppp/5n2/3p1b2/3P1B2/3BP3/PPP2PPP/RN1QK1NR b KQkq - 2 4",
                    move: "Bd3", category: "main_line",
                    children: [{
                      fen: "rn1qkb1r/ppp1pppp/5n2/3p4/3P1B2/3bP3/PPP2PPP/RN1QK1NR w KQkq - 0 5",
                      move: "Bxd3", category: "main_line",
                      children: [{
                        fen: "rn1qkb1r/ppp1pppp/5n2/3p4/3P1B2/3QP3/PPP2PPP/RN2K1NR b KQkq - 0 5",
                        move: "Qxd3", category: "main_line",
                        children: [{
                          fen: "rn1qkb1r/ppp2ppp/4pn2/3p4/3P1B2/3QP3/PPP2PPP/RN2K1NR w KQkq - 0 6",
                          move: "e6", category: "main_line",
                          children: [{
                            fen: "rn1qkb1r/ppp2ppp/4pn2/3p4/3P1B2/3QP3/PPPN1PPP/R3K1NR b KQkq - 1 6",
                            move: "Nd2", category: "main_line",
                            children: [{
                              fen: "rn1qkb1r/pp3ppp/4pn2/2pp4/3P1B2/3QP3/PPPN1PPP/R3K1NR w KQkq - 0 7",
                              move: "c5", category: "main_line",
                              children: [{
                                fen: "rn1qkb1r/pp3ppp/4pn2/2pp4/3P1B2/2PQP3/PP1N1PPP/R3K1NR b KQkq - 0 7",
                                move: "c3", category: "main_line",
                                children: [{
                                  fen: "r2qkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2PQP3/PP1N1PPP/R3K1NR w KQkq - 1 8",
                                  move: "Nc6", category: "main_line",
                                  children: [{
                                    fen: "r2qkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2PQPN2/PP1N1PPP/R3K2R b KQkq - 2 8",
                                    move: "Ngf3", category: "main_line",
                                    children: [{
                                      fen: "r2qk2r/pp3ppp/2nbpn2/2pp4/3P1B2/2PQPN2/PP1N1PPP/R3K2R w KQkq - 3 9",
                                      move: "Bd6", category: "main_line",
                                      children: [{
                                        fen: "r2qk2r/pp3ppp/2nbpn2/2pp4/3P4/2PQPNB1/PP1N1PPP/R3K2R b KQkq - 4 9",
                                        move: "Bg3", category: "main_line",
                                        children: []
                                      }]
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                },
                // 3...g6 — King's Indian setup vs London
                {
                  fen: "rnbqkb1r/ppp1pp1p/5np1/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4",
                  move: "g6", category: "mistake",
                  explanation: "g6 is inaccurate here — it delays development. Better to play e6 or c5 to challenge the center.",
                  suggestedMove: "e6",
                  children: []
                }
              ]
            }]
          },
          // ALT: 2...c5 — Benoni-style counter
          {
            fen: "rnbqkb1r/pp1ppppp/5n2/2p5/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 0 3",
            move: "c5", category: "legit_alternative", variationName: "c5 Counter",
            children: [{
              fen: "rnbqkb1r/pp1ppppp/5n2/2pP4/5B2/8/PPP1PPPP/RN1QKBNR b KQkq - 0 3",
              move: "d5", category: "main_line",
              children: [{
                fen: "rnbqkb1r/pp2pppp/5n2/2pP4/5B2/8/PPP1PPPP/RN1QKBNR w KQkq - 0 4",
                move: "d6", category: "main_line",
                children: [{
                  fen: "rnbqkb1r/pp2pppp/5n2/2pP4/5B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 4",
                  move: "e3", category: "main_line",
                  children: []
                }]
              }]
            }]
          },
          // ALT: 2...e6 — transposing into QGD-like
          {
            fen: "rnbqkb1r/pppp1ppp/4pn2/8/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 0 3",
            move: "e6", category: "legit_alternative", variationName: "Anti-London with e6",
            children: [{
              fen: "rnbqkb1r/pppp1ppp/4pn2/8/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 3",
              move: "e3", category: "main_line",
              children: [{
                fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4",
                move: "d5", category: "main_line",
                children: [{
                  fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3P1B2/4P3/PPPN1PPP/R2QKBNR b KQkq - 1 4",
                  move: "Nd2", category: "main_line",
                  children: [{
                    fen: "rnbqkb1r/pp3ppp/4pn2/2pp4/3P1B2/4P3/PPPN1PPP/R2QKBNR w KQkq - 0 5",
                    move: "c5", category: "main_line",
                    children: [{
                      fen: "rnbqkb1r/pp3ppp/4pn2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR b KQkq - 0 5",
                      move: "c3", category: "main_line",
                      children: []
                    }]
                  }]
                }]
              }]
            }]
          }
        ]
      }]
    },
    {
      fen: "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      move: "d5", category: "legit_alternative", variationName: "Symmetrical d5",
      children: [{
        fen: "rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2",
        move: "Bf4", category: "main_line",
        children: [{
          fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 2 3",
          move: "Nf6", category: "main_line",
          children: [{
            fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 3",
            move: "e3", category: "main_line",
            children: [{
              fen: "rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4",
              move: "c5", category: "main_line",
              children: [{
                fen: "rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/2P1P3/PP3PPP/RN1QKBNR b KQkq - 0 4",
                move: "c3", category: "main_line",
                children: [{
                  fen: "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P1B2/2P1P3/PP3PPP/RN1QKBNR w KQkq - 1 5",
                  move: "Nc6", category: "main_line",
                  children: [{
                    fen: "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR b KQkq - 2 5",
                    move: "Nd2", category: "main_line",
                    children: [{
                      fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR w KQkq - 0 6",
                      move: "e6", category: "main_line",
                      children: [{
                        fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2P1PN2/PP1N1PPP/R2QKB1R b KQkq - 1 6",
                        move: "Ngf3", category: "main_line",
                        children: [{
                          fen: "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P1B2/2P1PN2/PP1N1PPP/R2QKB1R w KQkq - 2 7",
                          move: "Bd6", category: "main_line",
                          children: [{
                            fen: "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P4/2P1PNB1/PP1N1PPP/R2QKB1R b KQkq - 3 7",
                            move: "Bg3", category: "main_line",
                            children: []
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// SCOTCH GAME
// =============================================
const scotchGameTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
      move: "e5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        move: "Nf3", category: "main_line",
        children: [{
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          move: "Nc6", category: "main_line",
          children: [{
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3",
            move: "d4", category: "main_line",
            children: [
              {
                fen: "r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
                move: "exd4", category: "main_line",
                children: [{
                  fen: "r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4",
                  move: "Nxd4", category: "main_line",
                  children: [
                    {
                      fen: "r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5",
                      move: "Bc5", category: "main_line", variationName: "Classical Scotch",
                      children: [{
                        fen: "r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/8/PPP1BPPP/RNBQK2R b KQkq - 2 5",
                        move: "Be3", category: "main_line",
                        children: [{
                          fen: "r1bqk2r/pppp1ppp/2n2n2/2b5/3NP3/4B3/PPP2PPP/RN1QKB1R w KQkq - 3 6",
                          move: "Qf6", category: "main_line",
                          children: []
                        }]
                      }]
                    },
                    {
                      fen: "r1bqkb1r/pppp1ppp/2n2n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5",
                      move: "Nf6", category: "legit_alternative", variationName: "Scotch Four Knights",
                      children: []
                    }
                  ]
                }]
              },
              {
                fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3",
                move: "d6", category: "mistake",
                explanation: "d6 is too passive. Take the pawn with exd4 to challenge the center.",
                suggestedMove: "exd4", children: []
              }
            ]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// DUTCH DEFENSE
// =============================================
const dutchDefenseTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
    move: "d4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq f6 0 2",
      move: "f5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/ppppp1pp/8/5p2/3P4/6P1/PPP1PP1P/RNBQKBNR b KQkq - 0 2",
        move: "g3", category: "main_line",
        children: [{
          fen: "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/6P1/PPP1PP1P/RNBQKBNR w KQkq - 1 3",
          move: "Nf6", category: "main_line",
          children: [{
            fen: "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR b KQkq - 2 3",
            move: "Bg2", category: "main_line",
            children: [{
              fen: "rnbqkb1r/pppp2pp/4pn2/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR w KQkq - 0 4",
              move: "e6", category: "main_line", variationName: "Classical Dutch",
              children: [{
                fen: "rnbqkb1r/pppp2pp/4pn2/5p2/3P4/6P1/PPP1PPBP/RNBQK2R b KQkq - 1 4",
                move: "Nf3", category: "main_line",
                children: [{
                  fen: "rnbqk2r/pppp2pp/4pn2/5p2/3P4/6P1/PPP1PPBP/RNBQK2R w KQkq - 0 5",
                  move: "Be7", category: "main_line",
                  children: [{
                    fen: "rnbqk2r/pppp2pp/4pn2/5p2/3P4/6P1/PPP1PPBP/RNBQ1RK1 b kq - 1 5",
                    move: "O-O", category: "main_line",
                    children: [{
                      fen: "rnbq1rk1/pppp2pp/4pn2/5p2/3P4/6P1/PPP1PPBP/RNBQ1RK1 w - - 2 6",
                      move: "O-O", category: "main_line",
                      children: [{
                        fen: "rnbq1rk1/pppp2pp/4pn2/5p2/3P4/2P3P1/PP2PPBP/RNBQ1RK1 b - - 0 6",
                        move: "c3", category: "main_line",
                        children: []
                      }]
                    }]
                  }]
                }]
              }]
            },
            {
              fen: "rnbqkb1r/ppppp2p/5np1/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR w KQkq - 0 4",
              move: "g6", category: "legit_alternative", variationName: "Leningrad Dutch",
              children: [{
                fen: "rnbqkb1r/ppppp2p/5np1/5p2/3P4/5NP1/PPP1PPBP/RNBQK2R b KQkq - 1 4",
                move: "Nf3", category: "main_line",
                children: [{
                  fen: "rnbqk2r/ppppp2p/5npb/5p2/3P4/5NP1/PPP1PPBP/RNBQK2R w KQkq - 2 5",
                  move: "Bg7", category: "main_line",
                  children: []
                }]
              }]
            },
            {
              fen: "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/6P1/PPP1PPBP/RNBQK1NR b KQkq - 2 3",
              move: "d5", category: "legit_alternative", variationName: "Stonewall Dutch",
              children: []
            }]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// PIRC DEFENSE
// =============================================
const pircDefenseTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "d6", category: "main_line",
      children: [{
        fen: "rnbqkbnr/ppp1pppp/3p4/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
        move: "d4", category: "main_line",
        children: [{
          fen: "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3",
          move: "Nf6", category: "main_line",
          children: [{
            fen: "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 3",
            move: "Nc3", category: "main_line",
            children: [{
              fen: "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4",
              move: "g6", category: "main_line",
              children: [
                {
                  fen: "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 1 4",
                  move: "Nf3", category: "main_line", variationName: "Classical Pirc",
                  children: [{
                    fen: "rnbqk2r/ppp1ppbp/3p1np1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 2 5",
                    move: "Bg7", category: "main_line",
                    children: [{
                      fen: "rnbqk2r/ppp1ppbp/3p1np1/8/3PP3/2N2N2/PPP1BPPP/R1BQK2R b KQkq - 3 5",
                      move: "Be2", category: "main_line",
                      children: [{
                        fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/3PP3/2N2N2/PPP1BPPP/R1BQK2R w KQ - 4 6",
                        move: "O-O", category: "main_line",
                        children: []
                      }]
                    }]
                  }]
                },
                {
                  fen: "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N2P2/PPP3PP/R1BQKBNR b KQkq - 0 4",
                  move: "f3", category: "legit_alternative", variationName: "Austrian Attack",
                  children: [{
                    fen: "rnbqk2r/ppp1ppbp/3p1np1/8/3PP3/2N2P2/PPP3PP/R1BQKBNR w KQkq - 1 5",
                    move: "Bg7", category: "main_line",
                    children: [{
                      fen: "rnbqk2r/ppp1ppbp/3p1np1/8/3PP3/2N1BP2/PPP3PP/R2QKBNR b KQkq - 2 5",
                      move: "Be3", category: "main_line",
                      children: []
                    }]
                  }]
                }
              ]
            }]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// SCANDINAVIAN DEFENSE
// =============================================
const scandinavianTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
      move: "d5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2",
        move: "exd5", category: "main_line",
        children: [
          {
            fen: "rnb1kbnr/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3",
            move: "Qxd5", category: "main_line", variationName: "Scandinavian with Qxd5",
            children: [{
              fen: "rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 3",
              move: "Nc3", category: "main_line",
              children: [
                {
                  fen: "rnb1kbnr/ppp1pppp/8/8/3q4/2N5/PPPP1PPP/R1BQKBNR w KQkq - 0 4",
                  move: "Qa5", category: "main_line", variationName: "Qa5 Scandinavian",
                  children: [{
                    fen: "rnb1kbnr/ppp1pppp/8/q7/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq d3 0 4",
                    move: "d4", category: "main_line",
                    children: [{
                      fen: "r1b1kbnr/ppp1pppp/2n5/q7/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 5",
                      move: "Nf6", category: "main_line",
                      children: [{
                        fen: "r1b1kbnr/ppp1pppp/2n5/q7/3P4/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 2 5",
                        move: "Nf3", category: "main_line",
                        children: []
                      }]
                    }]
                  }]
                },
                {
                  fen: "rnb1kbnr/ppp1pppp/8/8/8/2Nq4/PPPP1PPP/R1BQKBNR w KQkq - 0 4",
                  move: "Qd6", category: "legit_alternative", variationName: "Qd6 Scandinavian",
                  children: []
                }
              ]
            }]
          },
          {
            fen: "rnbqkb1r/ppp1pppp/5n2/3P4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3",
            move: "Nf6", category: "legit_alternative", variationName: "Modern Scandinavian",
            children: [{
              fen: "rnbqkb1r/ppp1pppp/5n2/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq d3 0 3",
              move: "d4", category: "main_line",
              children: [{
                fen: "rnbqkb1r/ppp1pppp/8/3n4/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
                move: "Nxd5", category: "main_line",
                children: []
              }]
            }]
          }
        ]
      }]
    }]
  }
];

// =============================================
// ENGLISH OPENING
// =============================================
const englishOpeningTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1",
    move: "c4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq e6 0 2",
      move: "e5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pppp1ppp/8/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq - 1 2",
        move: "Nc3", category: "main_line",
        children: [
          {
            fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq - 2 3",
            move: "Nf6", category: "main_line",
            children: [{
              fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR b KQkq - 0 3",
              move: "g3", category: "main_line", variationName: "Reversed Sicilian",
              children: [{
                fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq - 1 4",
                move: "Bc5", category: "main_line",
                children: [{
                  fen: "rnbqk2r/pppp1ppp/5n2/2b1p3/2P5/2N3P1/PP1PPPBP/R1BQK1NR b KQkq - 2 4",
                  move: "Bg2", category: "main_line",
                  children: [{
                    fen: "rnbq1rk1/pppp1ppp/5n2/2b1p3/2P5/2N3P1/PP1PPPBP/R1BQK1NR w KQ - 3 5",
                    move: "O-O", category: "main_line",
                    children: [{
                      fen: "rnbq1rk1/pppp1ppp/5n2/2b1p3/2P5/2N3P1/PP1PPPBP/R1BQK1NR w KQ - 3 5",
                      move: "Nf3", category: "main_line",
                      children: [{
                        fen: "rnbq1rk1/ppp2ppp/3p1n2/2b1p3/2P5/2N2NP1/PP1PPPBP/R1BQK2R b KQ - 0 5",
                        move: "d6", category: "main_line",
                        children: [{
                          fen: "rnbq1rk1/ppp2ppp/3p1n2/2b1p3/2P5/2N2NP1/PP1PPPBP/R1BQ1RK1 b - - 1 6",
                          move: "O-O", category: "main_line",
                          children: [{
                            fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2P5/2N2NP1/PP1PPPBP/R1BQ1RK1 w - - 2 7",
                            move: "Nc6", category: "main_line",
                            children: [{
                              fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2P1P3/2N2NP1/PP1P1PBP/R1BQ1RK1 b - - 0 7",
                              move: "e3", category: "main_line",
                              children: []
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          },
          {
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq - 2 3",
            move: "Nc6", category: "legit_alternative", variationName: "Four Knights English",
            children: []
          },
          {
            fen: "rnbqkbnr/pppp1ppp/8/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq - 1 2",
            move: "d6", category: "legit_alternative", variationName: "Closed English",
            children: []
          }
        ]
      },
      {
        fen: "rnbqkb1r/pppppppp/5n2/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 1 2",
        move: "Nf6", category: "legit_alternative", variationName: "English with Nf6",
        children: []
      }]
    }]
  }
];

// =============================================
// NIMZO-INDIAN DEFENSE
// =============================================
const nimzoIndianTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
    move: "d4", category: "main_line",
    children: [{
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [{
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
        move: "c4", category: "main_line",
        children: [{
          fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "e6", category: "main_line",
          children: [{
            fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [{
              fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
              move: "Bb4", category: "main_line", variationName: "Nimzo-Indian Defense",
              children: [
                {
                  fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP1QPPPP/R1B1KBNR b KQkq - 3 4",
                  move: "Qc2", category: "main_line", variationName: "Classical Nimzo",
                  children: [{
                    fen: "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2N5/PP1QPPPP/R1B1KBNR w KQ - 4 5",
                    move: "O-O", category: "main_line",
                    children: [{
                      fen: "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2N5/PP1QPPPP/R1B1KBNR w KQ d6 0 6",
                      move: "d5", category: "main_line",
                      children: []
                    }]
                  }]
                },
                {
                  fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR b KQkq - 0 4",
                  move: "e3", category: "legit_alternative", variationName: "Rubinstein Nimzo",
                  children: [{
                    fen: "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQ - 1 5",
                    move: "O-O", category: "main_line",
                    children: [{
                      fen: "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQ d6 0 6",
                      move: "d5", category: "main_line",
                      children: [{
                        fen: "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2N1PN2/PP3PPP/R1BQKB1R b KQ - 1 6",
                        move: "Nf3", category: "main_line",
                        children: []
                      }]
                    }]
                  }]
                },
                {
                  fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
                  move: "a6", category: "mistake",
                  explanation: "a6 wastes time. Pin the knight with Bb4 to fight for the center.",
                  suggestedMove: "Bb4", children: []
                }
              ]
            }]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// GRÜNFELD DEFENSE
// =============================================
const grunfeldTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
    move: "d4", category: "main_line",
    children: [{
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [{
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
        move: "c4", category: "main_line",
        children: [{
          fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "g6", category: "main_line",
          children: [{
            fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [{
              fen: "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq d6 0 4",
              move: "d5", category: "main_line", variationName: "Grünfeld Defense",
              children: [
                {
                  fen: "rnbqkb1r/ppp1pp1p/5np1/3P4/2P5/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 4",
                  move: "cxd5", category: "main_line",
                  children: [{
                    fen: "rnbqkb1r/ppp1pp1p/6p1/3n4/2P5/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5",
                    move: "Nxd5", category: "main_line",
                    children: [{
                      fen: "rnbqkb1r/ppp1pp1p/6p1/3n4/2P1P3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 5",
                      move: "e4", category: "main_line", variationName: "Exchange Grünfeld",
                      children: [{
                        fen: "rnbqkb1r/ppp1pp1p/6p1/8/2PnP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 6",
                        move: "Nxc3", category: "main_line",
                        children: [{
                          fen: "rnbqkb1r/ppp1pp1p/6p1/8/2P1P3/2b5/PP3PPP/R1BQKBNR w KQkq - 0 6",
                          move: "bxc3", category: "main_line",
                          children: [{
                            fen: "rnbqk2r/ppp1ppbp/6p1/8/2P1P3/2b5/PP3PPP/R1BQKBNR w KQkq - 1 7",
                            move: "Bg7", category: "main_line",
                            children: []
                          }]
                        }]
                      }]
                    }]
                  }]
                },
                {
                  fen: "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 2 4",
                  move: "Nf3", category: "legit_alternative", variationName: "Russian System",
                  children: [{
                    fen: "rnbqk2r/ppp1ppbp/5np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 3 5",
                    move: "Bg7", category: "main_line",
                    children: []
                  }]
                }
              ]
            },
            {
              fen: "rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
              move: "Bg7", category: "legit_alternative", variationName: "King's Indian instead",
              children: []
            }]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// ALEKHINE'S DEFENSE
// =============================================
const alekhineTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [{
        fen: "rnbqkb1r/pppppppp/5n2/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2",
        move: "e5", category: "main_line",
        children: [{
          fen: "rnbqkb1r/pppppppp/8/4P3/3n4/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3",
          move: "Nd5", category: "main_line",
          children: [
            {
              fen: "rnbqkb1r/pppppppp/8/4P3/3nP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
              move: "d4", category: "main_line", variationName: "Four Pawns Attack",
              children: [{
                fen: "rnbqkb1r/ppp1pppp/3p4/4P3/3nP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
                move: "d6", category: "main_line",
                children: [{
                  fen: "rnbqkb1r/ppp1pppp/3p4/4P3/3nP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 1 4",
                  move: "Nf3", category: "main_line",
                  children: [{
                    fen: "rnbqkb1r/ppp1pppp/8/4p3/3nP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 5",
                    move: "dxe5", category: "main_line",
                    children: [{
                      fen: "rnbqkb1r/ppp1pppp/8/4p3/3nP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 5",
                      move: "Nc3", category: "main_line",
                      children: []
                    }]
                  }]
                }]
              }]
            },
            {
              fen: "rnbqkb1r/pppppppp/8/4P3/3n4/3P4/PPP2PPP/RNBQKBNR b KQkq - 0 3",
              move: "d3", category: "legit_alternative", variationName: "Exchange Variation",
              children: [{
                fen: "rnbqkb1r/ppp1pppp/3p4/4P3/3n4/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 4",
                move: "d6", category: "main_line",
                children: [{
                  fen: "rnbqkb1r/ppp1pppp/3p4/8/3n4/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 4",
                  move: "exd6", category: "main_line",
                  children: []
                }]
              }]
            },
            {
              fen: "rnbqkb1r/pppppppp/8/4P3/3n4/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3",
              move: "d6", category: "legit_alternative", variationName: "Modern Alekhine",
              children: []
            },
            {
              fen: "rnbqkb1r/pppppppp/8/4P3/3n4/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3",
              move: "Nc6", category: "mistake",
              explanation: "Nc6 blocks the c-pawn. Play Nd5 to provoke White's pawns forward.",
              suggestedMove: "Nd5", children: []
            }
          ]
        }]
      }]
    }]
  }
];

// =============================================
// VIENNA GAME
// =============================================
const viennaGameTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "e5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2",
        move: "Nc3", category: "main_line",
        children: [
          {
            fen: "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3",
            move: "Nf6", category: "main_line",
            children: [
              {
                fen: "rnbqkb1r/pppp1ppp/5n2/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq - 0 3",
                move: "f4", category: "main_line", variationName: "Vienna Gambit",
                children: [{
                  fen: "rnbqkb1r/ppp2ppp/5n2/3pp3/4PP2/2N5/PPPP2PP/R1BQKBNR w KQkq - 0 4",
                  move: "d5", category: "main_line",
                  children: [{
                    fen: "rnbqkb1r/ppp2ppp/5n2/3pP3/4P3/2N5/PPPP2PP/R1BQKBNR b KQkq - 0 4",
                    move: "fxe5", category: "main_line",
                    children: [{
                      fen: "rnbqkb1r/ppp2ppp/8/3pP3/4n3/2N5/PPPP2PP/R1BQKBNR w KQkq - 0 5",
                      move: "Nxe4", category: "main_line",
                      children: [{
                        fen: "rnbqkb1r/ppp2ppp/8/3pP3/4n3/2N2N2/PPPP2PP/R1BQKB1R b KQkq - 1 5",
                        move: "Nf3", category: "main_line",
                        children: [{
                          fen: "rn1qkb1r/ppp2ppp/8/3pP3/4n1b1/2N2N2/PPPP2PP/R1BQKB1R w KQkq - 2 6",
                          move: "Bg4", category: "main_line",
                          children: [{
                            fen: "rn1qkb1r/ppp2ppp/8/3pP3/4n1b1/2N2N2/PPPPB1PP/R1BQK2R b KQkq - 3 6",
                            move: "Be2", category: "main_line",
                            children: []
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              },
              {
                fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR b KQkq - 3 3",
                move: "Bc4", category: "legit_alternative", variationName: "Vienna Italian",
                children: [{
                  fen: "rnbqkb1r/pppp1ppp/8/4p3/2B1n3/2N5/PPPP1PPP/R1BQK1NR w KQkq - 0 4",
                  move: "Nxe4", category: "main_line",
                  children: [{
                    fen: "rnbqkb1r/pppp1ppp/8/4p2Q/2B1n3/2N5/PPPP1PPP/R1B1K1NR b KQkq - 1 4",
                    move: "Qh5", category: "main_line",
                    children: [{
                      fen: "rnbqkb1r/pppp1ppp/3n4/4p2Q/2B5/2N5/PPPP1PPP/R1B1K1NR w KQkq - 2 5",
                      move: "Nd6", category: "main_line",
                      children: [{
                        fen: "rnbqkb1r/pppp1ppp/3n4/4p2Q/8/1BN5/PPPP1PPP/R1B1K1NR b KQkq - 3 5",
                        move: "Bb3", category: "main_line",
                        children: [{
                          fen: "rnbqk2r/ppppbppp/3n4/4p2Q/8/1BN5/PPPP1PPP/R1B1K1NR w KQkq - 4 6",
                          move: "Be7", category: "main_line",
                          children: [{
                            fen: "rnbqk2r/ppppbppp/3n4/4p2Q/8/1BN2N2/PPPP1PPP/R1B1K2R b KQkq - 5 6",
                            move: "Nf3", category: "main_line",
                            children: [{
                              fen: "r1bqk2r/ppppbppp/2nn4/4p2Q/8/1BN2N2/PPPP1PPP/R1B1K2R w KQkq - 6 7",
                              move: "Nc6", category: "main_line",
                              children: []
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              }
            ]
          },
          {
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3",
            move: "Nc6", category: "legit_alternative", variationName: "Vienna with Nc6",
            children: [{
              fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR b KQkq - 3 3",
              move: "Bc4", category: "main_line",
              children: [{
                fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq - 4 4",
                move: "Nf6", category: "main_line",
                children: [{
                  fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2NP4/PPP2PPP/R1BQK1NR b KQkq - 0 4",
                  move: "d3", category: "main_line",
                  children: [{
                    fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2NP4/PPP2PPP/R1BQK1NR w KQkq - 1 5",
                    move: "Bb4", category: "main_line",
                    children: []
                  }]
                }]
              }]
            }]
          },
          {
            fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2",
            move: "f5", category: "mistake",
            explanation: "f5 is premature and weakens your king. Develop with Nf6 or Nc6.",
            suggestedMove: "Nf6", children: []
          }
        ]
      }]
    }]
  }
];

// =============================================
// CATALAN OPENING
// =============================================
const catalanTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [{
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [{
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        move: "c4", category: "main_line",
        children: [{
          fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "e6", category: "main_line",
          children: [{
            fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3",
            move: "g3", category: "main_line",
            children: [{
              fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq - 0 4",
              move: "d5", category: "main_line",
              children: [{
                fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq - 1 4",
                move: "Bg2", category: "main_line",
                children: [
                  {
                    fen: "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR w KQkq - 2 5",
                    move: "Be7", category: "main_line",
                    children: [{
                      fen: "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq - 3 5",
                      move: "Nf3", category: "main_line",
                      children: [{
                        fen: "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQK2R w KQ - 4 6",
                        move: "O-O", category: "main_line",
                        children: [{
                          fen: "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQ1RK1 b - - 5 6",
                          move: "O-O", category: "main_line",
                          children: [
                            {
                              fen: "rnbq1rk1/ppp1bppp/4pn2/8/2pP4/5NP1/PP2PPBP/RNBQ1RK1 w - - 0 7",
                              move: "dxc4", category: "main_line", variationName: "Open Catalan",
                              children: [{
                                fen: "rnbq1rk1/ppp1bppp/4pn2/8/2pP4/5NP1/PPQ1PPBP/RNB2RK1 b - - 1 7",
                                move: "Qc2", category: "main_line",
                                children: [{
                                  fen: "rnbq1rk1/1pp1bppp/p3pn2/8/2pP4/5NP1/PPQ1PPBP/RNB2RK1 w - - 0 8",
                                  move: "a6", category: "main_line",
                                  children: [{
                                    fen: "rnbq1rk1/1pp1bppp/p3pn2/8/2QP4/5NP1/PP2PPBP/RNB2RK1 b - - 0 8",
                                    move: "Qxc4", category: "main_line",
                                    children: [{
                                      fen: "rnbq1rk1/2p1bppp/p3pn2/1p6/2QP4/5NP1/PP2PPBP/RNB2RK1 w - - 0 9",
                                      move: "b5", category: "main_line",
                                      children: [{
                                        fen: "rnbq1rk1/2p1bppp/p3pn2/1p6/3P4/5NP1/PPQ1PPBP/RNB2RK1 b - - 1 9",
                                        move: "Qc2", category: "main_line",
                                        children: [{
                                          fen: "rn1q1rk1/1bp1bppp/p3pn2/1p6/3P4/5NP1/PPQ1PPBP/RNB2RK1 w - - 2 10",
                                          move: "Bb7", category: "main_line",
                                          children: []
                                        }]
                                      }]
                                    }]
                                  }]
                                }]
                              }]
                            },
                            {
                              fen: "r1bq1rk1/pppnbppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - - 6 7",
                              move: "Nbd7", category: "legit_alternative", variationName: "Closed Catalan",
                              children: [{
                                fen: "r1bq1rk1/pppnbppp/4pn2/3p4/2PP4/5NP1/PPQ1PPBP/RNB2RK1 b - - 7 7",
                                move: "Qc2", category: "main_line",
                                children: [{
                                  fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/5NP1/PPQ1PPBP/RNB2RK1 w - - 0 8",
                                  move: "c6", category: "main_line",
                                  children: [{
                                    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/5NP1/PPQNPPBP/R1B2RK1 b - - 1 8",
                                    move: "Nbd2", category: "main_line",
                                    children: [{
                                      fen: "r1bq1rk1/p2nbppp/1pp1pn2/3p4/2PP4/5NP1/PPQNPPBP/R1B2RK1 w - - 0 9",
                                      move: "b6", category: "main_line",
                                      children: [{
                                        fen: "r1bq1rk1/p2nbppp/1pp1pn2/3p4/2PPP3/5NP1/PPQN1PBP/R1B2RK1 b - - 0 9",
                                        move: "e4", category: "main_line",
                                        children: []
                                      }]
                                    }]
                                  }]
                                }]
                              }]
                            }
                          ]
                        }]
                      }]
                    }]
                  },
                  {
                    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq - 1 4",
                    move: "c6", category: "legit_alternative", variationName: "Catalan Slav",
                    children: []
                  }
                ]
              }]
            }]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// BENONI DEFENSE
// =============================================
const benoniTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [{
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [{
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        move: "c4", category: "main_line",
        children: [{
          fen: "rnbqkb1r/pp1ppppp/5n2/2p5/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "c5", category: "main_line",
          children: [{
            fen: "rnbqkb1r/pp1ppppp/5n2/2pP4/2P5/8/PP2PPPP/RNBQKBNR b KQkq - 0 3",
            move: "d5", category: "main_line",
            children: [{
              fen: "rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 0 4",
              move: "e6", category: "main_line",
              children: [{
                fen: "rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 4",
                move: "Nc3", category: "main_line",
                children: [{
                  fen: "rnbqkb1r/pp1p1ppp/5n2/2pp4/2P5/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5",
                  move: "exd5", category: "main_line",
                  children: [{
                    fen: "rnbqkb1r/pp1p1ppp/5n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 5",
                    move: "cxd5", category: "main_line",
                    children: [{
                      fen: "rnbqkb1r/pp3ppp/3p1n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 6",
                      move: "d6", category: "main_line",
                      children: [
                        {
                          fen: "rnbqkb1r/pp3ppp/3p1n2/2pP4/4P3/2N5/PP3PPP/R1BQKBNR b KQkq - 0 6",
                          move: "e4", category: "main_line", variationName: "Modern Benoni",
                          children: [{
                            fen: "rnbqkb1r/pp3p1p/3p1np1/2pP4/4P3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 7",
                            move: "g6", category: "main_line",
                            children: [{
                              fen: "rnbqkb1r/pp3p1p/3p1np1/2pP4/4P3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 7",
                              move: "Nf3", category: "main_line",
                              children: [{
                                fen: "rnbqk2r/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP3PPP/R1BQKB1R w KQkq - 2 8",
                                move: "Bg7", category: "main_line",
                                children: [{
                                  fen: "rnbqk2r/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQK2R b KQkq - 3 8",
                                  move: "Be2", category: "main_line",
                                  children: [{
                                    fen: "rnbq1rk1/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 9",
                                    move: "O-O", category: "main_line",
                                    children: [{
                                      fen: "rnbq1rk1/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQ1RK1 b - - 5 9",
                                      move: "O-O", category: "main_line",
                                      children: [{
                                        fen: "rnbqr1k1/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 6 10",
                                        move: "Re8", category: "main_line",
                                        children: []
                                      }]
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        },
                        {
                          fen: "rnbqkb1r/pp3ppp/3p1n2/2pP4/8/2N3P1/PP2PP1P/R1BQKBNR b KQkq - 0 6",
                          move: "g3", category: "legit_alternative", variationName: "Fianchetto Benoni",
                          children: [{
                            fen: "rnbqkb1r/pp3p1p/3p1np1/2pP4/8/2N3P1/PP2PP1P/R1BQKBNR w KQkq - 0 7",
                            move: "g6", category: "main_line",
                            children: [{
                              fen: "rnbqkb1r/pp3p1p/3p1np1/2pP4/8/2N3P1/PP2PPBP/R1BQK1NR b KQkq - 1 7",
                              move: "Bg2", category: "main_line",
                              children: [{
                                fen: "rnbqk2r/pp3pbp/3p1np1/2pP4/8/2N3P1/PP2PPBP/R1BQK1NR w KQkq - 2 8",
                                move: "Bg7", category: "main_line",
                                children: [{
                                  fen: "rnbqk2r/pp3pbp/3p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQK2R b KQkq - 3 8",
                                  move: "Nf3", category: "main_line",
                                  children: [{
                                    fen: "rnbq1rk1/pp3pbp/3p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQK2R w KQ - 4 9",
                                    move: "O-O", category: "main_line",
                                    children: [{
                                      fen: "rnbq1rk1/pp3pbp/3p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQ1RK1 b - - 5 9",
                                      move: "O-O", category: "main_line",
                                      children: [{
                                        fen: "rnbq1rk1/1p3pbp/p2p1np1/2pP4/8/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 10",
                                        move: "a6", category: "main_line",
                                        children: [{
                                          fen: "rnbq1rk1/1p3pbp/p2p1np1/2pP4/P7/2N2NP1/1P2PPBP/R1BQ1RK1 b - - 0 10",
                                          move: "a4", category: "main_line",
                                          children: []
                                        }]
                                      }]
                                    }]
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }
                      ]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// PHILIDOR DEFENSE
// =============================================
const philidorTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "e5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        move: "Nf3", category: "main_line",
        children: [{
          fen: "rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
          move: "d6", category: "main_line",
          children: [{
            fen: "rnbqkbnr/ppp2ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
            move: "d4", category: "main_line",
            children: [
              {
                fen: "rnbqkb1r/ppp2ppp/3p1n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 1 4",
                move: "Nf6", category: "main_line", variationName: "Philidor Main Line",
                children: [{
                  fen: "rnbqkb1r/ppp2ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 2 4",
                  move: "Nc3", category: "main_line",
                  children: [{
                    fen: "r1bqkb1r/pppn1ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 3 5",
                    move: "Nbd7", category: "main_line",
                    children: [{
                      fen: "r1bqkb1r/pppn1ppp/3p1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQK2R b KQkq - 4 5",
                      move: "Bc4", category: "main_line",
                      children: [{
                        fen: "r1bqk2r/pppnbppp/3p1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 5 6",
                        move: "Be7", category: "main_line",
                        children: [{
                          fen: "r1bqk2r/pppnbppp/3p1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQ1RK1 b kq - 6 6",
                          move: "O-O", category: "main_line",
                          children: [{
                            fen: "r1bq1rk1/pppnbppp/3p1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQ1RK1 w - - 7 7",
                            move: "O-O", category: "main_line",
                            children: [{
                              fen: "r1bq1rk1/pppnbppp/3p1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQR1K1 b - - 8 7",
                              move: "Re1", category: "main_line",
                              children: [{
                                fen: "r1bq1rk1/pp1nbppp/2pp1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQR1K1 w - - 0 8",
                                move: "c6", category: "main_line",
                                children: [{
                                  fen: "r1bq1rk1/pp1nbppp/2pp1n2/4p3/P1BPP3/2N2N2/1PP2PPP/R1BQR1K1 b - - 0 8",
                                  move: "a4", category: "main_line",
                                  children: []
                                }]
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              },
              {
                fen: "r1bqkbnr/pppn1ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 1 4",
                move: "Nd7", category: "legit_alternative", variationName: "Hanham Philidor",
                children: [{
                  fen: "r1bqkbnr/pppn1ppp/3p4/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq - 2 4",
                  move: "Bc4", category: "main_line",
                  children: [{
                    fen: "r1bqkbnr/pp1n1ppp/2pp4/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
                    move: "c6", category: "main_line",
                    children: [{
                      fen: "r1bqkbnr/pp1n1ppp/2pp4/4p3/2BPP3/5N2/PPP2PPP/RNBQ1RK1 b kq - 1 5",
                      move: "O-O", category: "main_line",
                      children: [{
                        fen: "r1bqk1nr/pp1nbppp/2pp4/4p3/2BPP3/5N2/PPP2PPP/RNBQ1RK1 w kq - 2 6",
                        move: "Be7", category: "main_line",
                        children: [{
                          fen: "r1bqk1nr/pp1nbppp/2pp4/4p3/2BPP3/5N2/PPP2PPP/RNBQR1K1 b kq - 3 6",
                          move: "Re1", category: "main_line",
                          children: [{
                            fen: "r1bqk2r/pp1nbppp/2pp1n2/4p3/2BPP3/5N2/PPP2PPP/RNBQR1K1 w kq - 4 7",
                            move: "Ngf6", category: "main_line",
                            children: [{
                              fen: "r1bqk2r/pp1nbppp/2pp1n2/4p3/2BPP3/2N2N2/PPP2PPP/R1BQR1K1 b kq - 5 7",
                              move: "Nc3", category: "main_line",
                              children: []
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              },
              {
                fen: "rnbqkbnr/ppp2ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
                move: "f5", category: "mistake",
                explanation: "f5 weakens the kingside prematurely. Develop with Nf6 or Nd7 first.",
                suggestedMove: "Nf6", children: []
              }
            ]
          }]
        }]
      }]
    }]
  }
];

// =============================================
// RÉTI OPENING
// =============================================
const retiTree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1",
    move: "Nf3", category: "main_line",
    children: [{
      fen: "rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2",
      move: "d5", category: "main_line",
      children: [
        {
          fen: "rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq - 0 2",
          move: "c4", category: "main_line",
          children: [
            {
              fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R w KQkq - 0 3",
              move: "e6", category: "main_line", variationName: "Réti Accepted",
              children: [{
                fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2P5/5NP1/PP1PPP1P/RNBQKB1R b KQkq - 0 3",
                move: "g3", category: "main_line",
                children: [{
                  fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/5NP1/PP1PPP1P/RNBQKB1R w KQkq - 1 4",
                  move: "Nf6", category: "main_line",
                  children: [{
                    fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2P5/5NP1/PP1PPPBP/RNBQK2R b KQkq - 2 4",
                    move: "Bg2", category: "main_line",
                    children: [{
                      fen: "rnbqk2r/ppp1bppp/4pn2/3p4/2P5/5NP1/PP1PPPBP/RNBQK2R w KQkq - 3 5",
                      move: "Be7", category: "main_line",
                      children: [{
                        fen: "rnbqk2r/ppp1bppp/4pn2/3p4/2P5/5NP1/PP1PPPBP/RNBQ1RK1 b kq - 4 5",
                        move: "O-O", category: "main_line",
                        children: [{
                          fen: "rnbq1rk1/ppp1bppp/4pn2/3p4/2P5/5NP1/PP1PPPBP/RNBQ1RK1 w - - 5 6",
                          move: "O-O", category: "main_line",
                          children: [{
                            fen: "rnbq1rk1/ppp1bppp/4pn2/3p4/2P5/1P3NP1/P2PPPBP/RNBQ1RK1 b - - 0 6",
                            move: "b3", category: "main_line",
                            children: [{
                              fen: "rnbq1rk1/pp2bppp/4pn2/2pp4/2P5/1P3NP1/P2PPPBP/RNBQ1RK1 w - - 0 7",
                              move: "c5", category: "main_line",
                              children: [{
                                fen: "rnbq1rk1/pp2bppp/4pn2/2pp4/2P5/1P3NP1/PB1PPPBP/RN1Q1RK1 b - - 1 7",
                                move: "Bb2", category: "main_line",
                                children: [{
                                  fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2P5/1P3NP1/PB1PPPBP/RN1Q1RK1 w - - 2 8",
                                  move: "Nc6", category: "main_line",
                                  children: [{
                                    fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2P5/1P2PNP1/PB1P1PBP/RN1Q1RK1 b - - 0 8",
                                    move: "e3", category: "main_line",
                                    children: []
                                  }]
                                }]
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              }]
            },
            {
              fen: "rnbqkb1r/ppp1pppp/5n2/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R w KQkq - 1 3",
              move: "Nf6", category: "legit_alternative", variationName: "Réti with Nf6",
              children: []
            },
            {
              fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 0 3",
              move: "dxc4", category: "legit_alternative", variationName: "Réti Gambit Accepted",
              children: []
            }
          ]
        },
        {
          fen: "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2",
          move: "g3", category: "legit_alternative", variationName: "King's Indian Attack Setup",
          children: [{
            fen: "rnbqkb1r/ppp1pppp/5n2/3p4/8/5NP1/PPPPPP1P/RNBQKB1R w KQkq - 1 3",
            move: "Nf6", category: "main_line",
            children: [{
              fen: "rnbqkb1r/ppp1pppp/5n2/3p4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 2 3",
              move: "Bg2", category: "main_line",
              children: [{
                fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/8/5NP1/PPPPPPBP/RNBQK2R w KQkq - 0 4",
                move: "c6", category: "main_line",
                children: [{
                  fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/8/5NP1/PPPPPPBP/RNBQ1RK1 b kq - 1 4",
                  move: "O-O", category: "main_line",
                  children: [{
                    fen: "rn1qkb1r/pp2pppp/2p2n2/3p4/6b1/5NP1/PPPPPPBP/RNBQ1RK1 w kq - 2 5",
                    move: "Bg4", category: "main_line",
                    children: [{
                      fen: "rn1qkb1r/pp2pppp/2p2n2/3p4/6b1/3P1NP1/PPP1PPBP/RNBQ1RK1 b kq - 0 5",
                      move: "d3", category: "main_line",
                      children: [{
                        fen: "r2qkb1r/pp1npppp/2p2n2/3p4/6b1/3P1NP1/PPP1PPBP/RNBQ1RK1 w kq - 1 6",
                        move: "Nbd7", category: "main_line",
                        children: [{
                          fen: "r2qkb1r/pp1npppp/2p2n2/3p4/6b1/3P1NP1/PPPNPPBP/R1BQ1RK1 b kq - 2 6",
                          move: "Nbd2", category: "main_line",
                          children: [{
                            fen: "r2qkb1r/pp1n1ppp/2p2n2/3pp3/6b1/3P1NP1/PPPNPPBP/R1BQ1RK1 w kq - 0 7",
                            move: "e5", category: "main_line",
                            children: [{
                              fen: "r2qkb1r/pp1n1ppp/2p2n2/3pp3/4P1b1/3P1NP1/PPPN1PBP/R1BQ1RK1 b kq - 0 7",
                              move: "e4", category: "main_line",
                              children: [{
                                fen: "r2qk2r/pp1n1ppp/2pb1n2/3pp3/4P1b1/3P1NP1/PPPN1PBP/R1BQ1RK1 w kq - 1 8",
                                move: "Bd6", category: "main_line",
                                children: []
                              }]
                            }]
                          }]
                        }]
                      }]
                    }]
                  }]
                }]
              }]
            }]
          }]
        }
      ]
    }]
  }
];

// =============================================
// EXPORT ALL OPENINGS
// =============================================
export const openings: Opening[] = [
  {
    id: "italian-game", name: "Italian Game", family: "Italian",
    description: "A classical opening developing the bishop to c4, targeting f7. Leads to rich tactical and strategic play.",
    themeId: "italian", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w", tree: italianMainTree, totalVariations: 5,
    variations: [
      { id: "giuoco-piano", name: "Giuoco Piano", description: "The quiet game — solid development with c3 and d4.", plan: "Aim for a strong center with c3 and d4. Castle kingside, develop pieces actively, and launch a central attack. The result is an open, tactical middlegame where White has a slight space advantage.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5", tree: italianMainTree, depth: 10 },
      { id: "two-knights", name: "Two Knights Defense", description: "Black plays Nf6 instead of Bc5 for sharper play.", plan: "As White, attack with d4 and aim for the Fried Liver or Traxler. As Black, challenge White's center early and seek active piece play. Leads to sharp, tactical positions with chances for both sides.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6", tree: italianMainTree, depth: 8 },
      { id: "evans-gambit", name: "Evans Gambit", description: "White sacrifices a pawn with b4 for rapid development.", plan: "Sacrifice the b4 pawn to deflect Black's bishop, then build a powerful center with c3 and d4. Develop rapidly and attack the kingside. White gets a dangerous initiative in exchange for a pawn.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4", tree: italianMainTree, depth: 7 },
    ]
  },
  {
    id: "sicilian-defense", name: "Sicilian Defense", family: "Sicilian",
    description: "The most popular response to 1.e4. Black fights for the center asymmetrically with sharp play.",
    themeId: "sicilian", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: sicilianMainTree, totalVariations: 6,
    variations: [
      { id: "najdorf", name: "Najdorf Variation", description: "The sharpest and most popular Sicilian — 5...a6.", plan: "As Black, play a6 to control b5 and prepare queenside expansion with b5. Aim for counterplay on the c-file and queenside while White attacks the kingside. A complex, double-edged battle.", startingMoves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6", tree: sicilianMainTree, depth: 12 },
      { id: "dragon", name: "Dragon Variation", description: "Black fianchettoes the bishop for kingside pressure.", plan: "Fianchetto the bishop on g7, aiming it at White's queenside. Castle kingside and attack on the c-file. White often castles queenside and attacks your king — it's a race. Exciting, razor-sharp play.", startingMoves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6", tree: sicilianMainTree, depth: 10 },
      { id: "classical-sic", name: "Classical Variation", description: "Black develops the knight to c6 for classical play.", plan: "Develop naturally with Nc6 to pressure d4. Aim for queenside play and central control. A well-rounded setup that avoids the sharpest theoretical lines while keeping dynamic chances.", startingMoves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6", tree: sicilianMainTree, depth: 8 },
      { id: "scheveningen", name: "Scheveningen", description: "Flexible with e6 — sets up a strong pawn duo.", plan: "Build a solid pawn structure with d6+e6. Develop flexibly and prepare breaks like d5 or b5. The position is rich and strategic — Black has a resilient setup with long-term counterplay.", startingMoves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6", tree: sicilianMainTree, depth: 8 },
    ]
  },
  {
    id: "queens-gambit", name: "Queen's Gambit", family: "Queen's Gambit",
    description: "White offers a pawn to gain central control. Sophisticated with deep strategic themes.",
    themeId: "queensgambit", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w", tree: queensGambitTree, totalVariations: 4,
    variations: [
      { id: "qgd", name: "Queen's Gambit Declined", description: "Black declines with e6, maintaining solid structure.", plan: "As White, build a strong center and develop pieces to active squares. Aim for a minority attack on the queenside (b4-b5) or a central breakthrough with e4. White maintains a lasting positional edge.", startingMoves: "1.d4 d5 2.c4 e6", tree: queensGambitTree, depth: 10 },
      { id: "qga", name: "Queen's Gambit Accepted", description: "Black takes the pawn, aiming to equalize.", plan: "As White, reclaim the pawn and exploit your development advantage. Push e4 to dominate the center. As Black, hold onto the pawn temporarily while developing. The position often simplifies with a slight White edge.", startingMoves: "1.d4 d5 2.c4 dxc4", tree: queensGambitTree, depth: 7 },
      { id: "slav", name: "Slav Defense", description: "Black supports d5 with c6 — solid and flexible.", plan: "As Black, maintain the d5 pawn with c6 and develop the bishop to f5 or g4 before playing e6. A rock-solid structure that avoids the bad bishop problem of the QGD. Aim for equality with chances.", startingMoves: "1.d4 d5 2.c4 c6", tree: queensGambitTree, depth: 8 },
    ]
  },
  {
    id: "kings-indian", name: "King's Indian Defense", family: "King's Indian",
    description: "A hypermodern defense where Black lets White build a center, planning to strike back later.",
    themeId: "kingsindian", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: kingsIndianTree, totalVariations: 4,
    variations: [
      { id: "classical-kid", name: "Classical KID", description: "Nf3 + Be2 setup — the main battleground.", plan: "As Black, let White build the center, then strike with e5 and f5. Launch a kingside attack while White expands on the queenside. The result is a thrilling race between opposite-side attacks.", startingMoves: "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3", tree: kingsIndianTree, depth: 12 },
      { id: "samisch", name: "Sämisch Variation", description: "White plays f3 for an aggressive kingside setup.", plan: "As White, build a massive center with f3 and Be3, then castle queenside and launch a pawn storm. As Black, strike with c5 or e5 and counterattack. Double-edged with fireworks on both flanks.", startingMoves: "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3", tree: kingsIndianTree, depth: 8 },
    ]
  },
  {
    id: "french-defense", name: "French Defense", family: "French",
    description: "A solid defense creating a pawn chain. Black aims for a counterattack on White's center.",
    themeId: "french", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: frenchDefenseTree, totalVariations: 4,
    variations: [
      { id: "winawer", name: "Winawer Variation", description: "Black pins the knight with Bb4 — sharp and complex.", plan: "As Black, pin the knight with Bb4, creating immediate tension. After White plays e5, undermine the center with c5 and f6. The result is a sharp, imbalanced position where Black gets queenside play against White's kingside space.", startingMoves: "1.e4 e6 2.d4 d5 3.Nc3 Bb4", tree: frenchDefenseTree, depth: 10 },
      { id: "classical-french", name: "Classical French", description: "Black plays Nf6, a solid and traditional approach.", plan: "Develop the knight to f6 attacking e4, then play c5 to challenge the center. Aim for a solid pawn structure and piece activity. Black gets a reliable, slightly cramped but resilient position.", startingMoves: "1.e4 e6 2.d4 d5 3.Nc3 Nf6", tree: frenchDefenseTree, depth: 8 },
      { id: "advance-french", name: "Advance Variation", description: "White pushes e5 early, locking the center.", plan: "As Black, attack the pawn chain base with c5 and prepare f6 to undermine e5. Develop the dark-squared bishop actively via a5 or b4. The position becomes a strategic battle around the center pawns.", startingMoves: "1.e4 e6 2.d4 d5 3.e5", tree: frenchDefenseTree, depth: 8 },
    ]
  },
  {
    id: "caro-kann", name: "Caro-Kann Defense", family: "Caro-Kann",
    description: "A reliable defense with solid pawn structure and flexible development.",
    themeId: "carokann", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: caroKannTree, totalVariations: 4,
    variations: [
      { id: "classical-ck", name: "Classical Caro-Kann", description: "Bf5 develops naturally and solidly.", plan: "Develop the bishop to f5 before playing e6, avoiding the 'French bishop' problem. Build a solid structure and aim for a safe, slightly inferior but very playable middlegame. Excellent for grinding down opponents.", startingMoves: "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5", tree: caroKannTree, depth: 10 },
      { id: "advance-ck", name: "Advance Caro-Kann", description: "White pushes e5, locking the center early.", plan: "As Black, attack the pawn chain with c5 and prepare Nc6 and Bf5. Undermine White's center and aim for piece activity. A strategic battle where Black has clear plans against the overextended pawns.", startingMoves: "1.e4 c6 2.d4 d5 3.e5", tree: caroKannTree, depth: 8 },
      { id: "modern-ck", name: "Modern Caro-Kann", description: "Nd7 keeps flexible — a modern approach.", plan: "Develop Nd7 to keep options open for the knight and bishop. Play Ngf6 and aim for e6, Bd6 setups. A flexible approach that avoids the sharpest lines and gives Black a solid position with counterplay.", startingMoves: "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nd7", tree: caroKannTree, depth: 7 },
    ]
  },
  {
    id: "ruy-lopez", name: "Ruy López", family: "Ruy López",
    description: "One of the oldest and most respected openings. White pressures Black's center through the a4-e8 diagonal.",
    themeId: "ruylopez", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w", tree: ruyLopezTree, totalVariations: 4,
    variations: [
      { id: "morphy-defense", name: "Morphy Defense", description: "a6 challenges the bishop — the main line.", plan: "As White, maintain pressure on e5 via the bishop and build a strong center. As Black, play a6 to force the bishop to retreat, then aim for d5 counterplay. The position is rich with strategic depth — a lifelong opening.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6", tree: ruyLopezTree, depth: 14 },
      { id: "berlin-defense", name: "Berlin Defense", description: "Ultra-solid — the 'Berlin Wall' endgame.", plan: "As Black, simplify into the Berlin endgame after Nf6. Trade queens early and aim for a solid, slightly worse but very holdable endgame. White has a small edge but Black's position is fortress-like.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6", tree: ruyLopezTree, depth: 8 },
    ]
  },
  {
    id: "london-system", name: "London System", family: "London",
    description: "A solid, easy-to-learn system for White. Develop Bf4, e3, Nf3 — reliable at every level.",
    themeId: "london", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w", tree: londonSystemTree, totalVariations: 4,
    variations: [
      { id: "london-classical", name: "Classical London", description: "The standard 2...d5 3.e3 e6 setup with Nd2, c3, Ngf3, Bd3.", plan: "Develop solidly with Bf4, e3, Bd3, Nbd2, and c3. Build a fortress-like structure, then expand with e4 when ready. The London gives White a safe, easy-to-play position with clear plans in the middlegame.", startingMoves: "1.d4 Nf6 2.Bf4 d5 3.e3 e6", tree: londonSystemTree, depth: 14 },
      { id: "london-c5", name: "Early c5 Counter", description: "Black challenges with c5 immediately — leads to dynamic play.", plan: "As White, maintain the d4 pawn with c3 and develop naturally. As Black, challenge with c5 to open the position. The fight centers on whether White's solid structure or Black's activity prevails.", startingMoves: "1.d4 Nf6 2.Bf4 d5 3.e3 c5", tree: londonSystemTree, depth: 10 },
      { id: "london-bf5", name: "Bishop Sortie", description: "Black develops Bf5 early to trade light-squared bishops.", plan: "As Black, develop Bf5 to trade off the potentially bad bishop. As White, avoid the trade and maintain the bishop pair. The position is balanced with clear strategic themes for both sides.", startingMoves: "1.d4 Nf6 2.Bf4 d5 3.e3 Bf5", tree: londonSystemTree, depth: 12 },
      { id: "anti-london", name: "Anti-London with e6", description: "Black plays e6 to transpose into QGD-like positions.", plan: "As Black, play e6 followed by c5 to challenge the center. Aim to neutralize White's London setup by creating central tension. The result is a balanced middlegame with chances for active piece play.", startingMoves: "1.d4 Nf6 2.Bf4 e6", tree: londonSystemTree, depth: 8 },
    ]
  },
  {
    id: "scotch-game", name: "Scotch Game", family: "Scotch",
    description: "White opens the center early with 3.d4. Direct and tactical — a favorite of Kasparov.",
    themeId: "scotch", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w", tree: scotchGameTree, totalVariations: 3,
    variations: [
      { id: "classical-scotch", name: "Classical Scotch", description: "Bc5 against the knight — principled development.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5", tree: scotchGameTree, depth: 8 },
      { id: "scotch-four-knights", name: "Scotch Four Knights", description: "Nf6 leads to four knights territory.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6", tree: scotchGameTree, depth: 6 },
    ]
  },
  {
    id: "dutch-defense", name: "Dutch Defense", family: "Dutch",
    description: "An ambitious defense with f5, fighting for kingside control from move one.",
    themeId: "dutch", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: dutchDefenseTree, totalVariations: 3,
    variations: [
      { id: "classical-dutch", name: "Classical Dutch", description: "e6 + Be7 — solid and traditional.", startingMoves: "1.d4 f5 2.g3 Nf6 3.Bg2 e6", tree: dutchDefenseTree, depth: 10 },
      { id: "leningrad-dutch", name: "Leningrad Dutch", description: "g6 + Bg7 — a KID-like structure.", startingMoves: "1.d4 f5 2.g3 Nf6 3.Bg2 g6", tree: dutchDefenseTree, depth: 8 },
      { id: "stonewall-dutch", name: "Stonewall Dutch", description: "d5 creates a wall — ultra-solid.", startingMoves: "1.d4 f5 2.g3 Nf6 3.Bg2 d5", tree: dutchDefenseTree, depth: 6 },
    ]
  },
  {
    id: "pirc-defense", name: "Pirc Defense", family: "Pirc",
    description: "A flexible hypermodern defense — Black develops the bishop to g7 and strikes later.",
    themeId: "pirc", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: pircDefenseTree, totalVariations: 3,
    variations: [
      { id: "classical-pirc", name: "Classical Pirc", description: "Nf3 + Be2 — restrained but potent.", startingMoves: "1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Nf3", tree: pircDefenseTree, depth: 8 },
      { id: "austrian-attack", name: "Austrian Attack", description: "f3 — White plays aggressively.", startingMoves: "1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.f3", tree: pircDefenseTree, depth: 7 },
    ]
  },
  {
    id: "scandinavian-defense", name: "Scandinavian Defense", family: "Scandinavian",
    description: "Black immediately challenges e4 with d5. Simple and direct — great for beginners.",
    themeId: "scandinavian", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: scandinavianTree, totalVariations: 3,
    variations: [
      { id: "qxd5-scandi", name: "Qxd5 Scandinavian", description: "Recapture with the queen — the classic approach.", startingMoves: "1.e4 d5 2.exd5 Qxd5", tree: scandinavianTree, depth: 8 },
      { id: "modern-scandi", name: "Modern Scandinavian", description: "Nf6 — recapture with the knight instead.", startingMoves: "1.e4 d5 2.exd5 Nf6", tree: scandinavianTree, depth: 6 },
    ]
  },
  {
    id: "english-opening", name: "English Opening", family: "English",
    description: "1.c4 — a flexible flank opening that often transposes. Strategic and positional.",
    themeId: "english", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w", tree: englishOpeningTree, totalVariations: 3,
    variations: [
      { id: "reversed-sicilian", name: "Reversed Sicilian", description: "After e5, White plays a Sicilian with an extra tempo.", startingMoves: "1.c4 e5 2.Nc3 Nf6 3.g3", tree: englishOpeningTree, depth: 8 },
      { id: "four-knights-english", name: "Four Knights English", description: "Symmetrical development — strategic maneuvering.", startingMoves: "1.c4 e5 2.Nc3 Nc6", tree: englishOpeningTree, depth: 6 },
    ]
  },
  {
    id: "nimzo-indian", name: "Nimzo-Indian Defense", family: "Nimzo-Indian",
    description: "One of Black's best responses to 1.d4. The pin on Nc3 creates lasting pressure.",
    themeId: "nimzoindian", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: nimzoIndianTree, totalVariations: 3,
    variations: [
      { id: "classical-nimzo", name: "Classical Nimzo", description: "Qc2 avoids doubled pawns — the main line.", startingMoves: "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2", tree: nimzoIndianTree, depth: 8 },
      { id: "rubinstein-nimzo", name: "Rubinstein Nimzo", description: "e3 — solid and positional.", startingMoves: "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3", tree: nimzoIndianTree, depth: 8 },
    ]
  },
  {
    id: "grunfeld-defense", name: "Grünfeld Defense", family: "Grünfeld",
    description: "Black strikes at the center with d5 after allowing e4. Dynamic and counterattacking.",
    themeId: "grunfeld", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: grunfeldTree, totalVariations: 3,
    variations: [
      { id: "exchange-grunfeld", name: "Exchange Grünfeld", description: "White takes on d5 and plays e4 — the critical test.", startingMoves: "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4", tree: grunfeldTree, depth: 10 },
      { id: "russian-grunfeld", name: "Russian System", description: "Nf3 — more restrained and positional.", startingMoves: "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3", tree: grunfeldTree, depth: 7 },
    ]
  },
  {
    id: "alekhine-defense", name: "Alekhine's Defense", family: "Alekhine",
    description: "A provocative defense — Black lures White's pawns forward, then undermines them.",
    themeId: "alekhine", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: alekhineTree, totalVariations: 3,
    variations: [
      { id: "four-pawns-alekhine", name: "Four Pawns Attack", description: "White pushes d4 — the most aggressive test.", startingMoves: "1.e4 Nf6 2.e5 Nd5 3.d4", tree: alekhineTree, depth: 8 },
      { id: "exchange-alekhine", name: "Exchange Variation", description: "White plays d3 — quiet and positional.", startingMoves: "1.e4 Nf6 2.e5 Nd5 3.d3", tree: alekhineTree, depth: 6 },
    ]
  },
  {
    id: "vienna-game", name: "Vienna Game", family: "Vienna",
    description: "White develops Nc3 before Nf3, allowing aggressive f4 gambits or positional Bc4 setups.",
    themeId: "vienna", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w", tree: viennaGameTree, totalVariations: 3,
    variations: [
      { id: "vienna-gambit", name: "Vienna Gambit", description: "f4 — aggressive and sharp, attacking Black's center.", startingMoves: "1.e4 e5 2.Nc3 Nf6 3.f4", tree: viennaGameTree, depth: 10 },
      { id: "vienna-italian", name: "Vienna Italian", description: "Bc4 — a trappy line with Qh5 threats.", startingMoves: "1.e4 e5 2.Nc3 Nf6 3.Bc4", tree: viennaGameTree, depth: 10 },
      { id: "vienna-nc6", name: "Vienna with Nc6", description: "Black mirrors with Nc6 — symmetrical and strategic.", startingMoves: "1.e4 e5 2.Nc3 Nc6", tree: viennaGameTree, depth: 7 },
    ]
  },
  {
    id: "catalan-opening", name: "Catalan Opening", family: "Catalan",
    description: "A sophisticated opening where White fianchettoes on g2, combining Queen's Gambit ideas with a powerful bishop.",
    themeId: "catalan", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w", tree: catalanTree, totalVariations: 3,
    variations: [
      { id: "open-catalan", name: "Open Catalan", description: "Black takes on c4 — White's Bg2 pressures the queenside.", startingMoves: "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 Be7 5.Nf3 O-O 6.O-O dxc4", tree: catalanTree, depth: 14 },
      { id: "closed-catalan", name: "Closed Catalan", description: "Black keeps the center closed with Nbd7.", startingMoves: "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 Be7 5.Nf3 O-O 6.O-O Nbd7", tree: catalanTree, depth: 12 },
    ]
  },
  {
    id: "benoni-defense", name: "Benoni Defense", family: "Benoni",
    description: "Black creates asymmetric pawn structure with c5 against d4, leading to dynamic kingside vs queenside battles.",
    themeId: "benoni", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: benoniTree, totalVariations: 3,
    variations: [
      { id: "modern-benoni", name: "Modern Benoni", description: "e4 — the critical test with a strong center vs Black's activity.", startingMoves: "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4", tree: benoniTree, depth: 14 },
      { id: "fianchetto-benoni", name: "Fianchetto Benoni", description: "g3 — a quieter approach with long-term pressure.", startingMoves: "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.g3", tree: benoniTree, depth: 14 },
    ]
  },
  {
    id: "philidor-defense", name: "Philidor Defense", family: "Philidor",
    description: "A solid but slightly passive defense with d6. Named after the legendary 18th-century player Philidor.",
    themeId: "philidor", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "b", tree: philidorTree, totalVariations: 3,
    variations: [
      { id: "philidor-main", name: "Philidor Main Line", description: "Nf6 and Nbd7 — the classical setup.", startingMoves: "1.e4 e5 2.Nf3 d6 3.d4 Nf6", tree: philidorTree, depth: 12 },
      { id: "hanham-philidor", name: "Hanham Philidor", description: "Nd7 first — a more flexible move order.", startingMoves: "1.e4 e5 2.Nf3 d6 3.d4 Nd7", tree: philidorTree, depth: 10 },
    ]
  },
  {
    id: "reti-opening", name: "Réti Opening", family: "Réti",
    description: "A hypermodern opening — White controls the center with pieces rather than pawns. Flexible and transpositional.",
    themeId: "reti", startingFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    primarySide: "w", tree: retiTree, totalVariations: 3,
    variations: [
      { id: "reti-accepted", name: "Réti Accepted", description: "e6 and classical development — rich strategic play.", startingMoves: "1.Nf3 d5 2.c4 e6", tree: retiTree, depth: 12 },
      { id: "reti-kia", name: "King's Indian Attack", description: "g3 + Bg2 — a universal system for White.", startingMoves: "1.Nf3 d5 2.g3", tree: retiTree, depth: 10 },
    ]
  },
];
