import type { OpeningNode, VariationInfo } from "./openings";

const legals_mate_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "e5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        move: "Nf3", category: "main_line",
        children: [
        {
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          move: "Nc6", category: "main_line",
          children: [
          {
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
            move: "Bc4", category: "main_line",
            children: [
            {
              fen: "r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
              move: "d6", category: "main_line",
              children: [
              {
                fen: "r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 1 4",
                move: "Nc3", category: "main_line",
                children: [
                {
                  fen: "r2qkbnr/ppp2ppp/2np4/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
                  move: "Bg4", category: "main_line",
                  children: [
                  {
                    fen: "r2qkbnr/ppp2ppp/2np4/4N3/2B1P1b1/2N5/PPPP1PPP/R1BQK2R b KQkq - 0 5",
                    move: "Nxe5", category: "main_line",
                    children: [
                    {
                      fen: "r2qkbnr/ppp2ppp/2np4/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6",
                      move: "Bxd1", category: "main_line",
                      children: [
                      {
                        fen: "r2qkbnr/ppp2Bpp/2np4/4N3/4P3/2N5/PPPP1PPP/R1BbK2R b KQkq - 0 6",
                        move: "Bxf7+", category: "main_line",
                        children: [
                        {
                          fen: "r2q1bnr/ppp1kBpp/2np4/4N3/4P3/2N5/PPPP1PPP/R1BbK2R w KQ - 1 7",
                          move: "Ke7", category: "main_line",
                          children: [
                          {
                            fen: "r2q1bnr/ppp1kBpp/2np4/3NN3/4P3/8/PPPP1PPP/R1BbK2R b KQ - 2 7",
                            move: "Nd5", category: "main_line",
                            children: []
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const magnus_smith_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [{
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      move: "c5", category: "main_line",
      children: [{
        fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        move: "Nf3", category: "main_line",
        children: [{
          fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
          move: "d6", category: "main_line",
          children: [{
            fen: "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
            move: "d4", category: "main_line",
            children: [{
              fen: "rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
              move: "cxd4", category: "main_line",
              children: [{
                fen: "rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
                move: "Nxd4", category: "main_line",
                children: [{
                  fen: "rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4",
                  move: "Nf6", category: "main_line",
                  children: [{
                    fen: "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5",
                    move: "Nc3", category: "main_line",
                    children: [{
                      fen: "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5",
                      move: "Nc6", category: "main_line",
                      children: [{
                        fen: "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 3 6",
                        move: "Bc4", category: "main_line",
                        children: [{
                          fen: "r1bqkb1r/pp2pppp/2np1n2/8/2BNP3/2N5/PPP2PPP/R1BQK2R b KQkq - 4 6",
                          move: "e6", category: "main_line",
                          children: [{
                            fen: "r1bqkb1r/pp3ppp/2nppn2/8/2BNP3/2N5/PPP2PPP/R1BQK2R w KQkq - 0 7",
                            move: "Be3", category: "main_line",
                            children: [{
                              fen: "r1bqkb1r/pp3ppp/2nppn2/8/2BNP3/2N1B3/PPP2PPP/R2QK2R b KQkq - 1 7",
                              move: "Be7", category: "main_line",
                              children: [{
                                fen: "r1bqk2r/pp2bppp/2nppn2/8/2BNP3/2N1B3/PPP2PPP/R2QK2R w KQkq - 2 8",
                                move: "Bb3", category: "main_line",
                                children: [{
                                  fen: "r1bqk2r/pp2bppp/2nppn2/8/3NP3/1BN1B3/PPP2PPP/R2QK2R b KQkq - 3 8",
                                  move: "O-O", category: "main_line",
                                  children: [{
                                    fen: "r1bq1rk1/pp2bppp/2nppn2/8/3NP3/1BN1B3/PPP2PPP/R2QK2R w KQ - 4 9",
                                    move: "f4", category: "main_line",
                                    explanation: "White overextends with f4 — this is the mistake!",
                                    children: [{
                                      fen: "r1bq1rk1/pp2bppp/2nppn2/8/3NPP2/1BN1B3/PPP3PP/R2QK2R b KQ - 0 9",
                                      move: "e5", category: "main_line",
                                      explanation: "e5! strikes the center. The knight is attacked and f4 is hanging.",
                                      children: [
                                        {
                                          fen: "r1bq1rk1/pp2bppp/2np1n2/4p3/3NPP2/1BN1B3/PPP3PP/R2QK2R w KQ - 0 10",
                                          move: "fxe5", category: "main_line",
                                          children: [{
                                            fen: "r1bq1rk1/pp2bppp/2np1n2/4P3/3NP3/1BN1B3/PPP3PP/R2QK2R b KQ - 0 10",
                                            move: "dxe5", category: "main_line",
                                            children: [{
                                              fen: "r1bq1rk1/pp2bppp/2n2n2/4p3/3NP3/1BN1B3/PPP3PP/R2QK2R w KQ - 0 11",
                                              move: "Nf5", category: "main_line",
                                              explanation: "White tries Nf5 but Black exchanges favorably.",
                                              children: [{
                                                fen: "r1bq1rk1/pp2bppp/2n2n2/4pN2/4P3/1BN1B3/PPP3PP/R2QK2R b KQ - 1 11",
                                                move: "Bxf5", category: "main_line",
                                                children: [{
                                                  fen: "r2q1rk1/pp2bppp/2n2n2/4pb2/4P3/1BN1B3/PPP3PP/R2QK2R w KQ - 0 12",
                                                  move: "exf5", category: "main_line",
                                                  explanation: "Black has a dominant center and the bishop pair. White's position is compromised.",
                                                  children: []
                                                }]
                                              }]
                                            }]
                                          }]
                                        },
                                        {
                                          fen: "r1bq1rk1/pp2bppp/2np1n2/4p3/3NPP2/1BN1B3/PPP3PP/R2QK2R w KQ - 0 10",
                                          move: "Nf5", category: "main_line",
                                          children: [{
                                            fen: "r1bq1rk1/pp2bppp/2np1n2/4pN2/4PP2/1BN1B3/PPP3PP/R2QK2R b KQ - 1 10",
                                            move: "Bxf5", category: "main_line",
                                            children: [{
                                              fen: "r2q1rk1/pp2bppp/2np1n2/4pb2/4PP2/1BN1B3/PPP3PP/R2QK2R w KQ - 0 11",
                                              move: "exf5", category: "main_line",
                                              children: [{
                                                fen: "r2q1rk1/pp2bppp/2np1n2/4pP2/5P2/1BN1B3/PPP3PP/R2QK2R b KQ - 0 11",
                                                move: "exf4", category: "main_line",
                                                explanation: "Black wins a pawn with a superior position.",
                                                children: []
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

const elephant_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      move: "d5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        move: "c4", category: "main_line",
        children: [
        {
          fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "dxc4", category: "main_line",
          children: [
          {
            fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/4P3/PP3PPP/RNBQKBNR b KQkq - 0 3",
            move: "e3", category: "main_line",
            children: [
            {
              fen: "rnbqkbnr/p1p1pppp/8/1p6/2pP4/4P3/PP3PPP/RNBQKBNR w KQkq - 0 4",
              move: "b5", category: "main_line",
              children: [
              {
                fen: "rnbqkbnr/p1p1pppp/8/1p6/P1pP4/4P3/1P3PPP/RNBQKBNR b KQkq - 0 4",
                move: "a4", category: "main_line",
                children: [
                {
                  fen: "rnbqkbnr/p3pppp/2p5/1p6/P1pP4/4P3/1P3PPP/RNBQKBNR w KQkq - 0 5",
                  move: "c6", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkbnr/p3pppp/2p5/1P6/2pP4/4P3/1P3PPP/RNBQKBNR b KQkq - 0 5",
                    move: "axb5", category: "main_line",
                    children: [
                    {
                      fen: "rnbqkbnr/p3pppp/8/1p6/2pP4/4P3/1P3PPP/RNBQKBNR w KQkq - 0 6",
                      move: "cxb5", category: "main_line",
                      children: [
                      {
                        fen: "rnbqkbnr/p3pppp/8/1p6/2pP4/4PQ2/1P3PPP/RNB1KBNR b KQkq - 1 6",
                        move: "Qf3", category: "main_line",
                        children: []
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const kid_bayonet_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [
    {
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [
      {
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        move: "c4", category: "main_line",
        children: [
        {
          fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "g6", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [
            {
              fen: "rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
              move: "Bg7", category: "main_line",
              children: [
              {
                fen: "rnbqk2r/ppppppbp/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq - 0 4",
                move: "e4", category: "main_line",
                children: [
                {
                  fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5",
                  move: "d6", category: "main_line",
                  children: [
                  {
                    fen: "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 5",
                    move: "Nf3", category: "main_line",
                    children: [
                    {
                      fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 2 6",
                      move: "O-O", category: "main_line",
                      children: [
                      {
                        fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 3 6",
                        move: "Be2", category: "main_line",
                        children: [
                        {
                          fen: "rnbq1rk1/ppp2pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 0 7",
                          move: "e5", category: "main_line",
                          children: [
                          {
                            fen: "rnbq1rk1/ppp2pbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQK2R b KQ - 0 7",
                            move: "d5", category: "main_line",
                            children: [
                            {
                              fen: "r1bq1rk1/pppn1pbp/3p1np1/3Pp3/2P1P3/2N2N2/PP2BPPP/R1BQK2R w KQ - 1 8",
                              move: "Nbd7", category: "main_line",
                              children: [
                              {
                                fen: "r1bq1rk1/pppn1pbp/3p1np1/3Pp1B1/2P1P3/2N2N2/PP2BPPP/R2QK2R b KQ - 2 8",
                                move: "Bg5", category: "main_line",
                                children: [
                                {
                                  fen: "r1bq1rk1/pppn1pb1/3p1npp/3Pp1B1/2P1P3/2N2N2/PP2BPPP/R2QK2R w KQ - 0 9",
                                  move: "h6", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1bq1rk1/pppn1pb1/3p1npp/3Pp3/2P1P2B/2N2N2/PP2BPPP/R2QK2R b KQ - 1 9",
                                    move: "Bh4", category: "main_line",
                                    children: [
                                    {
                                      fen: "r1bq1rk1/pppn1pb1/3p1n1p/3Pp1p1/2P1P2B/2N2N2/PP2BPPP/R2QK2R w KQ - 0 10",
                                      move: "g5", category: "main_line",
                                      children: [
                                      {
                                        fen: "r1bq1rk1/pppn1pb1/3p1n1p/3Pp1p1/2P1P3/2N2NB1/PP2BPPP/R2QK2R b KQ - 1 10",
                                        move: "Bg3", category: "main_line",
                                        children: [
                                        {
                                          fen: "r1bq1rk1/pppn1pb1/3p3p/3Pp1pn/2P1P3/2N2NB1/PP2BPPP/R2QK2R w KQ - 2 11",
                                          move: "Nh5", category: "main_line",
                                          children: []
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const french_poisoned_pawn_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "e6", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2",
        move: "d4", category: "main_line",
        children: [
        {
          fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
          move: "d5", category: "main_line",
          children: [
          {
            fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [
            {
              fen: "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
              move: "Bb4", category: "main_line",
              children: [
              {
                fen: "rnbqk1nr/ppp2ppp/4p3/3pP3/1b1P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4",
                move: "e5", category: "main_line",
                children: [
                {
                  fen: "rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 5",
                  move: "c5", category: "main_line",
                  children: [
                  {
                    fen: "rnbqk1nr/pp3ppp/4p3/2ppP3/1b1P4/P1N5/1PP2PPP/R1BQKBNR b KQkq - 0 5",
                    move: "a3", category: "main_line",
                    children: [
                    {
                      fen: "rnbqk1nr/pp3ppp/4p3/2ppP3/3P4/P1b5/1PP2PPP/R1BQKBNR w KQkq - 0 6",
                      move: "Bxc3+", category: "main_line",
                      children: [
                      {
                        fen: "rnbqk1nr/pp3ppp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1BQKBNR b KQkq - 0 6",
                        move: "bxc3", category: "main_line",
                        children: [
                        {
                          fen: "rnbqk2r/pp2nppp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1BQKBNR w KQkq - 1 7",
                          move: "Ne7", category: "main_line",
                          children: [
                          {
                            fen: "rnbqk2r/pp2nppp/4p3/2ppP3/3P2Q1/P1P5/2P2PPP/R1B1KBNR b KQkq - 2 7",
                            move: "Qg4", category: "main_line",
                            children: [
                            {
                              fen: "rnb1k2r/ppq1nppp/4p3/2ppP3/3P2Q1/P1P5/2P2PPP/R1B1KBNR w KQkq - 3 8",
                              move: "Qc7", category: "main_line",
                              children: [
                              {
                                fen: "rnb1k2r/ppq1npQp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1B1KBNR b KQkq - 0 8",
                                move: "Qxg7", category: "main_line",
                                children: [
                                {
                                  fen: "rnb1k1r1/ppq1npQp/4p3/2ppP3/3P4/P1P5/2P2PPP/R1B1KBNR w KQq - 1 9",
                                  move: "Rg8", category: "main_line",
                                  children: [
                                  {
                                    fen: "rnb1k1r1/ppq1np1Q/4p3/2ppP3/3P4/P1P5/2P2PPP/R1B1KBNR b KQq - 0 9",
                                    move: "Qxh7", category: "main_line",
                                    children: [
                                    {
                                      fen: "rnb1k1r1/ppq1np1Q/4p3/3pP3/3p4/P1P5/2P2PPP/R1B1KBNR w KQq - 0 10",
                                      move: "cxd4", category: "main_line",
                                      children: [
                                      {
                                        fen: "rnb1k1r1/ppq1np1Q/4p3/3pP3/3p4/P1P5/2P1NPPP/R1B1KB1R b KQq - 1 10",
                                        move: "Ne2", category: "main_line",
                                        children: [
                                        {
                                          fen: "r1b1k1r1/ppq1np1Q/2n1p3/3pP3/3p4/P1P5/2P1NPPP/R1B1KB1R w KQq - 2 11",
                                          move: "Nbc6", category: "main_line",
                                          children: [
                                          {
                                            fen: "r1b1k1r1/ppq1np1Q/2n1p3/3pP3/3p1P2/P1P5/2P1N1PP/R1B1KB1R b KQq - 0 11",
                                            move: "f4", category: "main_line",
                                            children: [
                                            {
                                              fen: "r3k1r1/ppqbnp1Q/2n1p3/3pP3/3p1P2/P1P5/2P1N1PP/R1B1KB1R w KQq - 1 12",
                                              move: "Bd7", category: "main_line",
                                              children: []
                                            }
                                            ]
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const caro_brooker_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "c6", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2",
        move: "d4", category: "main_line",
        children: [
        {
          fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
          move: "d5", category: "main_line",
          children: [
          {
            fen: "rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
            move: "e5", category: "main_line",
            children: [
            {
              fen: "rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 1 4",
              move: "Bf5", category: "main_line",
              children: [
              {
                fen: "rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/5N2/PPP2PPP/RNBQKB1R b KQkq - 2 4",
                move: "Nf3", category: "main_line",
                children: [
                {
                  fen: "rn1qkbnr/pp3ppp/2p1p3/3pPb2/3P4/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 5",
                  move: "e6", category: "main_line",
                  children: [
                  {
                    fen: "rn1qkbnr/pp3ppp/2p1p3/3pPb2/3P4/5N2/PPP1BPPP/RNBQK2R b KQkq - 1 5",
                    move: "Be2", category: "main_line",
                    children: [
                    {
                      fen: "rn1qkbnr/pp3ppp/4p3/2ppPb2/3P4/5N2/PPP1BPPP/RNBQK2R w KQkq - 0 6",
                      move: "c5", category: "main_line",
                      children: [
                      {
                        fen: "rn1qkbnr/pp3ppp/4p3/2ppPb2/3P4/5N2/PPP1BPPP/RNBQ1RK1 b kq - 1 6",
                        move: "O-O", category: "main_line",
                        children: [
                        {
                          fen: "r2qkbnr/pp3ppp/2n1p3/2ppPb2/3P4/5N2/PPP1BPPP/RNBQ1RK1 w kq - 2 7",
                          move: "Nc6", category: "main_line",
                          children: [
                          {
                            fen: "r2qkbnr/pp3ppp/2n1p3/2ppPb2/3P4/2P2N2/PP2BPPP/RNBQ1RK1 b kq - 0 7",
                            move: "c3", category: "main_line",
                            children: [
                            {
                              fen: "r2qkbnr/pp3ppp/2n1p3/3pPb2/3p4/2P2N2/PP2BPPP/RNBQ1RK1 w kq - 0 8",
                              move: "cxd4", category: "main_line",
                              children: [
                              {
                                fen: "r2qkbnr/pp3ppp/2n1p3/3pPb2/3P4/5N2/PP2BPPP/RNBQ1RK1 b kq - 0 8",
                                move: "cxd4", category: "main_line",
                                children: [
                                {
                                  fen: "r2qkb1r/pp2nppp/2n1p3/3pPb2/3P4/5N2/PP2BPPP/RNBQ1RK1 w kq - 1 9",
                                  move: "Nge7", category: "main_line",
                                  children: [
                                  {
                                    fen: "r2qkb1r/pp2nppp/2n1p3/3pPb2/3P4/2N2N2/PP2BPPP/R1BQ1RK1 b kq - 2 9",
                                    move: "Nc3", category: "main_line",
                                    children: [
                                    {
                                      fen: "r2qkb1r/pp3ppp/2n1p1n1/3pPb2/3P4/2N2N2/PP2BPPP/R1BQ1RK1 w kq - 3 10",
                                      move: "Ng6", category: "main_line",
                                      children: [
                                      {
                                        fen: "r2qkb1r/pp3ppp/2n1p1n1/3pPb2/N2P4/5N2/PP2BPPP/R1BQ1RK1 b kq - 4 10",
                                        move: "Na4", category: "main_line",
                                        children: [
                                        {
                                          fen: "r2qk2r/pp2bppp/2n1p1n1/3pPb2/N2P4/5N2/PP2BPPP/R1BQ1RK1 w kq - 5 11",
                                          move: "Be7", category: "main_line",
                                          children: [
                                          {
                                            fen: "r2qk2r/pp2bppp/2n1p1n1/2NpPb2/3P4/5N2/PP2BPPP/R1BQ1RK1 b kq - 6 11",
                                            move: "Nc5", category: "main_line",
                                            children: [
                                            {
                                              fen: "r2q1rk1/pp2bppp/2n1p1n1/2NpPb2/3P4/5N2/PP2BPPP/R1BQ1RK1 w - - 7 12",
                                              move: "O-O", category: "main_line",
                                              children: []
                                            }
                                            ]
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const noahs_ark_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "e5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        move: "Nf3", category: "main_line",
        children: [
        {
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          move: "Nc6", category: "main_line",
          children: [
          {
            fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
            move: "Bb5", category: "main_line",
            children: [
            {
              fen: "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
              move: "a6", category: "main_line",
              children: [
              {
                fen: "r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 4",
                move: "Ba4", category: "main_line",
                children: [
                {
                  fen: "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5",
                  move: "Nf6", category: "main_line",
                  children: [
                  {
                    fen: "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 3 5",
                    move: "O-O", category: "main_line",
                    children: [
                    {
                      fen: "r1bqkb1r/1ppp1ppp/p1n5/4p3/B3n3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6",
                      move: "Nxe4", category: "main_line",
                      children: [
                      {
                        fen: "r1bqkb1r/1ppp1ppp/p1n5/4p3/B2Pn3/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 6",
                        move: "d4", category: "main_line",
                        children: [
                        {
                          fen: "r1bqkb1r/2pp1ppp/p1n5/1p2p3/B2Pn3/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 7",
                          move: "b5", category: "main_line",
                          children: [
                          {
                            fen: "r1bqkb1r/2pp1ppp/p1n5/1p2p3/3Pn3/1B3N2/PPP2PPP/RNBQ1RK1 b kq - 1 7",
                            move: "Bb3", category: "main_line",
                            children: [
                            {
                              fen: "r1bqkb1r/2p2ppp/p1n5/1p1pp3/3Pn3/1B3N2/PPP2PPP/RNBQ1RK1 w kq - 0 8",
                              move: "d5", category: "main_line",
                              children: [
                              {
                                fen: "r1bqkb1r/2p2ppp/p1n5/1p1pP3/4n3/1B3N2/PPP2PPP/RNBQ1RK1 b kq - 0 8",
                                move: "dxe5", category: "main_line",
                                children: [
                                {
                                  fen: "r2qkb1r/2p2ppp/p1n1b3/1p1pP3/4n3/1B3N2/PPP2PPP/RNBQ1RK1 w kq - 1 9",
                                  move: "Be6", category: "main_line",
                                  children: [
                                  {
                                    fen: "r2qkb1r/2p2ppp/p1n1b3/1p1pP3/4n3/1BP2N2/PP3PPP/RNBQ1RK1 b kq - 0 9",
                                    move: "c3", category: "main_line",
                                    children: [
                                    {
                                      fen: "r2qk2r/2p1bppp/p1n1b3/1p1pP3/4n3/1BP2N2/PP3PPP/RNBQ1RK1 w kq - 1 10",
                                      move: "Be7", category: "main_line",
                                      children: [
                                      {
                                        fen: "r2qk2r/2p1bppp/p1n1b3/1p1pP3/4n3/1BP2N2/PP1N1PPP/R1BQ1RK1 b kq - 2 10",
                                        move: "Nbd2", category: "main_line",
                                        children: [
                                        {
                                          fen: "r2q1rk1/2p1bppp/p1n1b3/1p1pP3/4n3/1BP2N2/PP1N1PPP/R1BQ1RK1 w - - 3 11",
                                          move: "O-O", category: "main_line",
                                          children: [
                                          {
                                            fen: "r2q1rk1/2p1bppp/p1n1b3/1p1pP3/4n3/1BP2N2/PP1N1PPP/R1BQR1K1 b - - 4 11",
                                            move: "Re1", category: "main_line",
                                            children: []
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const london_nc5_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [
    {
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [
      {
        fen: "rnbqkb1r/pppppppp/5n2/8/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2",
        move: "Bf4", category: "main_line",
        children: [
        {
          fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 0 3",
          move: "d5", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4P3/PPP2PPP/RN1QKBNR b KQkq - 0 3",
            move: "e3", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4",
              move: "c5", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/pp2pppp/5n2/2pp4/3P1B2/2P1P3/PP3PPP/RN1QKBNR b KQkq - 0 4",
                move: "c3", category: "main_line",
                children: [
                {
                  fen: "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P1B2/2P1P3/PP3PPP/RN1QKBNR w KQkq - 1 5",
                  move: "Nc6", category: "main_line",
                  children: [
                  {
                    fen: "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR b KQkq - 2 5",
                    move: "Nd2", category: "main_line",
                    children: [
                    {
                      fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR w KQkq - 0 6",
                      move: "e6", category: "main_line",
                      children: [
                      {
                        fen: "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P1B2/2P1PN2/PP1N1PPP/R2QKB1R b KQkq - 1 6",
                        move: "Ngf3", category: "main_line",
                        children: [
                        {
                          fen: "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P1B2/2P1PN2/PP1N1PPP/R2QKB1R w KQkq - 2 7",
                          move: "Bd6", category: "main_line",
                          children: [
                          {
                            fen: "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P4/2P1PNB1/PP1N1PPP/R2QKB1R b KQkq - 3 7",
                            move: "Bg3", category: "main_line",
                            children: [
                            {
                              fen: "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2P1PNB1/PP1N1PPP/R2QKB1R w KQ - 4 8",
                              move: "O-O", category: "main_line",
                              children: [
                              {
                                fen: "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2PBPNB1/PP1N1PPP/R2QK2R b KQ - 5 8",
                                move: "Bd3", category: "main_line",
                                children: [
                                {
                                  fen: "r1bq1rk1/p4ppp/1pnbpn2/2pp4/3P4/2PBPNB1/PP1N1PPP/R2QK2R w KQ - 0 9",
                                  move: "b6", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1bq1rk1/p4ppp/1pnbpn2/2ppN3/3P4/2PBP1B1/PP1N1PPP/R2QK2R b KQ - 1 9",
                                    move: "Ne5", category: "main_line",
                                    children: [
                                    {
                                      fen: "r2q1rk1/pb3ppp/1pnbpn2/2ppN3/3P4/2PBP1B1/PP1N1PPP/R2QK2R w KQ - 2 10",
                                      move: "Bb7", category: "main_line",
                                      children: [
                                      {
                                        fen: "r2q1rk1/pb3ppp/1pnbpn2/2ppN3/3P1P2/2PBP1B1/PP1N2PP/R2QK2R b KQ - 0 10",
                                        move: "f4", category: "main_line",
                                        children: [
                                        {
                                          fen: "r2q1rk1/pb2nppp/1p1bpn2/2ppN3/3P1P2/2PBP1B1/PP1N2PP/R2QK2R w KQ - 1 11",
                                          move: "Ne7", category: "main_line",
                                          children: []
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const scotch_qh4_refute_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "e5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        move: "Nf3", category: "main_line",
        children: [
        {
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          move: "Nc6", category: "main_line",
          children: [
          {
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
            move: "d4", category: "main_line",
            children: [
            {
              fen: "r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
              move: "exd4", category: "main_line",
              children: [
              {
                fen: "r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4",
                move: "Nxd4", category: "main_line",
                children: [
                {
                  fen: "r1b1kbnr/pppp1ppp/2n5/8/3NP2q/8/PPP2PPP/RNBQKB1R w KQkq - 1 5",
                  move: "Qh4", category: "main_line",
                  children: [
                  {
                    fen: "r1b1kbnr/pppp1ppp/2n5/8/3NP2q/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5",
                    move: "Nc3", category: "main_line",
                    children: [
                    {
                      fen: "r1b1k1nr/pppp1ppp/2n5/8/1b1NP2q/2N5/PPP2PPP/R1BQKB1R w KQkq - 3 6",
                      move: "Bb4", category: "main_line",
                      children: [
                      {
                        fen: "r1b1k1nr/pppp1ppp/2n5/8/1b1NP2q/2N5/PPP1BPPP/R1BQK2R b KQkq - 4 6",
                        move: "Be2", category: "main_line",
                        children: [
                        {
                          fen: "r1b1k1nr/pppp1ppp/2n5/8/1b1Nq3/2N5/PPP1BPPP/R1BQK2R w KQkq - 0 7",
                          move: "Qxe4", category: "main_line",
                          children: [
                          {
                            fen: "r1b1k1nr/pppp1ppp/2n5/1N6/1b2q3/2N5/PPP1BPPP/R1BQK2R b KQkq - 1 7",
                            move: "Nb5", category: "main_line",
                            children: [
                            {
                              fen: "r1bk2nr/pppp1ppp/2n5/1N6/1b2q3/2N5/PPP1BPPP/R1BQK2R w KQ - 2 8",
                              move: "Kd8", category: "main_line",
                              children: [
                              {
                                fen: "r1bk2nr/pppp1ppp/2n5/1N6/1b2q3/2N5/PPP1BPPP/R1BQ1RK1 b - - 3 8",
                                move: "O-O", category: "main_line",
                                children: [
                                {
                                  fen: "r1bk2nr/pppp1ppp/2n5/1N6/4q3/2b5/PPP1BPPP/R1BQ1RK1 w - - 0 9",
                                  move: "Bxc3", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1bk2nr/pppp1ppp/2n5/1N6/4q3/2P5/P1P1BPPP/R1BQ1RK1 b - - 0 9",
                                    move: "bxc3", category: "main_line",
                                    children: []
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const dutch_staunton_refute_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      move: "f5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/ppppp1pp/8/5p2/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2",
        move: "e4", category: "main_line",
        children: [
        {
          fen: "rnbqkbnr/ppppp1pp/8/8/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
          move: "fxe4", category: "main_line",
          children: [
          {
            fen: "rnbqkbnr/ppppp1pp/8/8/3Pp3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/ppppp1pp/5n2/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
              move: "Nf6", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/ppppp1pp/5n2/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR b KQkq - 3 4",
                move: "Bg5", category: "main_line",
                children: [
                {
                  fen: "rnbqkb1r/pppp2pp/4pn2/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR w KQkq - 0 5",
                  move: "e6", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkb1r/pppp2pp/4pn2/6B1/3PN3/8/PPP2PPP/R2QKBNR b KQkq - 0 5",
                    move: "Nxe4", category: "main_line",
                    children: [
                    {
                      fen: "rnbqk2r/ppppb1pp/4pn2/6B1/3PN3/8/PPP2PPP/R2QKBNR w KQkq - 1 6",
                      move: "Be7", category: "main_line",
                      children: [
                      {
                        fen: "rnbqk2r/ppppb1pp/4pB2/8/3PN3/8/PPP2PPP/R2QKBNR b KQkq - 0 6",
                        move: "Bxf6", category: "main_line",
                        children: [
                        {
                          fen: "rnbqk2r/pppp2pp/4pb2/8/3PN3/8/PPP2PPP/R2QKBNR w KQkq - 0 7",
                          move: "Bxf6", category: "main_line",
                          children: [
                          {
                            fen: "rnbqk2r/pppp2pp/4pb2/8/3PN3/5N2/PPP2PPP/R2QKB1R b KQkq - 1 7",
                            move: "Nf3", category: "main_line",
                            children: [
                            {
                              fen: "rnbq1rk1/pppp2pp/4pb2/8/3PN3/5N2/PPP2PPP/R2QKB1R w KQ - 2 8",
                              move: "O-O", category: "main_line",
                              children: [
                              {
                                fen: "rnbq1rk1/pppp2pp/4pb2/8/3PN3/3B1N2/PPP2PPP/R2QK2R b KQ - 3 8",
                                move: "Bd3", category: "main_line",
                                children: [
                                {
                                  fen: "rnbq1rk1/ppp3pp/4pb2/3p4/3PN3/3B1N2/PPP2PPP/R2QK2R w KQ - 0 9",
                                  move: "d5", category: "main_line",
                                  children: [
                                  {
                                    fen: "rnbq1rk1/ppp3pp/4pb2/3p4/3P4/3B1NN1/PPP2PPP/R2QK2R b KQ - 1 9",
                                    move: "Ng3", category: "main_line",
                                    children: [
                                    {
                                      fen: "r1bq1rk1/pppn2pp/4pb2/3p4/3P4/3B1NN1/PPP2PPP/R2QK2R w KQ - 2 10",
                                      move: "Nd7", category: "main_line",
                                      children: []
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const pirc_e5_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "d6", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/ppp1pppp/3p4/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2",
        move: "d4", category: "main_line",
        children: [
        {
          fen: "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3",
          move: "Nf6", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 3",
            move: "Nc3", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4",
              move: "g6", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/ppp1pp1p/3p1np1/8/3PPP2/2N5/PPP3PP/R1BQKBNR b KQkq - 0 4",
                move: "f4", category: "main_line",
                children: [
                {
                  fen: "rnbqk2r/ppp1ppbp/3p1np1/8/3PPP2/2N5/PPP3PP/R1BQKBNR w KQkq - 1 5",
                  move: "Bg7", category: "main_line",
                  children: [
                  {
                    fen: "rnbqk2r/ppp1ppbp/3p1np1/8/3PPP2/2N2N2/PPP3PP/R1BQKB1R b KQkq - 2 5",
                    move: "Nf3", category: "main_line",
                    children: [
                    {
                      fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/3PPP2/2N2N2/PPP3PP/R1BQKB1R w KQ - 3 6",
                      move: "O-O", category: "main_line",
                      children: [
                      {
                        fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/3PPP2/2N2N2/PPP1B1PP/R1BQK2R b KQ - 4 6",
                        move: "Be2", category: "main_line",
                        children: [
                        {
                          fen: "rnbq1rk1/pp2ppbp/3p1np1/2p5/3PPP2/2N2N2/PPP1B1PP/R1BQK2R w KQ - 0 7",
                          move: "c5", category: "main_line",
                          children: [
                          {
                            fen: "rnbq1rk1/pp2ppbp/3p1np1/2P5/4PP2/2N2N2/PPP1B1PP/R1BQK2R b KQ - 0 7",
                            move: "dxc5", category: "main_line",
                            children: [
                            {
                              fen: "rnb2rk1/pp2ppbp/3p1np1/q1P5/4PP2/2N2N2/PPP1B1PP/R1BQK2R w KQ - 1 8",
                              move: "Qa5", category: "main_line",
                              children: [
                              {
                                fen: "rnb2rk1/pp2ppbp/3p1np1/q1P5/4PP2/2N2N2/PPP1B1PP/R1BQ1RK1 b - - 2 8",
                                move: "O-O", category: "main_line",
                                children: [
                                {
                                  fen: "rnb2rk1/pp2ppbp/3p1np1/2q5/4PP2/2N2N2/PPP1B1PP/R1BQ1RK1 w - - 0 9",
                                  move: "Qxc5+", category: "main_line",
                                  children: [
                                  {
                                    fen: "rnb2rk1/pp2ppbp/3p1np1/2q5/4PP2/2N2N2/PPP1B1PP/R1BQ1R1K b - - 1 9",
                                    move: "Kh1", category: "main_line",
                                    children: [
                                    {
                                      fen: "r1b2rk1/pp2ppbp/2np1np1/2q5/4PP2/2N2N2/PPP1B1PP/R1BQ1R1K w - - 2 10",
                                      move: "Nc6", category: "main_line",
                                      children: [
                                      {
                                        fen: "r1b2rk1/pp2ppbp/2np1np1/2qN4/4PP2/5N2/PPP1B1PP/R1BQ1R1K b - - 3 10",
                                        move: "Nd5", category: "main_line",
                                        children: [
                                        {
                                          fen: "r1b2rk1/pp2ppbp/2np2p1/2qn4/4PP2/5N2/PPP1B1PP/R1BQ1R1K w - - 0 11",
                                          move: "Nxd5", category: "main_line",
                                          children: [
                                          {
                                            fen: "r1b2rk1/pp2ppbp/2np2p1/2qP4/5P2/5N2/PPP1B1PP/R1BQ1R1K b - - 0 11",
                                            move: "exd5", category: "main_line",
                                            children: [
                                            {
                                              fen: "r1b2rk1/pp2ppbp/3p2p1/2qP4/1n3P2/5N2/PPP1B1PP/R1BQ1R1K w - - 1 12",
                                              move: "Nb4", category: "main_line",
                                              children: []
                                            }
                                            ]
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const scandi_pin_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "d5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2",
        move: "exd5", category: "main_line",
        children: [
        {
          fen: "rnb1kbnr/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3",
          move: "Qxd5", category: "main_line",
          children: [
          {
            fen: "rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [
            {
              fen: "rnb1kbnr/ppp1pppp/8/q7/8/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 4",
              move: "Qa5", category: "main_line",
              children: [
              {
                fen: "rnb1kbnr/ppp1pppp/8/q7/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 4",
                move: "d4", category: "main_line",
                children: [
                {
                  fen: "rnb1kb1r/ppp1pppp/5n2/q7/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 5",
                  move: "Nf6", category: "main_line",
                  children: [
                  {
                    fen: "rnb1kb1r/ppp1pppp/5n2/q7/3P4/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 2 5",
                    move: "Nf3", category: "main_line",
                    children: [
                    {
                      fen: "rn2kb1r/ppp1pppp/5n2/q4b2/3P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 3 6",
                      move: "Bf5", category: "main_line",
                      children: [
                      {
                        fen: "rn2kb1r/ppp1pppp/5n2/q4b2/2BP4/2N2N2/PPP2PPP/R1BQK2R b KQkq - 4 6",
                        move: "Bc4", category: "main_line",
                        children: [
                        {
                          fen: "rn2kb1r/ppp2ppp/4pn2/q4b2/2BP4/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 7",
                          move: "e6", category: "main_line",
                          children: [
                          {
                            fen: "rn2kb1r/ppp2ppp/4pn2/q4b2/2BP4/2N2N2/PPPB1PPP/R2QK2R b KQkq - 1 7",
                            move: "Bd2", category: "main_line",
                            children: [
                            {
                              fen: "rn2kb1r/pp3ppp/2p1pn2/q4b2/2BP4/2N2N2/PPPB1PPP/R2QK2R w KQkq - 0 8",
                              move: "c6", category: "main_line",
                              children: [
                              {
                                fen: "rn2kb1r/pp3ppp/2p1pn2/q2N1b2/2BP4/5N2/PPPB1PPP/R2QK2R b KQkq - 1 8",
                                move: "Nd5", category: "main_line",
                                children: [
                                {
                                  fen: "rn1qkb1r/pp3ppp/2p1pn2/3N1b2/2BP4/5N2/PPPB1PPP/R2QK2R w KQkq - 2 9",
                                  move: "Qd8", category: "main_line",
                                  children: [
                                  {
                                    fen: "rn1qkb1r/pp3ppp/2p1pN2/5b2/2BP4/5N2/PPPB1PPP/R2QK2R b KQkq - 0 9",
                                    move: "Nxf6+", category: "main_line",
                                    children: [
                                    {
                                      fen: "rn2kb1r/pp3ppp/2p1pq2/5b2/2BP4/5N2/PPPB1PPP/R2QK2R w KQkq - 0 10",
                                      move: "Qxf6", category: "main_line",
                                      children: []
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const english_fork_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1",
    move: "c4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2",
      move: "e5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR b KQkq - 1 2",
        move: "Nc3", category: "main_line",
        children: [
        {
          fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq - 2 3",
          move: "Nf6", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R b KQkq - 3 3",
            move: "Nf3", category: "main_line",
            children: [
            {
              fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq - 4 4",
              move: "Nc6", category: "main_line",
              children: [
              {
                fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N1PN2/PP1P1PPP/R1BQKB1R b KQkq - 0 4",
                move: "e3", category: "main_line",
                children: [
                {
                  fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/1bP5/2N1PN2/PP1P1PPP/R1BQKB1R w KQkq - 1 5",
                  move: "Bb4", category: "main_line",
                  children: [
                  {
                    fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/1bP5/2N1PN2/PPQP1PPP/R1B1KB1R b KQkq - 2 5",
                    move: "Qc2", category: "main_line",
                    children: [
                    {
                      fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/2P5/2b1PN2/PPQP1PPP/R1B1KB1R w KQkq - 0 6",
                      move: "Bxc3", category: "main_line",
                      children: [
                      {
                        fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/2P5/2Q1PN2/PP1P1PPP/R1B1KB1R b KQkq - 0 6",
                        move: "Qxc3", category: "main_line",
                        children: [
                        {
                          fen: "r1b1k2r/ppppqppp/2n2n2/4p3/2P5/2Q1PN2/PP1P1PPP/R1B1KB1R w KQkq - 1 7",
                          move: "Qe7", category: "main_line",
                          children: [
                          {
                            fen: "r1b1k2r/ppppqppp/2n2n2/4p3/2P5/P1Q1PN2/1P1P1PPP/R1B1KB1R b KQkq - 0 7",
                            move: "a3", category: "main_line",
                            children: [
                            {
                              fen: "r1b1k2r/ppp1qppp/2n2n2/3pp3/2P5/P1Q1PN2/1P1P1PPP/R1B1KB1R w KQkq - 0 8",
                              move: "d5", category: "main_line",
                              children: [
                              {
                                fen: "r1b1k2r/ppp1qppp/2n2n2/3Pp3/8/P1Q1PN2/1P1P1PPP/R1B1KB1R b KQkq - 0 8",
                                move: "cxd5", category: "main_line",
                                children: [
                                {
                                  fen: "r1b1k2r/ppp1qppp/2n5/3np3/8/P1Q1PN2/1P1P1PPP/R1B1KB1R w KQkq - 0 9",
                                  move: "Nxd5", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1b1k2r/ppp1qppp/2n5/3np3/8/P3PN2/1PQP1PPP/R1B1KB1R b KQkq - 1 9",
                                    move: "Qc2", category: "main_line",
                                    children: [
                                    {
                                      fen: "r3k2r/ppp1qppp/2n1b3/3np3/8/P3PN2/1PQP1PPP/R1B1KB1R w KQkq - 2 10",
                                      move: "Be6", category: "main_line",
                                      children: [
                                      {
                                        fen: "r3k2r/ppp1qppp/2n1b3/3np3/2B5/P3PN2/1PQP1PPP/R1B1K2R b KQkq - 3 10",
                                        move: "Bc4", category: "main_line",
                                        children: [
                                        {
                                          fen: "2kr3r/ppp1qppp/2n1b3/3np3/2B5/P3PN2/1PQP1PPP/R1B1K2R w KQ - 4 11",
                                          move: "O-O-O", category: "main_line",
                                          children: [
                                          {
                                            fen: "2kr3r/ppp1qppp/2n1b3/3np3/2B5/P3PN2/1PQP1PPP/R1B2RK1 b - - 5 11",
                                            move: "O-O", category: "main_line",
                                            children: []
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const nimzo_pawn_fork_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [
    {
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [
      {
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        move: "c4", category: "main_line",
        children: [
        {
          fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "e6", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [
            {
              fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
              move: "Bb4", category: "main_line",
              children: [
              {
                fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/P1N5/1P2PPPP/R1BQKBNR b KQkq - 0 4",
                move: "a3", category: "main_line",
                children: [
                {
                  fen: "rnbqk2r/pppp1ppp/4pn2/8/2PP4/P1b5/1P2PPPP/R1BQKBNR w KQkq - 0 5",
                  move: "Bxc3+", category: "main_line",
                  children: [
                  {
                    fen: "rnbqk2r/pppp1ppp/4pn2/8/2PP4/P1P5/4PPPP/R1BQKBNR b KQkq - 0 5",
                    move: "bxc3", category: "main_line",
                    children: [
                    {
                      fen: "rnbqk2r/pp1p1ppp/4pn2/2p5/2PP4/P1P5/4PPPP/R1BQKBNR w KQkq - 0 6",
                      move: "c5", category: "main_line",
                      children: [
                      {
                        fen: "rnbqk2r/pp1p1ppp/4pn2/2p5/2PP4/P1P2P2/4P1PP/R1BQKBNR b KQkq - 0 6",
                        move: "f3", category: "main_line",
                        children: [
                        {
                          fen: "rnbqk2r/pp3ppp/4pn2/2pp4/2PP4/P1P2P2/4P1PP/R1BQKBNR w KQkq - 0 7",
                          move: "d5", category: "main_line",
                          children: [
                          {
                            fen: "rnbqk2r/pp3ppp/4pn2/2pP4/3P4/P1P2P2/4P1PP/R1BQKBNR b KQkq - 0 7",
                            move: "cxd5", category: "main_line",
                            children: [
                            {
                              fen: "rnbqk2r/pp3ppp/4p3/2pn4/3P4/P1P2P2/4P1PP/R1BQKBNR w KQkq - 0 8",
                              move: "Nxd5", category: "main_line",
                              children: [
                              {
                                fen: "rnbqk2r/pp3ppp/4p3/2Pn4/8/P1P2P2/4P1PP/R1BQKBNR b KQkq - 0 8",
                                move: "dxc5", category: "main_line",
                                children: [
                                {
                                  fen: "rnb1k2r/pp3ppp/4p3/q1Pn4/8/P1P2P2/4P1PP/R1BQKBNR w KQkq - 1 9",
                                  move: "Qa5", category: "main_line",
                                  children: [
                                  {
                                    fen: "rnb1k2r/pp3ppp/4p3/q1Pn4/4P3/P1P2P2/6PP/R1BQKBNR b KQkq - 0 9",
                                    move: "e4", category: "main_line",
                                    children: [
                                    {
                                      fen: "rnb1k2r/pp3ppp/4p3/q1P5/4P3/P1P1nP2/6PP/R1BQKBNR w KQkq - 1 10",
                                      move: "Ne3", category: "main_line",
                                      children: [
                                      {
                                        fen: "rnb1k2r/pp3ppp/4p3/q1P5/4P3/P1P1BP2/6PP/R2QKBNR b KQkq - 0 10",
                                        move: "Bxe3", category: "main_line",
                                        children: [
                                        {
                                          fen: "rnb1k2r/pp3ppp/4p3/2P5/4P3/P1q1BP2/6PP/R2QKBNR w KQkq - 0 11",
                                          move: "Qxc3+", category: "main_line",
                                          children: [
                                          {
                                            fen: "rnb1k2r/pp3ppp/4p3/2P5/4P3/P1q1BP2/4K1PP/R2Q1BNR b kq - 1 11",
                                            move: "Ke2", category: "main_line",
                                            children: [
                                            {
                                              fen: "rnb1k2r/pp3ppp/4p3/2P5/4P3/P3BP2/4K1PP/q2Q1BNR w kq - 0 12",
                                              move: "Qxa1", category: "main_line",
                                              children: []
                                            }
                                            ]
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const grunfeld_swindle_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [
    {
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [
      {
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        move: "c4", category: "main_line",
        children: [
        {
          fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "g6", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
              move: "d5", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/ppp1pp1p/5np1/3P4/3P4/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 4",
                move: "cxd5", category: "main_line",
                children: [
                {
                  fen: "rnbqkb1r/ppp1pp1p/6p1/3n4/3P4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5",
                  move: "Nxd5", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkb1r/ppp1pp1p/6p1/3n4/3PP3/2N5/PP3PPP/R1BQKBNR b KQkq - 0 5",
                    move: "e4", category: "main_line",
                    children: [
                    {
                      fen: "rnbqkb1r/ppp1pp1p/6p1/8/3PP3/2n5/PP3PPP/R1BQKBNR w KQkq - 0 6",
                      move: "Nxc3", category: "main_line",
                      children: [
                      {
                        fen: "rnbqkb1r/ppp1pp1p/6p1/8/3PP3/2P5/P4PPP/R1BQKBNR b KQkq - 0 6",
                        move: "bxc3", category: "main_line",
                        children: [
                        {
                          fen: "rnbqk2r/ppp1ppbp/6p1/8/3PP3/2P5/P4PPP/R1BQKBNR w KQkq - 1 7",
                          move: "Bg7", category: "main_line",
                          children: [
                          {
                            fen: "rnbqk2r/ppp1ppbp/6p1/8/2BPP3/2P5/P4PPP/R1BQK1NR b KQkq - 2 7",
                            move: "Bc4", category: "main_line",
                            children: [
                            {
                              fen: "rnbqk2r/pp2ppbp/6p1/2p5/2BPP3/2P5/P4PPP/R1BQK1NR w KQkq - 0 8",
                              move: "c5", category: "main_line",
                              children: [
                              {
                                fen: "rnbqk2r/pp2ppbp/6p1/2p5/2BPP3/2P5/P3NPPP/R1BQK2R b KQkq - 1 8",
                                move: "Ne2", category: "main_line",
                                children: [
                                {
                                  fen: "r1bqk2r/pp2ppbp/2n3p1/2p5/2BPP3/2P5/P3NPPP/R1BQK2R w KQkq - 2 9",
                                  move: "Nc6", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1bqk2r/pp2ppbp/2n3p1/2p5/2BPP3/2P1B3/P3NPPP/R2QK2R b KQkq - 3 9",
                                    move: "Be3", category: "main_line",
                                    children: [
                                    {
                                      fen: "r1bq1rk1/pp2ppbp/2n3p1/2p5/2BPP3/2P1B3/P3NPPP/R2QK2R w KQ - 4 10",
                                      move: "O-O", category: "main_line",
                                      children: [
                                      {
                                        fen: "r1bq1rk1/pp2ppbp/2n3p1/2p5/2BPP3/2P1B3/P3NPPP/R2Q1RK1 b - - 5 10",
                                        move: "O-O", category: "main_line",
                                        children: [
                                        {
                                          fen: "r2q1rk1/pp2ppbp/2n3p1/2p5/2BPP1b1/2P1B3/P3NPPP/R2Q1RK1 w - - 6 11",
                                          move: "Bg4", category: "main_line",
                                          children: [
                                          {
                                            fen: "r2q1rk1/pp2ppbp/2n3p1/2p5/2BPP1b1/2P1BP2/P3N1PP/R2Q1RK1 b - - 0 11",
                                            move: "f3", category: "main_line",
                                            children: [
                                            {
                                              fen: "r2q1rk1/pp2ppbp/6p1/n1p5/2BPP1b1/2P1BP2/P3N1PP/R2Q1RK1 w - - 1 12",
                                              move: "Na5", category: "main_line",
                                              children: [
                                              {
                                                fen: "r2q1rk1/pp2ppbp/6p1/n1p5/3PP1b1/2PBBP2/P3N1PP/R2Q1RK1 b - - 2 12",
                                                move: "Bd3", category: "main_line",
                                                children: [
                                                {
                                                  fen: "r2q1rk1/pp2ppbp/6p1/n7/3pP1b1/2PBBP2/P3N1PP/R2Q1RK1 w - - 0 13",
                                                  move: "cxd4", category: "main_line",
                                                  children: [
                                                  {
                                                    fen: "r2q1rk1/pp2ppbp/6p1/n7/3PP1b1/3BBP2/P3N1PP/R2Q1RK1 b - - 0 13",
                                                    move: "cxd4", category: "main_line",
                                                    children: [
                                                    {
                                                      fen: "r2q1rk1/pp2ppbp/4b1p1/n7/3PP3/3BBP2/P3N1PP/R2Q1RK1 w - - 1 14",
                                                      move: "Be6", category: "main_line",
                                                      children: []
                                                    }
                                                    ]
                                                  }
                                                  ]
                                                }
                                                ]
                                              }
                                              ]
                                            }
                                            ]
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const alekhine_overextension_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [
      {
        fen: "rnbqkb1r/pppppppp/5n2/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2",
        move: "e5", category: "main_line",
        children: [
        {
          fen: "rnbqkb1r/pppppppp/8/3nP3/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3",
          move: "Nd5", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/pppppppp/8/3nP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
            move: "d4", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/ppp1pppp/3p4/3nP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4",
              move: "d6", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/ppp1pppp/3p4/3nP3/2PP4/8/PP3PPP/RNBQKBNR b KQkq - 0 4",
                move: "c4", category: "main_line",
                children: [
                {
                  fen: "rnbqkb1r/ppp1pppp/1n1p4/4P3/2PP4/8/PP3PPP/RNBQKBNR w KQkq - 1 5",
                  move: "Nb6", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkb1r/ppp1pppp/1n1p4/4P3/2PP1P2/8/PP4PP/RNBQKBNR b KQkq - 0 5",
                    move: "f4", category: "main_line",
                    children: [
                    {
                      fen: "rnbqkb1r/ppp1pppp/1n6/4p3/2PP1P2/8/PP4PP/RNBQKBNR w KQkq - 0 6",
                      move: "dxe5", category: "main_line",
                      children: [
                      {
                        fen: "rnbqkb1r/ppp1pppp/1n6/4P3/2PP4/8/PP4PP/RNBQKBNR b KQkq - 0 6",
                        move: "fxe5", category: "main_line",
                        children: [
                        {
                          fen: "r1bqkb1r/ppp1pppp/1nn5/4P3/2PP4/8/PP4PP/RNBQKBNR w KQkq - 1 7",
                          move: "Nc6", category: "main_line",
                          children: [
                          {
                            fen: "r1bqkb1r/ppp1pppp/1nn5/4P3/2PP4/4B3/PP4PP/RN1QKBNR b KQkq - 2 7",
                            move: "Be3", category: "main_line",
                            children: [
                            {
                              fen: "r2qkb1r/ppp1pppp/1nn5/4Pb2/2PP4/4B3/PP4PP/RN1QKBNR w KQkq - 3 8",
                              move: "Bf5", category: "main_line",
                              children: [
                              {
                                fen: "r2qkb1r/ppp1pppp/1nn5/4Pb2/2PP4/2N1B3/PP4PP/R2QKBNR b KQkq - 4 8",
                                move: "Nc3", category: "main_line",
                                children: [
                                {
                                  fen: "r2qkb1r/ppp2ppp/1nn1p3/4Pb2/2PP4/2N1B3/PP4PP/R2QKBNR w KQkq - 0 9",
                                  move: "e6", category: "main_line",
                                  children: [
                                  {
                                    fen: "r2qkb1r/ppp2ppp/1nn1p3/4Pb2/2PP4/2N1BN2/PP4PP/R2QKB1R b KQkq - 1 9",
                                    move: "Nf3", category: "main_line",
                                    children: [
                                    {
                                      fen: "r2qk2r/ppp2ppp/1nn1p3/4Pb2/1bPP4/2N1BN2/PP4PP/R2QKB1R w KQkq - 2 10",
                                      move: "Bb4", category: "main_line",
                                      children: [
                                      {
                                        fen: "r2qk2r/ppp2ppp/1nn1p3/4Pb2/1bPP4/2N1BN2/PP4PP/2RQKB1R b Kkq - 3 10",
                                        move: "Rc1", category: "main_line",
                                        children: [
                                        {
                                          fen: "r2qk2r/ppp2ppp/1nn1p3/4Pb2/2PP4/2b1BN2/PP4PP/2RQKB1R w Kkq - 0 11",
                                          move: "Bxc3+", category: "main_line",
                                          children: [
                                          {
                                            fen: "r2qk2r/ppp2ppp/1nn1p3/4Pb2/2PP4/2R1BN2/PP4PP/3QKB1R b Kkq - 0 11",
                                            move: "Rxc3", category: "main_line",
                                            children: [
                                            {
                                              fen: "r2q1rk1/ppp2ppp/1nn1p3/4Pb2/2PP4/2R1BN2/PP4PP/3QKB1R w K - 1 12",
                                              move: "O-O", category: "main_line",
                                              children: []
                                            }
                                            ]
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const vienna_frankenstein_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "e5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2",
        move: "Nc3", category: "main_line",
        children: [
        {
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3",
          move: "Nc6", category: "main_line",
          children: [
          {
            fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR b KQkq - 3 3",
            move: "Bc4", category: "main_line",
            children: [
            {
              fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq - 4 4",
              move: "Bc5", category: "main_line",
              children: [
              {
                fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P1Q1/2N5/PPPP1PPP/R1B1K1NR b KQkq - 5 4",
                move: "Qg4", category: "main_line",
                children: [
                {
                  fen: "r1bqk1nr/pppp1p1p/2n3p1/2b1p3/2B1P1Q1/2N5/PPPP1PPP/R1B1K1NR w KQkq - 0 5",
                  move: "g6", category: "main_line",
                  children: [
                  {
                    fen: "r1bqk1nr/pppp1p1p/2n3p1/2b1p3/2B1P3/2N2Q2/PPPP1PPP/R1B1K1NR b KQkq - 1 5",
                    move: "Qf3", category: "main_line",
                    children: [
                    {
                      fen: "r1bqk2r/pppp1p1p/2n2np1/2b1p3/2B1P3/2N2Q2/PPPP1PPP/R1B1K1NR w KQkq - 2 6",
                      move: "Nf6", category: "main_line",
                      children: [
                      {
                        fen: "r1bqk2r/pppp1p1p/2n2np1/2b1p3/2B1P3/2N2Q2/PPPPNPPP/R1B1K2R b KQkq - 3 6",
                        move: "Nge2", category: "main_line",
                        children: [
                        {
                          fen: "r1bqk2r/ppp2p1p/2np1np1/2b1p3/2B1P3/2N2Q2/PPPPNPPP/R1B1K2R w KQkq - 0 7",
                          move: "d6", category: "main_line",
                          children: [
                          {
                            fen: "r1bqk2r/ppp2p1p/2np1np1/2b1p3/2B1P3/2NP1Q2/PPP1NPPP/R1B1K2R b KQkq - 0 7",
                            move: "d3", category: "main_line",
                            children: [
                            {
                              fen: "r2qk2r/ppp2p1p/2np1np1/2b1p3/2B1P1b1/2NP1Q2/PPP1NPPP/R1B1K2R w KQkq - 1 8",
                              move: "Bg4", category: "main_line",
                              children: [
                              {
                                fen: "r2qk2r/ppp2p1p/2np1np1/2b1p3/2B1P1b1/2NP2Q1/PPP1NPPP/R1B1K2R b KQkq - 2 8",
                                move: "Qg3", category: "main_line",
                                children: [
                                {
                                  fen: "r2q1rk1/ppp2p1p/2np1np1/2b1p3/2B1P1b1/2NP2Q1/PPP1NPPP/R1B1K2R w KQ - 3 9",
                                  move: "O-O", category: "main_line",
                                  children: [
                                  {
                                    fen: "r2q1rk1/ppp2p1p/2np1np1/2b1p1B1/2B1P1b1/2NP2Q1/PPP1NPPP/R3K2R b KQ - 4 9",
                                    move: "Bg5", category: "main_line",
                                    children: []
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const catalan_diagonal_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [
    {
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [
      {
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        move: "c4", category: "main_line",
        children: [
        {
          fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "e6", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3",
            move: "g3", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq - 0 4",
              move: "d5", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq - 1 4",
                move: "Bg2", category: "main_line",
                children: [
                {
                  fen: "rnbqkb1r/ppp2ppp/4pn2/8/2pP4/6P1/PP2PPBP/RNBQK1NR w KQkq - 0 5",
                  move: "dxc4", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkb1r/ppp2ppp/4pn2/8/2pP4/5NP1/PP2PPBP/RNBQK2R b KQkq - 1 5",
                    move: "Nf3", category: "main_line",
                    children: [
                    {
                      fen: "rnbqkb1r/1pp2ppp/p3pn2/8/2pP4/5NP1/PP2PPBP/RNBQK2R w KQkq - 0 6",
                      move: "a6", category: "main_line",
                      children: [
                      {
                        fen: "rnbqkb1r/1pp2ppp/p3pn2/8/2pP4/5NP1/PP2PPBP/RNBQ1RK1 b kq - 1 6",
                        move: "O-O", category: "main_line",
                        children: [
                        {
                          fen: "rnbqkb1r/2p2ppp/p3pn2/1p6/2pP4/5NP1/PP2PPBP/RNBQ1RK1 w kq - 0 7",
                          move: "b5", category: "main_line",
                          children: [
                          {
                            fen: "rnbqkb1r/2p2ppp/p3pn2/1p2N3/2pP4/6P1/PP2PPBP/RNBQ1RK1 b kq - 1 7",
                            move: "Ne5", category: "main_line",
                            children: [
                            {
                              fen: "rnbqkb1r/2p2ppp/p3p3/1p1nN3/2pP4/6P1/PP2PPBP/RNBQ1RK1 w kq - 2 8",
                              move: "Nd5", category: "main_line",
                              children: [
                              {
                                fen: "rnbqkb1r/2p2ppp/p3p3/1p1nN3/P1pP4/6P1/1P2PPBP/RNBQ1RK1 b kq - 0 8",
                                move: "a4", category: "main_line",
                                children: [
                                {
                                  fen: "rn1qkb1r/1bp2ppp/p3p3/1p1nN3/P1pP4/6P1/1P2PPBP/RNBQ1RK1 w kq - 1 9",
                                  move: "Bb7", category: "main_line",
                                  children: [
                                  {
                                    fen: "rn1qkb1r/1bp2ppp/p3p3/1P1nN3/2pP4/6P1/1P2PPBP/RNBQ1RK1 b kq - 0 9",
                                    move: "axb5", category: "main_line",
                                    children: [
                                    {
                                      fen: "rn1qkb1r/1bp2ppp/4p3/1p1nN3/2pP4/6P1/1P2PPBP/RNBQ1RK1 w kq - 0 10",
                                      move: "axb5", category: "main_line",
                                      children: [
                                      {
                                        fen: "Rn1qkb1r/1bp2ppp/4p3/1p1nN3/2pP4/6P1/1P2PPBP/1NBQ1RK1 b k - 0 10",
                                        move: "Rxa8", category: "main_line",
                                        children: [
                                        {
                                          fen: "bn1qkb1r/2p2ppp/4p3/1p1nN3/2pP4/6P1/1P2PPBP/1NBQ1RK1 w k - 0 11",
                                          move: "Bxa8", category: "main_line",
                                          children: [
                                          {
                                            fen: "bn1qkb1r/2p2ppp/2N1p3/1p1n4/2pP4/6P1/1P2PPBP/1NBQ1RK1 b k - 1 11",
                                            move: "Nc6", category: "main_line",
                                            children: []
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const benoni_taimanov_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    move: "d4", category: "main_line",
    children: [
    {
      fen: "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2",
      move: "Nf6", category: "main_line",
      children: [
      {
        fen: "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2",
        move: "c4", category: "main_line",
        children: [
        {
          fen: "rnbqkb1r/pp1ppppp/5n2/2p5/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "c5", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/pp1ppppp/5n2/2pP4/2P5/8/PP2PPPP/RNBQKBNR b KQkq - 0 3",
            move: "d5", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/p2ppppp/5n2/1ppP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 0 4",
              move: "b5", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/p2ppppp/5n2/1PpP4/8/8/PP2PPPP/RNBQKBNR b KQkq - 0 4",
                move: "cxb5", category: "main_line",
                children: [
                {
                  fen: "rnbqkb1r/3ppppp/p4n2/1PpP4/8/8/PP2PPPP/RNBQKBNR w KQkq - 0 5",
                  move: "a6", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkb1r/3ppppp/P4n2/2pP4/8/8/PP2PPPP/RNBQKBNR b KQkq - 0 5",
                    move: "bxa6", category: "main_line",
                    children: [
                    {
                      fen: "rn1qkb1r/3ppppp/b4n2/2pP4/8/8/PP2PPPP/RNBQKBNR w KQkq - 0 6",
                      move: "Bxa6", category: "main_line",
                      children: [
                      {
                        fen: "rn1qkb1r/3ppppp/b4n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 6",
                        move: "Nc3", category: "main_line",
                        children: [
                        {
                          fen: "rn1qkb1r/4pppp/b2p1n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 7",
                          move: "d6", category: "main_line",
                          children: [
                          {
                            fen: "rn1qkb1r/4pppp/b2p1n2/2pP4/4P3/2N5/PP3PPP/R1BQKBNR b KQkq - 0 7",
                            move: "e4", category: "main_line",
                            children: [
                            {
                              fen: "rn1qkb1r/4pppp/3p1n2/2pP4/4P3/2N5/PP3PPP/R1BQKbNR w KQkq - 0 8",
                              move: "Bxf1", category: "main_line",
                              children: [
                              {
                                fen: "rn1qkb1r/4pppp/3p1n2/2pP4/4P3/2N5/PP3PPP/R1BQ1KNR b kq - 0 8",
                                move: "Kxf1", category: "main_line",
                                children: [
                                {
                                  fen: "rn1qkb1r/4pp1p/3p1np1/2pP4/4P3/2N5/PP3PPP/R1BQ1KNR w kq - 0 9",
                                  move: "g6", category: "main_line",
                                  children: [
                                  {
                                    fen: "rn1qkb1r/4pp1p/3p1np1/2pP4/4P3/2N2N2/PP3PPP/R1BQ1K1R b kq - 1 9",
                                    move: "Nf3", category: "main_line",
                                    children: [
                                    {
                                      fen: "rn1qk2r/4ppbp/3p1np1/2pP4/4P3/2N2N2/PP3PPP/R1BQ1K1R w kq - 2 10",
                                      move: "Bg7", category: "main_line",
                                      children: [
                                      {
                                        fen: "rn1qk2r/4ppbp/3p1np1/2pP4/4P3/2N2NP1/PP3P1P/R1BQ1K1R b kq - 0 10",
                                        move: "g3", category: "main_line",
                                        children: [
                                        {
                                          fen: "rn1q1rk1/4ppbp/3p1np1/2pP4/4P3/2N2NP1/PP3P1P/R1BQ1K1R w - - 1 11",
                                          move: "O-O", category: "main_line",
                                          children: [
                                          {
                                            fen: "rn1q1rk1/4ppbp/3p1np1/2pP4/4P3/2N2NP1/PP3PKP/R1BQ3R b - - 2 11",
                                            move: "Kg2", category: "main_line",
                                            children: [
                                            {
                                              fen: "r2q1rk1/3nppbp/3p1np1/2pP4/4P3/2N2NP1/PP3PKP/R1BQ3R w - - 3 12",
                                              move: "Nbd7", category: "main_line",
                                              children: []
                                            }
                                            ]
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const philidor_legal_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "e5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        move: "Nf3", category: "main_line",
        children: [
        {
          fen: "rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
          move: "d6", category: "main_line",
          children: [
          {
            fen: "rnbqkbnr/ppp2ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
            move: "d4", category: "main_line",
            children: [
            {
              fen: "rn1qkbnr/ppp2ppp/3p4/4p3/3PP1b1/5N2/PPP2PPP/RNBQKB1R w KQkq - 1 4",
              move: "Bg4", category: "main_line",
              children: [
              {
                fen: "rn1qkbnr/ppp2ppp/3p4/4P3/4P1b1/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 4",
                move: "dxe5", category: "main_line",
                children: [
                {
                  fen: "rn1qkbnr/ppp2ppp/3p4/4P3/4P3/5b2/PPP2PPP/RNBQKB1R w KQkq - 0 5",
                  move: "Bxf3", category: "main_line",
                  children: [
                  {
                    fen: "rn1qkbnr/ppp2ppp/3p4/4P3/4P3/5Q2/PPP2PPP/RNB1KB1R b KQkq - 0 5",
                    move: "Qxf3", category: "main_line",
                    children: [
                    {
                      fen: "rn1qkbnr/ppp2ppp/8/4p3/4P3/5Q2/PPP2PPP/RNB1KB1R w KQkq - 0 6",
                      move: "dxe5", category: "main_line",
                      children: [
                      {
                        fen: "rn1qkbnr/ppp2ppp/8/4p3/2B1P3/5Q2/PPP2PPP/RNB1K2R b KQkq - 1 6",
                        move: "Bc4", category: "main_line",
                        children: [
                        {
                          fen: "rn1qkb1r/ppp2ppp/5n2/4p3/2B1P3/5Q2/PPP2PPP/RNB1K2R w KQkq - 2 7",
                          move: "Nf6", category: "main_line",
                          children: [
                          {
                            fen: "rn1qkb1r/ppp2ppp/5n2/4p3/2B1P3/1Q6/PPP2PPP/RNB1K2R b KQkq - 3 7",
                            move: "Qb3", category: "main_line",
                            children: [
                            {
                              fen: "rn2kb1r/ppp1qppp/5n2/4p3/2B1P3/1Q6/PPP2PPP/RNB1K2R w KQkq - 4 8",
                              move: "Qe7", category: "main_line",
                              children: [
                              {
                                fen: "rn2kb1r/ppp1qppp/5n2/4p3/2B1P3/1QN5/PPP2PPP/R1B1K2R b KQkq - 5 8",
                                move: "Nc3", category: "main_line",
                                children: [
                                {
                                  fen: "rn2kb1r/pp2qppp/2p2n2/4p3/2B1P3/1QN5/PPP2PPP/R1B1K2R w KQkq - 0 9",
                                  move: "c6", category: "main_line",
                                  children: [
                                  {
                                    fen: "rn2kb1r/pp2qppp/2p2n2/4p1B1/2B1P3/1QN5/PPP2PPP/R3K2R b KQkq - 1 9",
                                    move: "Bg5", category: "main_line",
                                    children: [
                                    {
                                      fen: "rn2kb1r/p3qppp/2p2n2/1p2p1B1/2B1P3/1QN5/PPP2PPP/R3K2R w KQkq - 0 10",
                                      move: "b5", category: "main_line",
                                      children: [
                                      {
                                        fen: "rn2kb1r/p3qppp/2p2n2/1N2p1B1/2B1P3/1Q6/PPP2PPP/R3K2R b KQkq - 0 10",
                                        move: "Nxb5", category: "main_line",
                                        children: [
                                        {
                                          fen: "rn2kb1r/p3qppp/5n2/1p2p1B1/2B1P3/1Q6/PPP2PPP/R3K2R w KQkq - 0 11",
                                          move: "cxb5", category: "main_line",
                                          children: [
                                          {
                                            fen: "rn2kb1r/p3qppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/R3K2R b KQkq - 0 11",
                                            move: "Bxb5+", category: "main_line",
                                            children: [
                                            {
                                              fen: "r3kb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/R3K2R w KQkq - 1 12",
                                              move: "Nbd7", category: "main_line",
                                              children: [
                                              {
                                                fen: "r3kb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/R4RK1 b kq - 2 12",
                                                move: "O-O", category: "main_line",
                                                children: []
                                              }
                                              ]
                                            }
                                            ]
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];

const reti_center_strike_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1",
    move: "Nf3", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/ppp1pppp/8/3p4/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2",
      move: "d5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq - 0 2",
        move: "c4", category: "main_line",
        children: [
        {
          fen: "rnbqkbnr/ppp1pppp/8/8/2Pp4/5N2/PP1PPPPP/RNBQKB1R w KQkq - 0 3",
          move: "d4", category: "main_line",
          children: [
          {
            fen: "rnbqkbnr/ppp1pppp/8/8/2Pp4/4PN2/PP1P1PPP/RNBQKB1R b KQkq - 0 3",
            move: "e3", category: "main_line",
            children: [
            {
              fen: "rnbqkbnr/ppp1pppp/8/8/2P5/4pN2/PP1P1PPP/RNBQKB1R w KQkq - 0 4",
              move: "dxe3", category: "main_line",
              children: [
              {
                fen: "rnbqkbnr/ppp1pppp/8/8/2P5/4PN2/PP1P2PP/RNBQKB1R b KQkq - 0 4",
                move: "fxe3", category: "main_line",
                children: [
                {
                  fen: "rnbqkb1r/ppp1pppp/5n2/8/2P5/4PN2/PP1P2PP/RNBQKB1R w KQkq - 1 5",
                  move: "Nf6", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkb1r/ppp1pppp/5n2/8/2PP4/4PN2/PP4PP/RNBQKB1R b KQkq - 0 5",
                    move: "d4", category: "main_line",
                    children: [
                    {
                      fen: "rnbqkb1r/ppp2ppp/4pn2/8/2PP4/4PN2/PP4PP/RNBQKB1R w KQkq - 0 6",
                      move: "e6", category: "main_line",
                      children: [
                      {
                        fen: "rnbqkb1r/ppp2ppp/4pn2/8/2PP4/3BPN2/PP4PP/RNBQK2R b KQkq - 1 6",
                        move: "Bd3", category: "main_line",
                        children: [
                        {
                          fen: "rnbqkb1r/pp3ppp/4pn2/2p5/2PP4/3BPN2/PP4PP/RNBQK2R w KQkq - 0 7",
                          move: "c5", category: "main_line",
                          children: [
                          {
                            fen: "rnbqkb1r/pp3ppp/4pn2/2p5/2PP4/3BPN2/PP4PP/RNBQ1RK1 b kq - 1 7",
                            move: "O-O", category: "main_line",
                            children: [
                            {
                              fen: "r1bqkb1r/pp3ppp/2n1pn2/2p5/2PP4/3BPN2/PP4PP/RNBQ1RK1 w kq - 2 8",
                              move: "Nc6", category: "main_line",
                              children: [
                              {
                                fen: "r1bqkb1r/pp3ppp/2n1pn2/2p5/2PP4/2NBPN2/PP4PP/R1BQ1RK1 b kq - 3 8",
                                move: "Nc3", category: "main_line",
                                children: [
                                {
                                  fen: "r1bqk2r/pp2bppp/2n1pn2/2p5/2PP4/2NBPN2/PP4PP/R1BQ1RK1 w kq - 4 9",
                                  move: "Be7", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1bqk2r/pp2bppp/2n1pn2/2p5/2PPP3/2NB1N2/PP4PP/R1BQ1RK1 b kq - 0 9",
                                    move: "e4", category: "main_line",
                                    children: [
                                    {
                                      fen: "r1bqk2r/pp2bppp/2n1pn2/8/2PpP3/2NB1N2/PP4PP/R1BQ1RK1 w kq - 0 10",
                                      move: "cxd4", category: "main_line",
                                      children: [
                                      {
                                        fen: "r1bqk2r/pp2bppp/2n1pn2/8/2PNP3/2NB4/PP4PP/R1BQ1RK1 b kq - 0 10",
                                        move: "Nxd4", category: "main_line",
                                        children: [
                                        {
                                          fen: "r1bq1rk1/pp2bppp/2n1pn2/8/2PNP3/2NB4/PP4PP/R1BQ1RK1 w - - 1 11",
                                          move: "O-O", category: "main_line",
                                          children: [
                                          {
                                            fen: "r1bq1rk1/pp2bppp/2n1pn2/8/2PNP3/2NBB3/PP4PP/R2Q1RK1 b - - 2 11",
                                            move: "Be3", category: "main_line",
                                            children: []
                                          }
                                          ]
                                        }
                                        ]
                                      }
                                      ]
                                    }
                                    ]
                                  }
                                  ]
                                }
                                ]
                              }
                              ]
                            }
                            ]
                          }
                          ]
                        }
                        ]
                      }
                      ]
                    }
                    ]
                  }
                  ]
                }
                ]
              }
              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    }
    ]
  }
];


export const trapVariations: Record<string, VariationInfo> = {
  "italian-game": { id: "legals-mate-trap", name: "Legal's Mate Trap", description: "Punish Black's greedy Bg4 pin with a spectacular queen sacrifice.", plan: "After Black pins your knight with Bg4, sacrifice the queen with Nxe5! If Black takes the queen with Bxd1, play Bxf7+ Ke7 Nd5# for a beautiful checkmate.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 d6 4.Nc3 Bg4 5.Nxe5 Bxd1 6.Bxf7+ Ke7 7.Nd5", tree: legals_mate_trap_tree, depth: 13, isTrap: true },
  "sicilian-defense": { id: "sicilian-bc4-trap", name: "Bc4 Punisher", description: "Punish White's premature Bc4 with a central strike.", plan: "When White plays the amateur 2.Bc4, respond with e6 and d5! Black immediately equalizes and gains the initiative by striking the center.", startingMoves: "1.e4 c5 2.Bc4 e6 3.Nc3 a6 4.d3 d5 5.exd5 exd5 6.Bb3 Nf6 7.Nf3 Bd6 8.O-O O-O", tree: sicilian_bc4_trap_tree, depth: 16, isTrap: true },
  "queens-gambit": { id: "qga-b5-trap", name: "QGA b5 Punisher", description: "Punish Black's greedy b5 in the Queen's Gambit Accepted.", plan: "After 2...dxc4 3.e3 b5?!, play a4! undermining the pawn chain. After axb5 cxb5 Qf3! attacks a8 and threatens the weak queenside. Black's position collapses.", startingMoves: "1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 c6 5.axb5 cxb5 6.Qf3", tree: elephant_trap_tree, depth: 11, isTrap: true },
  "kings-indian": { id: "kid-bayonet-trap", name: "Bayonet Counter-Trap", description: "Punish White's premature Bg5 pin with a sharp kingside counter.", plan: "After White plays Bg5 prematurely, push h6 and g5! chasing the bishop. Then Nh5 targets the weakened g3 bishop, gaining the bishop pair and kingside initiative.", startingMoves: "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.d5 Nbd7 8.Bg5 h6 9.Bh4 g5 10.Bg3 Nh5", tree: kid_bayonet_trap_tree, depth: 20, isTrap: true },
  "french-defense": { id: "french-poisoned-pawn", name: "Poisoned Pawn Trap", description: "Punish White's greedy Qxg7 with a devastating counterattack.", plan: "In the Winawer, after White plays Qg4 attacking g7, allow Qxg7! After Rg8 the queen is nearly trapped. Black gets massive compensation with open lines and rapid development.", startingMoves: "1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.e5 c5 5.a3 Bxc3+ 6.bxc3 Ne7 7.Qg4 Qc7 8.Qxg7 Rg8 9.Qxh7 cxd4 10.Ne2 Nbc6 11.f4 Bd7", tree: french_poisoned_pawn_tree, depth: 22, isTrap: true },
  "caro-kann": { id: "caro-brooker-trap", name: "Brooker Trap", description: "Punish White's greedy knight invasion with a solid setup.", plan: "In the Advance Caro-Kann, develop smoothly with Bf5, e6, and c5. After White overextends with Na4-c5, Black castles with a solid position and pressure on d4.", startingMoves: "1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3 e6 5.Be2 c5 6.O-O Nc6 7.c3 cxd4 8.cxd4 Nge7 9.Nc3 Ng6 10.Na4 Be7 11.Nc5 O-O", tree: caro_brooker_trap_tree, depth: 22, isTrap: true },
  "ruy-lopez": { id: "ruy-nxe4-trap", name: "Open Ruy Lopez Trap", description: "Punish Black's premature Nxe4 pawn grab in the Ruy Lopez.", plan: "After 5...Nxe4?!, play d4! opening the center. Black's knight is misplaced on e4 and must retreat. White builds a powerful center with dxe5 and develops with tempo via c3, Nbd2, Re1.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Nxe4 6.d4 b5 7.Bb3 d5 8.dxe5 Be6 9.c3 Be7 10.Nbd2 O-O 11.Re1", tree: noahs_ark_trap_tree, depth: 21, isTrap: true },
  "london-system": { id: "london-nc5-trap", name: "Knight Outpost Trap", description: "Punish Black's passive play with a devastating knight outpost.", plan: "After Black develops passively, plant a knight on e5 supported by f4. The knight dominates the center and supports a kingside attack.", startingMoves: "1.d4 Nf6 2.Bf4 d5 3.e3 c5 4.c3 Nc6 5.Nd2 e6 6.Ngf3 Bd6 7.Bg3 O-O 8.Bd3 b6 9.Ne5 Bb7 10.f4 Ne7", tree: london_nc5_trap_tree, depth: 20, isTrap: true },
  "scotch-game": { id: "scotch-qh4-refute", name: "Qh4 Refutation", description: "Punish Black's premature Qh4 with precise development gaining tempi.", plan: "After 4...Qh4?!, play Nc3! defending e4. Black's queen is exposed and loses time. After Nb5 threatening Nc7+, Black must waste moves while White develops freely.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nc3 Bb4 6.Be2 Qxe4 7.Nb5 Kd8 8.O-O Bxc3 9.bxc3", tree: scotch_qh4_refute_tree, depth: 17, isTrap: true },
  "dutch-defense": { id: "dutch-staunton-refute", name: "Staunton Gambit Refutation", description: "Refute White's aggressive 2.e4 gambit with solid play keeping the extra pawn.", plan: "After 1.d4 f5 2.e4 fxe4, calmly develop with Nf6 and e6. Black keeps the extra pawn with a solid position. White's gambit is unsound.", startingMoves: "1.d4 f5 2.e4 fxe4 3.Nc3 Nf6 4.Bg5 e6 5.Nxe4 Be7 6.Bxf6 Bxf6 7.Nf3 O-O 8.Bd3 d5 9.Ng3 Nd7", tree: dutch_staunton_refute_tree, depth: 18, isTrap: true },
  "pirc-defense": { id: "pirc-e5-trap", name: "c5 Counter-Trap", description: "Punish White's premature dxc5 with a queen sortie winning material.", plan: "After White takes dxc5, play Qa5! recapturing with check. Then Nc6 develops with tempo, and after Nd5 Nxd5 exd5 Nb4, Black attacks d5 and c2 simultaneously.", startingMoves: "1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.f4 Bg7 5.Nf3 O-O 6.Be2 c5 7.dxc5 Qa5 8.O-O Qxc5+ 9.Kh1 Nc6 10.Nd5 Nxd5 11.exd5 Nb4", tree: pirc_e5_trap_tree, depth: 22, isTrap: true },
  "scandinavian-defense": { id: "scandi-pin-trap", name: "Nd5 Counter-Trap", description: "Lure White's knight to d5 then eliminate it favorably.", plan: "After Qa5, develop with Nf6, Bf5, and e6. When White plays Nd5, simply trade with Nxf6+ Qxf6 — Black has comfortable development and the bishop pair.", startingMoves: "1.e4 d5 2.exd5 Qxd5 3.Nc3 Qa5 4.d4 Nf6 5.Nf3 Bf5 6.Bc4 e6 7.Bd2 c6 8.Nd5 Qd8 9.Nxf6+ Qxf6", tree: scandi_pin_trap_tree, depth: 18, isTrap: true },
  "english-opening": { id: "english-bb4-trap", name: "Bb4 Punisher", description: "Punish Black's premature Bb4 pin by winning the bishop pair.", plan: "After Black plays Bb4 prematurely, Qc2! forces the trade on c3. White gets the bishop pair and open lines. Then a3, cxd5, Bc4 develops with initiative against Black's king.", startingMoves: "1.c4 e5 2.Nc3 Nf6 3.Nf3 Nc6 4.e3 Bb4 5.Qc2 Bxc3 6.Qxc3 Qe7 7.a3 d5 8.cxd5 Nxd5 9.Qc2 Be6 10.Bc4 O-O-O 11.O-O", tree: english_fork_trap_tree, depth: 21, isTrap: true },
  "nimzo-indian": { id: "nimzo-samisch-trap", name: "Sämisch Counter-Trap", description: "Punish White's Sämisch variation with a devastating queen invasion.", plan: "After 4.a3 Bxc3+ 5.bxc3 c5 6.f3 d5 7.cxd5 Nxd5! If White plays dxc5? then Qa5! attacks c3 and c5. After e4 Ne3! Black wins the exchange or more with Qxc3+ and Qxa1.", startingMoves: "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.a3 Bxc3+ 5.bxc3 c5 6.f3 d5 7.cxd5 Nxd5 8.dxc5 Qa5 9.e4 Ne3 10.Bxe3 Qxc3+ 11.Ke2 Qxa1", tree: nimzo_pawn_fork_trap_tree, depth: 22, isTrap: true },
  "grunfeld-defense": { id: "grunfeld-exchange-trap", name: "Exchange Grünfeld Counter", description: "Dismantle White's imposing center in the Exchange Grünfeld.", plan: "After White builds a big center with e4, target c3 with Bg7 and c5. Play Na5 to hit the bishop, then cxd4 cxd4 Be6 leaves White's center weak and Black's pieces active.", startingMoves: "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7 7.Bc4 c5 8.Ne2 Nc6 9.Be3 O-O 10.O-O Bg4 11.f3 Na5 12.Bd3 cxd4 13.cxd4 Be6", tree: grunfeld_swindle_trap_tree, depth: 26, isTrap: true },
  "alekhine-defense": { id: "alekhine-4pawns-trap", name: "Four Pawns Attack Refutation", description: "Lure White's pawns forward then destroy the overextended center.", plan: "After 5.f4 dxe5 6.fxe5, develop with Nc6 attacking d4 and e5. Play Bf5, e6, and Bb4 pinning the knight. White's center becomes a liability — Black castles safely with a better position.", startingMoves: "1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.c4 Nb6 5.f4 dxe5 6.fxe5 Nc6 7.Be3 Bf5 8.Nc3 e6 9.Nf3 Bb4 10.Rc1 Bxc3+ 11.Rxc3 O-O", tree: alekhine_overextension_tree, depth: 22, isTrap: true },
  "vienna-game": { id: "vienna-copycat-trap", name: "Copycat Punisher", description: "Punish Black's mirror strategy with a devastating queen attack.", plan: "When Black copies White's moves with Nc6 and Bc5, play Qg4! attacking g7. After g6 weakens the kingside, Qf3 repositions. White develops with Nge2, d3, and Bg5 with a powerful attack.", startingMoves: "1.e4 e5 2.Nc3 Nc6 3.Bc4 Bc5 4.Qg4 g6 5.Qf3 Nf6 6.Nge2 d6 7.d3 Bg4 8.Qg3 O-O 9.Bg5", tree: vienna_frankenstein_tree, depth: 17, isTrap: true },
  "catalan-opening": { id: "catalan-exchange-trap", name: "Rook Trap", description: "Win the exchange with a devastating knight fork in the Catalan.", plan: "After Black takes on c4 and tries to hold with b5, play Ne5! followed by a4. After axb5 axb5 Rxa8 Bxa8, the stunning Nc6! forks Black's queen and bishop, winning material.", startingMoves: "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 dxc4 5.Nf3 a6 6.O-O b5 7.Ne5 Nd5 8.a4 Bb7 9.axb5 axb5 10.Rxa8 Bxa8 11.Nc6", tree: catalan_diagonal_trap_tree, depth: 21, isTrap: true },
  "benoni-defense": { id: "benoni-benko-trap", name: "Benko Gambit Trap", description: "Sacrifice a pawn for crushing queenside pressure.", plan: "After 3...b5! sacrifice the pawn. With Bxa6 trading off White's good bishop, then g6 Bg7 fianchetto — Black gets open a and b files with lasting pressure. White's extra pawn is meaningless.", startingMoves: "1.d4 Nf6 2.c4 c5 3.d5 b5 4.cxb5 a6 5.bxa6 Bxa6 6.Nc3 d6 7.e4 Bxf1 8.Kxf1 g6 9.Nf3 Bg7 10.g3 O-O 11.Kg2 Nbd7", tree: benoni_taimanov_trap_tree, depth: 22, isTrap: true },
  "philidor-defense": { id: "philidor-pin-trap", name: "Pin Counter-Trap", description: "Use the Bg4 pin to equalize and create tactical chances.", plan: "After 3...Bg4! pin the knight. If White plays dxe5, trade Bxf3 Qxf3 dxe5 and develop freely. Black gets a solid center and active pieces. White's early queen sortie wastes time.", startingMoves: "1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O", tree: philidor_legal_trap_tree, depth: 23, isTrap: true },
  "reti-opening": { id: "reti-gambit-trap", name: "Réti Gambit Trap", description: "Sacrifice a pawn to blast open the center with devastating effect.", plan: "After 2...d4, play e3! sacrificing a pawn. After dxe3 fxe3, White has open f-file and strong center. Follow with d4, Bd3, O-O, Nc3, e4 — a powerful pawn center with active pieces.", startingMoves: "1.Nf3 d5 2.c4 d4 3.e3 dxe3 4.fxe3 Nf6 5.d4 e6 6.Bd3 c5 7.O-O Nc6 8.Nc3 Be7 9.e4 cxd4 10.Nxd4 O-O 11.Be3", tree: reti_center_strike_tree, depth: 21, isTrap: true },
};
