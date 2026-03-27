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
                            move: "Nd5#", category: "main_line",
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

const sicilian_bc4_trap_tree: OpeningNode[] = [
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move: "e4", category: "main_line",
    children: [
    {
      fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      move: "c5", category: "main_line",
      children: [
      {
        fen: "rnbqkbnr/pp1ppppp/8/2p5/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2",
        move: "Bc4", category: "main_line",
        children: [
        {
          fen: "rnbqkbnr/pp1p1ppp/4p3/2p5/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 3",
          move: "e6", category: "main_line",
          children: [
          {
            fen: "rnbqkbnr/pp1p1ppp/4p3/2p5/2B1P3/2N5/PPPP1PPP/R1BQK1NR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [
            {
              fen: "rnbqkbnr/1p1p1ppp/p3p3/2p5/2B1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq - 0 4",
              move: "a6", category: "main_line",
              children: [
              {
                fen: "rnbqkbnr/1p1p1ppp/p3p3/2p5/2B1P3/2NP4/PPP2PPP/R1BQK1NR b KQkq - 0 4",
                move: "d3", category: "main_line",
                children: [
                {
                  fen: "rnbqkbnr/1p3ppp/p3p3/2pp4/2B1P3/2NP4/PPP2PPP/R1BQK1NR w KQkq - 0 5",
                  move: "d5", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkbnr/1p3ppp/p3p3/2pP4/2B5/2NP4/PPP2PPP/R1BQK1NR b KQkq - 0 5",
                    move: "exd5", category: "main_line",
                    children: [
                    {
                      fen: "rnbqkbnr/1p3ppp/p7/2pp4/2B5/2NP4/PPP2PPP/R1BQK1NR w KQkq - 0 6",
                      move: "exd5", category: "main_line",
                      children: [
                      {
                        fen: "rnbqkbnr/1p3ppp/p7/2pp4/8/1BNP4/PPP2PPP/R1BQK1NR b KQkq - 1 6",
                        move: "Bb3", category: "main_line",
                        children: [
                        {
                          fen: "rnbqkb1r/1p3ppp/p4n2/2pp4/8/1BNP4/PPP2PPP/R1BQK1NR w KQkq - 2 7",
                          move: "Nf6", category: "main_line",
                          children: [
                          {
                            fen: "rnbqkb1r/1p3ppp/p4n2/2pp4/8/1BNP1N2/PPP2PPP/R1BQK2R b KQkq - 3 7",
                            move: "Nf3", category: "main_line",
                            children: [
                            {
                              fen: "rnbqk2r/1p3ppp/p2b1n2/2pp4/8/1BNP1N2/PPP2PPP/R1BQK2R w KQkq - 4 8",
                              move: "Bd6", category: "main_line",
                              children: [
                              {
                                fen: "rnbqk2r/1p3ppp/p2b1n2/2pp4/8/1BNP1N2/PPP2PPP/R1BQ1RK1 b kq - 5 8",
                                move: "O-O", category: "main_line",
                                children: [
                                {
                                  fen: "rnbq1rk1/1p3ppp/p2b1n2/2pp4/8/1BNP1N2/PPP2PPP/R1BQ1RK1 w - - 6 9",
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
          fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
          move: "e6", category: "main_line",
          children: [
          {
            fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 3",
            move: "Nc3", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
              move: "Nf6", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4",
                move: "Bg5", category: "main_line",
                children: [
                {
                  fen: "r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 4 5",
                  move: "Nbd7", category: "main_line",
                  children: [
                  {
                    fen: "r1bqkb1r/pppn1ppp/4pn2/3P2B1/3P4/2N5/PP2PPPP/R2QKBNR b KQkq - 0 5",
                    move: "cxd5", category: "main_line",
                    children: [
                    {
                      fen: "r1bqkb1r/pppn1ppp/5n2/3p2B1/3P4/2N5/PP2PPPP/R2QKBNR w KQkq - 0 6",
                      move: "exd5", category: "main_line",
                      children: [
                      {
                        fen: "r1bqkb1r/pppn1ppp/5n2/3N2B1/3P4/8/PP2PPPP/R2QKBNR b KQkq - 0 6",
                        move: "Nxd5", category: "main_line",
                        children: [
                        {
                          fen: "r1bqkb1r/pppn1ppp/8/3n2B1/3P4/8/PP2PPPP/R2QKBNR w KQkq - 0 7",
                          move: "Nxd5", category: "main_line",
                          children: [
                          {
                            fen: "r1bBkb1r/pppn1ppp/8/3n4/3P4/8/PP2PPPP/R2QKBNR b KQkq - 0 7",
                            move: "Bxd8", category: "main_line",
                            children: [
                            {
                              fen: "r1bBk2r/pppn1ppp/8/3n4/1b1P4/8/PP2PPPP/R2QKBNR w KQkq - 1 8",
                              move: "Bb4+", category: "main_line",
                              children: [
                              {
                                fen: "r1bBk2r/pppn1ppp/8/3n4/1b1P4/8/PP1QPPPP/R3KBNR b KQkq - 2 8",
                                move: "Qd2", category: "main_line",
                                children: [
                                {
                                  fen: "r1bBk2r/pppn1ppp/8/3n4/3P4/8/PP1bPPPP/R3KBNR w KQkq - 0 9",
                                  move: "Bxd2+", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1bBk2r/pppn1ppp/8/3n4/3P4/8/PP1KPPPP/R4BNR b kq - 0 9",
                                    move: "Kxd2", category: "main_line",
                                    children: [
                                    {
                                      fen: "r1bk3r/pppn1ppp/8/3n4/3P4/8/PP1KPPPP/R4BNR w - - 0 10",
                                      move: "Kxd8", category: "main_line",
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
                      fen: "r1bqkb1r/1pp2ppp/p1np1n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 6",
                      move: "d6", category: "main_line",
                      children: [
                      {
                        fen: "r1bqkb1r/1pp2ppp/p1np1n2/4p3/B2PP3/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 6",
                        move: "d4", category: "main_line",
                        children: [
                        {
                          fen: "r1bqkb1r/2p2ppp/p1np1n2/1p2p3/B2PP3/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 7",
                          move: "b5", category: "main_line",
                          children: [
                          {
                            fen: "r1bqkb1r/2p2ppp/p1np1n2/1p2p3/3PP3/1B3N2/PPP2PPP/RNBQ1RK1 b kq - 1 7",
                            move: "Bb3", category: "main_line",
                            children: [
                            {
                              fen: "r1bqkb1r/2p2ppp/p2p1n2/np2p3/3PP3/1B3N2/PPP2PPP/RNBQ1RK1 w kq - 2 8",
                              move: "Na5", category: "main_line",
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
            fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N3P1/PP1PPP1P/R1BQKBNR b KQkq - 0 3",
            move: "g3", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/ppp2ppp/5n2/3pp3/2P5/2N3P1/PP1PPP1P/R1BQKBNR w KQkq - 0 4",
              move: "d5", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/ppp2ppp/5n2/3Pp3/8/2N3P1/PP1PPP1P/R1BQKBNR b KQkq - 0 4",
                move: "cxd5", category: "main_line",
                children: [
                {
                  fen: "rnbqkb1r/ppp2ppp/8/3np3/8/2N3P1/PP1PPP1P/R1BQKBNR w KQkq - 0 5",
                  move: "Nxd5", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkb1r/ppp2ppp/8/3np3/8/2N3P1/PP1PPPBP/R1BQK1NR b KQkq - 1 5",
                    move: "Bg2", category: "main_line",
                    children: [
                    {
                      fen: "rnbqkb1r/ppp2ppp/1n6/4p3/8/2N3P1/PP1PPPBP/R1BQK1NR w KQkq - 2 6",
                      move: "Nb6", category: "main_line",
                      children: [
                      {
                        fen: "rnbqkb1r/ppp2ppp/1n6/4p3/8/2N2NP1/PP1PPPBP/R1BQK2R b KQkq - 3 6",
                        move: "Nf3", category: "main_line",
                        children: [
                        {
                          fen: "r1bqkb1r/ppp2ppp/1nn5/4p3/8/2N2NP1/PP1PPPBP/R1BQK2R w KQkq - 4 7",
                          move: "Nc6", category: "main_line",
                          children: [
                          {
                            fen: "r1bqkb1r/ppp2ppp/1nn5/4p3/8/2N2NP1/PP1PPPBP/R1BQ1RK1 b kq - 5 7",
                            move: "O-O", category: "main_line",
                            children: [
                            {
                              fen: "r1bqk2r/ppp1bppp/1nn5/4p3/8/2N2NP1/PP1PPPBP/R1BQ1RK1 w kq - 6 8",
                              move: "Be7", category: "main_line",
                              children: [
                              {
                                fen: "r1bqk2r/ppp1bppp/1nn5/4p3/8/2NP1NP1/PP2PPBP/R1BQ1RK1 b kq - 0 8",
                                move: "d3", category: "main_line",
                                children: [
                                {
                                  fen: "r1bq1rk1/ppp1bppp/1nn5/4p3/8/2NP1NP1/PP2PPBP/R1BQ1RK1 w - - 1 9",
                                  move: "O-O", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1bq1rk1/ppp1bppp/1nn5/4p3/8/2NPBNP1/PP2PPBP/R2Q1RK1 b - - 2 9",
                                    move: "Be3", category: "main_line",
                                    children: [
                                    {
                                      fen: "r2q1rk1/ppp1bppp/1nn1b3/4p3/8/2NPBNP1/PP2PPBP/R2Q1RK1 w - - 3 10",
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
                fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR b KQkq - 0 4",
                move: "e3", category: "main_line",
                children: [
                {
                  fen: "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQ - 1 5",
                  move: "O-O", category: "main_line",
                  children: [
                  {
                    fen: "rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2NBP3/PP3PPP/R1BQK1NR b KQ - 2 5",
                    move: "Bd3", category: "main_line",
                    children: [
                    {
                      fen: "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2NBP3/PP3PPP/R1BQK1NR w KQ - 0 6",
                      move: "d5", category: "main_line",
                      children: [
                      {
                        fen: "rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R b KQ - 1 6",
                        move: "Nf3", category: "main_line",
                        children: [
                        {
                          fen: "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
                          move: "c5", category: "main_line",
                          children: [
                          {
                            fen: "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQ1RK1 b - - 1 7",
                            move: "O-O", category: "main_line",
                            children: [
                            {
                              fen: "rnbq1rk1/pp3ppp/4pn2/2p5/1bpP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8",
                              move: "dxc4", category: "main_line",
                              children: [
                              {
                                fen: "rnbq1rk1/pp3ppp/4pn2/2p5/1bBP4/2N1PN2/PP3PPP/R1BQ1RK1 b - - 0 8",
                                move: "Bxc4", category: "main_line",
                                children: [
                                {
                                  fen: "r1bq1rk1/pp1n1ppp/4pn2/2p5/1bBP4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 1 9",
                                  move: "Nbd7", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1bq1rk1/pp1n1ppp/4pn2/2p5/1bBP4/2N1PN2/PP2QPPP/R1B2RK1 b - - 2 9",
                                    move: "Qe2", category: "main_line",
                                    children: [
                                    {
                                      fen: "r1bq1rk1/p2n1ppp/1p2pn2/2p5/1bBP4/2N1PN2/PP2QPPP/R1B2RK1 w - - 0 10",
                                      move: "b6", category: "main_line",
                                      children: [
                                      {
                                        fen: "r1bq1rk1/p2n1ppp/1p2pn2/2p5/1bBP4/2N1PN2/PP2QPPP/R1BR2K1 b - - 1 10",
                                        move: "Rd1", category: "main_line",
                                        children: [
                                        {
                                          fen: "r2q1rk1/pb1n1ppp/1p2pn2/2p5/1bBP4/2N1PN2/PP2QPPP/R1BR2K1 w - - 2 11",
                                          move: "Bb7", category: "main_line",
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
                            fen: "rnbqk2r/ppp1ppbp/6p1/8/3PP3/2P2N2/P4PPP/R1BQKB1R b KQkq - 2 7",
                            move: "Nf3", category: "main_line",
                            children: [
                            {
                              fen: "rnbqk2r/pp2ppbp/6p1/2p5/3PP3/2P2N2/P4PPP/R1BQKB1R w KQkq - 0 8",
                              move: "c5", category: "main_line",
                              children: [
                              {
                                fen: "rnbqk2r/pp2ppbp/6p1/2p5/3PP3/2P1BN2/P4PPP/R2QKB1R b KQkq - 1 8",
                                move: "Be3", category: "main_line",
                                children: [
                                {
                                  fen: "rnb1k2r/pp2ppbp/6p1/q1p5/3PP3/2P1BN2/P4PPP/R2QKB1R w KQkq - 2 9",
                                  move: "Qa5", category: "main_line",
                                  children: [
                                  {
                                    fen: "rnb1k2r/pp2ppbp/6p1/q1p5/3PP3/2P1BN2/P2Q1PPP/R3KB1R b KQkq - 3 9",
                                    move: "Qd2", category: "main_line",
                                    children: [
                                    {
                                      fen: "rnb2rk1/pp2ppbp/6p1/q1p5/3PP3/2P1BN2/P2Q1PPP/R3KB1R w KQ - 4 10",
                                      move: "O-O", category: "main_line",
                                      children: [
                                      {
                                        fen: "rnb2rk1/pp2ppbp/6p1/q1p5/3PP3/2P1BN2/P2Q1PPP/2R1KB1R b K - 5 10",
                                        move: "Rc1", category: "main_line",
                                        children: [
                                        {
                                          fen: "rnb2rk1/pp2ppbp/6p1/q7/3pP3/2P1BN2/P2Q1PPP/2R1KB1R w K - 0 11",
                                          move: "cxd4", category: "main_line",
                                          children: [
                                          {
                                            fen: "rnb2rk1/pp2ppbp/6p1/q7/3PP3/4BN2/P2Q1PPP/2R1KB1R b K - 0 11",
                                            move: "cxd4", category: "main_line",
                                            children: [
                                            {
                                              fen: "rnb2rk1/pp2ppbp/6p1/8/3PP3/4BN2/P2q1PPP/2R1KB1R w K - 0 12",
                                              move: "Qxd2+", category: "main_line",
                                              children: [
                                              {
                                                fen: "rnb2rk1/pp2ppbp/6p1/8/3PP3/4BN2/P2K1PPP/2R2B1R b - - 0 12",
                                                move: "Kxd2", category: "main_line",
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
                                      fen: "r2qk2r/ppp1bppp/1nn1p3/4Pb2/2PP4/2N1BN2/PP4PP/R2QKB1R w KQkq - 2 10",
                                      move: "Be7", category: "main_line",
                                      children: [
                                      {
                                        fen: "r2qk2r/ppp1bppp/1nn1p3/4Pb2/2PP4/2N1BN2/PP2B1PP/R2QK2R b KQkq - 3 10",
                                        move: "Be2", category: "main_line",
                                        children: [
                                        {
                                          fen: "r2q1rk1/ppp1bppp/1nn1p3/4Pb2/2PP4/2N1BN2/PP2B1PP/R2QK2R w KQ - 4 11",
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
          fen: "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3",
          move: "Nf6", category: "main_line",
          children: [
          {
            fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR b KQkq - 3 3",
            move: "Bc4", category: "main_line",
            children: [
            {
              fen: "rnbqkb1r/pppp1ppp/8/4p3/2B1n3/2N5/PPPP1PPP/R1BQK1NR w KQkq - 0 4",
              move: "Nxe4", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/pppp1ppp/8/4p2Q/2B1n3/2N5/PPPP1PPP/R1B1K1NR b KQkq - 1 4",
                move: "Qh5", category: "main_line",
                children: [
                {
                  fen: "rnbqkb1r/pppp1ppp/3n4/4p2Q/2B5/2N5/PPPP1PPP/R1B1K1NR w KQkq - 2 5",
                  move: "Nd6", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkb1r/pppp1ppp/3n4/4p2Q/8/1BN5/PPPP1PPP/R1B1K1NR b KQkq - 3 5",
                    move: "Bb3", category: "main_line",
                    children: [
                    {
                      fen: "r1bqkb1r/pppp1ppp/2nn4/4p2Q/8/1BN5/PPPP1PPP/R1B1K1NR w KQkq - 4 6",
                      move: "Nc6", category: "main_line",
                      children: [
                      {
                        fen: "r1bqkb1r/pppp1ppp/2nn4/1N2p2Q/8/1B6/PPPP1PPP/R1B1K1NR b KQkq - 5 6",
                        move: "Nb5", category: "main_line",
                        children: [
                        {
                          fen: "r1bqkb1r/pppp1p1p/2nn2p1/1N2p2Q/8/1B6/PPPP1PPP/R1B1K1NR w KQkq - 0 7",
                          move: "g6", category: "main_line",
                          children: [
                          {
                            fen: "r1bqkb1r/pppp1p1p/2nn2p1/1N2p3/8/1B3Q2/PPPP1PPP/R1B1K1NR b KQkq - 1 7",
                            move: "Qf3", category: "main_line",
                            children: [
                            {
                              fen: "r1bqkb1r/pppp3p/2nn2p1/1N2pp2/8/1B3Q2/PPPP1PPP/R1B1K1NR w KQkq - 0 8",
                              move: "f5", category: "main_line",
                              children: [
                              {
                                fen: "r1bqkb1r/pppp3p/2nn2p1/1N1Qpp2/8/1B6/PPPP1PPP/R1B1K1NR b KQkq - 1 8",
                                move: "Qd5", category: "main_line",
                                children: [
                                {
                                  fen: "r1b1kb1r/ppppq2p/2nn2p1/1N1Qpp2/8/1B6/PPPP1PPP/R1B1K1NR w KQkq - 2 9",
                                  move: "Qe7", category: "main_line",
                                  children: [
                                  {
                                    fen: "r1b1kb1r/ppNpq2p/2nn2p1/3Qpp2/8/1B6/PPPP1PPP/R1B1K1NR b KQkq - 0 9",
                                    move: "Nxc7+", category: "main_line",
                                    children: [
                                    {
                                      fen: "r1bk1b1r/ppNpq2p/2nn2p1/3Qpp2/8/1B6/PPPP1PPP/R1B1K1NR w KQ - 1 10",
                                      move: "Kd8", category: "main_line",
                                      children: [
                                      {
                                        fen: "N1bk1b1r/pp1pq2p/2nn2p1/3Qpp2/8/1B6/PPPP1PPP/R1B1K1NR b KQ - 0 10",
                                        move: "Nxa8", category: "main_line",
                                        children: [
                                        {
                                          fen: "N1bk1b1r/p2pq2p/1pnn2p1/3Qpp2/8/1B6/PPPP1PPP/R1B1K1NR w KQ - 0 11",
                                          move: "b6", category: "main_line",
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
                      fen: "rnbqk2r/ppp1bppp/4pn2/8/2pP4/5NP1/PP2PPBP/RNBQK2R w KQkq - 2 6",
                      move: "Be7", category: "main_line",
                      children: [
                      {
                        fen: "rnbqk2r/ppp1bppp/4pn2/8/2pP4/5NP1/PP2PPBP/RNBQ1RK1 b kq - 3 6",
                        move: "O-O", category: "main_line",
                        children: [
                        {
                          fen: "rnbq1rk1/ppp1bppp/4pn2/8/2pP4/5NP1/PP2PPBP/RNBQ1RK1 w - - 4 7",
                          move: "O-O", category: "main_line",
                          children: [
                          {
                            fen: "rnbq1rk1/ppp1bppp/4pn2/8/2pP4/5NP1/PPQ1PPBP/RNB2RK1 b - - 5 7",
                            move: "Qc2", category: "main_line",
                            children: [
                            {
                              fen: "rnbq1rk1/1pp1bppp/p3pn2/8/2pP4/5NP1/PPQ1PPBP/RNB2RK1 w - - 0 8",
                              move: "a6", category: "main_line",
                              children: [
                              {
                                fen: "rnbq1rk1/1pp1bppp/p3pn2/8/P1pP4/5NP1/1PQ1PPBP/RNB2RK1 b - - 0 8",
                                move: "a4", category: "main_line",
                                children: [
                                {
                                  fen: "rn1q1rk1/1ppbbppp/p3pn2/8/P1pP4/5NP1/1PQ1PPBP/RNB2RK1 w - - 1 9",
                                  move: "Bd7", category: "main_line",
                                  children: [
                                  {
                                    fen: "rn1q1rk1/1ppbbppp/p3pn2/8/P1QP4/5NP1/1P2PPBP/RNB2RK1 b - - 0 9",
                                    move: "Qxc4", category: "main_line",
                                    children: [
                                    {
                                      fen: "rn1q1rk1/1pp1bppp/p1b1pn2/8/P1QP4/5NP1/1P2PPBP/RNB2RK1 w - - 1 10",
                                      move: "Bc6", category: "main_line",
                                      children: [
                                      {
                                        fen: "rn1q1rk1/1pp1bppp/p1b1pn2/8/P1QP1B2/5NP1/1P2PPBP/RN3RK1 b - - 2 10",
                                        move: "Bf4", category: "main_line",
                                        children: [
                                        {
                                          fen: "r2q1rk1/1ppnbppp/p1b1pn2/8/P1QP1B2/5NP1/1P2PPBP/RN3RK1 w - - 3 11",
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
              fen: "rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 0 4",
              move: "e6", category: "main_line",
              children: [
              {
                fen: "rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/2N5/PP2PPPP/R1BQKBNR b KQkq - 1 4",
                move: "Nc3", category: "main_line",
                children: [
                {
                  fen: "rnbqkb1r/pp1p1ppp/5n2/2pp4/2P5/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5",
                  move: "exd5", category: "main_line",
                  children: [
                  {
                    fen: "rnbqkb1r/pp1p1ppp/5n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 5",
                    move: "cxd5", category: "main_line",
                    children: [
                    {
                      fen: "rnbqkb1r/pp3ppp/3p1n2/2pP4/8/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 6",
                      move: "d6", category: "main_line",
                      children: [
                      {
                        fen: "rnbqkb1r/pp3ppp/3p1n2/2pP4/4P3/2N5/PP3PPP/R1BQKBNR b KQkq - 0 6",
                        move: "e4", category: "main_line",
                        children: [
                        {
                          fen: "rnbqkb1r/pp3p1p/3p1np1/2pP4/4P3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 7",
                          move: "g6", category: "main_line",
                          children: [
                          {
                            fen: "rnbqkb1r/pp3p1p/3p1np1/2pP4/4P3/2N2N2/PP3PPP/R1BQKB1R b KQkq - 1 7",
                            move: "Nf3", category: "main_line",
                            children: [
                            {
                              fen: "rnbqk2r/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP3PPP/R1BQKB1R w KQkq - 2 8",
                              move: "Bg7", category: "main_line",
                              children: [
                              {
                                fen: "rnbqk2r/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQK2R b KQkq - 3 8",
                                move: "Be2", category: "main_line",
                                children: [
                                {
                                  fen: "rnbq1rk1/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 9",
                                  move: "O-O", category: "main_line",
                                  children: [
                                  {
                                    fen: "rnbq1rk1/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQ1RK1 b - - 5 9",
                                    move: "O-O", category: "main_line",
                                    children: [
                                    {
                                      fen: "rnbqr1k1/pp3pbp/3p1np1/2pP4/4P3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 6 10",
                                      move: "Re8", category: "main_line",
                                      children: [
                                      {
                                        fen: "rnbqr1k1/pp3pbp/3p1np1/2pP4/4P3/2N5/PP1NBPPP/R1BQ1RK1 b - - 7 10",
                                        move: "Nd2", category: "main_line",
                                        children: [
                                        {
                                          fen: "r1bqr1k1/pp3pbp/n2p1np1/2pP4/4P3/2N5/PP1NBPPP/R1BQ1RK1 w - - 8 11",
                                          move: "Na6", category: "main_line",
                                          children: [
                                          {
                                            fen: "r1bqr1k1/pp3pbp/n2p1np1/2pP4/4P3/2N2P2/PP1NB1PP/R1BQ1RK1 b - - 0 11",
                                            move: "f3", category: "main_line",
                                            children: [
                                            {
                                              fen: "r1bqr1k1/ppn2pbp/3p1np1/2pP4/4P3/2N2P2/PP1NB1PP/R1BQ1RK1 w - - 1 12",
                                              move: "Nc7", category: "main_line",
                                              children: [
                                              {
                                                fen: "r1bqr1k1/ppn2pbp/3p1np1/2pP4/P3P3/2N2P2/1P1NB1PP/R1BQ1RK1 b - - 0 12",
                                                move: "a4", category: "main_line",
                                                children: [
                                                {
                                                  fen: "r1bqr1k1/p1n2pbp/1p1p1np1/2pP4/P3P3/2N2P2/1P1NB1PP/R1BQ1RK1 w - - 0 13",
                                                  move: "b6", category: "main_line",
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
            fen: "rnbqkbnr/ppp2ppp/3p4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 3",
            move: "Bc4", category: "main_line",
            children: [
            {
              fen: "rn1qkbnr/ppp2ppp/3p4/4p3/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4",
              move: "Bg4", category: "main_line",
              children: [
              {
                fen: "rn1qkbnr/ppp2ppp/3p4/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 3 4",
                move: "Nc3", category: "main_line",
                children: [
                {
                  fen: "rn1qkbnr/ppp2p1p/3p2p1/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5",
                  move: "g6", category: "main_line",
                  children: [
                  {
                    fen: "rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P1b1/2N5/PPPP1PPP/R1BQK2R b KQkq - 0 5",
                    move: "Nxe5", category: "main_line",
                    children: [
                    {
                      fen: "rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6",
                      move: "Bxd1", category: "main_line",
                      children: [
                      {
                        fen: "rn1qkbnr/ppp2B1p/3p2p1/4N3/4P3/2N5/PPPP1PPP/R1BbK2R b KQkq - 0 6",
                        move: "Bxf7+", category: "main_line",
                        children: [
                        {
                          fen: "rn1q1bnr/ppp1kB1p/3p2p1/4N3/4P3/2N5/PPPP1PPP/R1BbK2R w KQ - 1 7",
                          move: "Ke7", category: "main_line",
                          children: [
                          {
                            fen: "rn1q1bnr/ppp1kB1p/3p2p1/3NN3/4P3/8/PPPP1PPP/R1BbK2R b KQ - 2 7",
                            move: "Nd5#", category: "main_line",
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
];


export const trapVariations: Record<string, VariationInfo> = {
  "italian-game": { id: "legals-mate-trap", name: "Legal's Mate Trap", description: "Punish Black's greedy Bg4 pin with a spectacular queen sacrifice.", plan: "After Black pins your knight with Bg4, sacrifice the queen with Nxe5! If Black takes the queen with Bxd1, play Bxf7+ Ke7 Nd5# for a beautiful checkmate.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 d6 4.Nc3 Bg4 5.Nxe5 Bxd1 6.Bxf7+ Ke7 7.Nd5#", tree: legals_mate_trap_tree, depth: 13, isTrap: true },
  "sicilian-defense": { id: "sicilian-bc4-trap", name: "Bc4 Punisher", description: "Punish White's premature Bc4 with a central strike.", plan: "When White plays the amateur 2.Bc4, respond with e6 and d5! Black immediately equalizes and gains the initiative by striking the center.", startingMoves: "1.e4 c5 2.Bc4 e6 3.Nc3 a6 4.d3 d5 5.exd5 exd5 6.Bb3 Nf6 7.Nf3 Bd6 8.O-O O-O", tree: sicilian_bc4_trap_tree, depth: 16, isTrap: true },
  "queens-gambit": { id: "elephant-trap", name: "Elephant Trap", description: "A deadly trap if White greedily captures on d5 with the knight.", plan: "After 5.cxd5 exd5 6.Nxd5?? Nxd5! 7.Bxd8 Bb4+ and Black wins the queen — the king must deal with the bishop check first.", startingMoves: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.cxd5 exd5 6.Nxd5 Nxd5 7.Bxd8 Bb4+ 8.Qd2 Bxd2+ 9.Kxd2 Kxd8", tree: elephant_trap_tree, depth: 18, isTrap: true },
  "kings-indian": { id: "kid-bayonet-trap", name: "Bayonet Counter-Trap", description: "Punish White's premature kingside attack with a sharp central strike.", plan: "If White launches a premature kingside pawn storm, Black strikes back with f5! opening lines against the exposed white king. The counterattack is faster.", startingMoves: "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.d5 Nbd7 8.Bg5 h6 9.Bh4 g5 10.Bg3 Nh5", tree: kid_bayonet_trap_tree, depth: 20, isTrap: true },
  "french-defense": { id: "french-poisoned-pawn", name: "Poisoned Pawn Trap", description: "Punish White's greedy Qxg7 with a devastating counterattack.", plan: "In the Winawer, after White plays Qg4 attacking g7, play Qc7 targeting the weak c3 pawn. If White takes g7, Rg8 traps the queen!", startingMoves: "1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.e5 c5 5.a3 Bxc3+ 6.bxc3 Ne7 7.Qg4 Qc7 8.Qxg7 Rg8 9.Qxh7 cxd4 10.Ne2 Nbc6 11.f4 Bd7", tree: french_poisoned_pawn_tree, depth: 22, isTrap: true },
  "caro-kann": { id: "caro-brooker-trap", name: "Brooker Trap", description: "Punish White's greedy pawn grab with a nasty pin.", plan: "In the Advance Caro-Kann, after White takes on f5, Black plays Bd6! pinning the e5 pawn. If White tries to hold it, Qh4 creates unstoppable threats.", startingMoves: "1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3 e6 5.Be2 c5 6.O-O Nc6 7.c3 cxd4 8.cxd4 Nge7 9.Nc3 Ng6 10.Na4 Be7 11.Nc5 O-O", tree: caro_brooker_trap_tree, depth: 22, isTrap: true },
  "ruy-lopez": { id: "noahs-ark-trap", name: "Noah's Ark Trap", description: "The oldest known trap — White's bishop gets trapped on b3 by advancing pawns.", plan: "After White retreats Ba4-b3, Black advances with Na5 to capture the trapped bishop. A centuries-old trap that still catches players.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O d6 6.d4 b5 7.Bb3 Na5", tree: noahs_ark_trap_tree, depth: 14, isTrap: true },
  "london-system": { id: "london-nc5-trap", name: "Knight Outpost Trap", description: "Punish Black's passive play with a devastating knight outpost.", plan: "After Black develops passively, plant a knight on e5 supported by f4. The knight dominates the center and supports a kingside attack.", startingMoves: "1.d4 Nf6 2.Bf4 d5 3.e3 c5 4.c3 Nc6 5.Nd2 e6 6.Ngf3 Bd6 7.Bg3 O-O 8.Bd3 b6 9.Ne5 Bb7 10.f4 Ne7", tree: london_nc5_trap_tree, depth: 20, isTrap: true },
  "scotch-game": { id: "scotch-qh4-refute", name: "Qh4 Refutation", description: "Punish Black's premature Qh4 with precise development gaining tempi.", plan: "After 4.Nxd4 Qh4?!, play Nc3! defending e4. Black's queen is exposed and loses time retreating while White develops freely.", startingMoves: "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nc3 Bb4 6.Be2 Qxe4 7.Nb5 Kd8 8.O-O Bxc3 9.bxc3", tree: scotch_qh4_refute_tree, depth: 17, isTrap: true },
  "dutch-defense": { id: "dutch-staunton-refute", name: "Staunton Gambit Refutation", description: "Refute White's aggressive 2.e4 gambit with solid play keeping the extra pawn.", plan: "After 1.d4 f5 2.e4 fxe4 3.Nc3 Nf6 4.Bg5, calmly play e6. Black keeps the extra pawn with a solid position. White's gambit is unsound.", startingMoves: "1.d4 f5 2.e4 fxe4 3.Nc3 Nf6 4.Bg5 e6 5.Nxe4 Be7 6.Bxf6 Bxf6 7.Nf3 O-O 8.Bd3 d5 9.Ng3 Nd7", tree: dutch_staunton_refute_tree, depth: 18, isTrap: true },
  "pirc-defense": { id: "pirc-e5-trap", name: "e5 Overextension Trap", description: "Punish White's premature e5 push with a counter-strike.", plan: "When White pushes e5 prematurely, play dxe5! After dxe5 Qxd1+ Rxd1 Ng4, Black wins the e5 pawn and emerges with an extra pawn in the endgame.", startingMoves: "1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.f4 Bg7 5.Nf3 O-O 6.Be2 c5 7.dxc5 Qa5 8.O-O Qxc5+ 9.Kh1 Nc6 10.Nd5 Nxd5 11.exd5 Nb4", tree: pirc_e5_trap_tree, depth: 22, isTrap: true },
  "scandinavian-defense": { id: "scandi-pin-trap", name: "Bishop Pin Trap", description: "Set up a devastating pin on the c3 knight winning material.", plan: "After 1.e4 d5 2.exd5 Qxd5 3.Nc3 Qa5, develop with Nf6 and Bf5. If White is careless with bishop development, Bb4 pins the knight and creates threats.", startingMoves: "1.e4 d5 2.exd5 Qxd5 3.Nc3 Qa5 4.d4 Nf6 5.Nf3 Bf5 6.Bc4 e6 7.Bd2 c6 8.Nd5 Qd8 9.Nxf6+ Qxf6", tree: scandi_pin_trap_tree, depth: 18, isTrap: true },
  "english-opening": { id: "english-fork-trap", name: "Knight Fork Trap", description: "Punish Black's careless development with a dominant center.", plan: "After 1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2, White's bishop dominates the long diagonal. Black's center collapses.", startingMoves: "1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O 9.Be3 Be6", tree: english_fork_trap_tree, depth: 18, isTrap: true },
  "nimzo-indian": { id: "nimzo-pawn-fork-trap", name: "Pawn Fork Trap", description: "A subtle pawn push creates a devastating fork in the Rubinstein Nimzo.", plan: "In the Rubinstein (4.e3), push c5! to challenge the center. If White plays d5 prematurely, e5! blocks and White's center freezes.", startingMoves: "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Bd3 d5 6.Nf3 c5 7.O-O dxc4 8.Bxc4 Nbd7 9.Qe2 b6 10.Rd1 Bb7", tree: nimzo_pawn_fork_trap_tree, depth: 20, isTrap: true },
  "grunfeld-defense": { id: "grunfeld-swindle-trap", name: "Exchange Swindle", description: "Win material in the Exchange Grünfeld with a surprising tactical sequence.", plan: "After White plays the Exchange with e4, play Nxc3 bxc3 Bg7 targeting the weak c3 pawn. If White defends carelessly, Qa5 attacks c3 and a2 simultaneously.", startingMoves: "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7 7.Nf3 c5 8.Be3 Qa5 9.Qd2 O-O 10.Rc1 cxd4 11.cxd4 Qxd2+ 12.Kxd2", tree: grunfeld_swindle_trap_tree, depth: 23, isTrap: true },
  "alekhine-defense": { id: "alekhine-overextension", name: "Center Collapse Trap", description: "Lure White's pawns forward then destroy the overextended center.", plan: "After 5.f4 dxe5 6.fxe5, play Nc6! attacking d4 and e5. White's pawn center becomes a liability, not a strength.", startingMoves: "1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.c4 Nb6 5.f4 dxe5 6.fxe5 Nc6 7.Be3 Bf5 8.Nc3 e6 9.Nf3 Be7 10.Be2 O-O", tree: alekhine_overextension_tree, depth: 20, isTrap: true },
  "vienna-game": { id: "vienna-frankenstein", name: "Frankenstein-Dracula Trap", description: "A wild tactical trap where Black sacrifices for a violent attack.", plan: "After 1.e4 e5 2.Nc3 Nf6 3.Bc4 Nxe4! Black sacrifices a piece for a devastating attack. After 4.Qh5 Nd6 5.Bb3 Nc6, Black has strong counterplay.", startingMoves: "1.e4 e5 2.Nc3 Nf6 3.Bc4 Nxe4 4.Qh5 Nd6 5.Bb3 Nc6 6.Nb5 g6 7.Qf3 f5 8.Qd5 Qe7 9.Nxc7+ Kd8 10.Nxa8 b6", tree: vienna_frankenstein_tree, depth: 20, isTrap: true },
  "catalan-opening": { id: "catalan-diagonal-trap", name: "Long Diagonal Trap", description: "Exploit the devastating power of the Catalan bishop on g2.", plan: "After Black takes on c4, play a4! undermining b5. The Bg2 becomes unstoppable on the long diagonal, pressuring the entire queenside.", startingMoves: "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 dxc4 5.Nf3 Be7 6.O-O O-O 7.Qc2 a6 8.a4 Bd7 9.Qxc4 Bc6 10.Bf4 Nbd7", tree: catalan_diagonal_trap_tree, depth: 20, isTrap: true },
  "benoni-defense": { id: "benoni-taimanov-trap", name: "Taimanov Attack Trap", description: "Counter White's sharp f4+e5 plan with precise piece play.", plan: "Against the Taimanov Attack, retreat the knight with Nfd7! preparing f6 counter-strike. Black undermines e5 and gets active counterplay.", startingMoves: "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O 9.O-O Re8 10.Nd2 Na6 11.f3 Nc7 12.a4 b6", tree: benoni_taimanov_trap_tree, depth: 24, isTrap: true },
  "philidor-defense": { id: "philidor-legal-trap", name: "Legal's Mate in Philidor", description: "A surprising queen sacrifice leading to checkmate in the Philidor.", plan: "After 3.Bc4 Bg4? 4.Nc3 g6, play 5.Nxe5! exploiting the pin. If Bxd1?? 6.Bxf7+ Ke7 7.Nd5# — checkmate!", startingMoves: "1.e4 e5 2.Nf3 d6 3.Bc4 Bg4 4.Nc3 g6 5.Nxe5 Bxd1 6.Bxf7+ Ke7 7.Nd5#", tree: philidor_legal_trap_tree, depth: 13, isTrap: true },
  "reti-opening": { id: "reti-center-strike", name: "Flank to Center Trap", description: "Strike the center after luring Black into overextension.", plan: "After 1.Nf3 d5 2.c4 d4, play e3! undermining the pawn. Black's center collapses and White gets open lines with tempo.", startingMoves: "1.Nf3 d5 2.c4 d4 3.e3 dxe3 4.fxe3 Nf6 5.d4 e6 6.Bd3 c5 7.O-O Nc6 8.Nc3 Be7 9.e4 cxd4 10.Nxd4", tree: reti_center_strike_tree, depth: 19, isTrap: true },
};
