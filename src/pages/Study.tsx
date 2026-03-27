import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";
import Chessboard from "@/components/Chessboard";
import MoveHistory from "@/components/MoveHistory";
import ProgressDots from "@/components/ProgressDots";
import SwitchConfirmModal from "@/components/SwitchConfirmModal";
import StudySidebar from "@/components/StudySidebar";
import UpgradeModal from "@/components/UpgradeModal";
import ConfettiBurst from "@/components/ConfettiBurst";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { type OpeningNode, type MoveCategory } from "@/data/openings";
import { openings } from "@/data/openingTrees";
import { extractLinesForVariation, type Line } from "@/lib/lineExtractor";
import { lineConclusions } from "@/data/lineConclusions";
import {
  getLineProgress,
  recordAttempt,
  markMastered,
  isLineUnlocked,
  MASTERY_PROMPT_THRESHOLD,
} from "@/lib/progressStore";
import { playLineCompleteSound, playMasterySound, playCelebrationSound } from "@/lib/chessSounds";
import { squareToCoords } from "@/data/pieceUnicode";
import { ArrowLeft, RotateCcw, Undo2, Redo2, Trophy, ChevronRight, Zap, Eye, ExternalLink } from "lucide-react";
import { t, tf, tn, tDesc, tVar } from "@/lib/i18n";

interface MoveRecord {
  san: string;
  moveNumber: number;
  isWhite: boolean;
}

interface HistorySnapshot {
  fen: string;
  currentNodes: OpeningNode[];
  moveHistory: MoveRecord[];
  moveCount: number;
  currentVariation: { name: string; description: string } | null;
}

export default function Study() {
  const { openingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTheme, currentTheme } = useTheme();
  const { user } = useAuth();
  const { canLearnNewLine, canPractice, canAnalyze, recordLineLearn, recordPracticeUse, recordAnalysisUse, isPro } = useSubscription();
  const isMobile = useIsMobile();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"lines" | "practice">("lines");
  const [upgradeFromGate, setUpgradeFromGate] = useState(false);
  const lineGateChecked = useRef(false);

  const opening = openings.find((o) => o.id === openingId);
  const colorParam = searchParams.get("color") as "w" | "b" | null;
  const variationParam = searchParams.get("variation");

  // Resolve the active variation's tree (trap variations have their own tree)
  const activeVariation = opening?.variations.find((v) => v.id === variationParam);
  const activeTree = activeVariation?.tree || opening?.tree || [];
  const lineParam = searchParams.get("line");
  const isReview = searchParams.get("review") === "1";
  const isPracticeMode = searchParams.get("practice") === "1";
  const isAgainstMode = searchParams.get("against") === "1";

  // Resolve current line
  const { currentLine, allVariationLines } = useMemo(() => {
    if (!opening || !variationParam) return { currentLine: null, allVariationLines: [] };
    const variation = opening.variations.find((v) => v.id === variationParam);
    if (!variation) return { currentLine: null, allVariationLines: [] };
    const lines = extractLinesForVariation(opening, variation);
    const lineIdx = lineParam !== null ? parseInt(lineParam, 10) : 0;
    return {
      currentLine: lines[lineIdx] || null,
      allVariationLines: lines,
    };
  }, [opening, variationParam, lineParam]);

  // Parse the preferred variation's starting moves into a SAN sequence
  const preferredMoves = useMemo(() => {
    if (currentLine) return currentLine.moves;
    if (!variationParam || !opening) return null;
    const variation = opening.variations.find((v) => v.id === variationParam);
    if (!variation?.startingMoves) return null;
    return variation.startingMoves
      .replace(/\d+\./g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }, [currentLine, variationParam, opening]);

  // Gate new lines for free tier
  useEffect(() => {
    if (!currentLine || lineGateChecked.current || isAgainstMode || isReview) return;
    lineGateChecked.current = true;
    const progress = getLineProgress(currentLine.id);
    const isNewLine = progress.attempts === 0;
    if (isNewLine && user && !canLearnNewLine) {
      setUpgradeReason("lines");
      setUpgradeFromGate(true);
      setShowUpgradeModal(true);
    } else if (isPracticeMode && user && !canPractice) {
      setUpgradeReason("practice");
      setUpgradeFromGate(true);
      setShowUpgradeModal(true);
    } else if (isNewLine && user && !isPro) {
      // Record usage for free tier
      recordLineLearn();
    } else if (isPracticeMode && user && !isPro) {
      recordPracticeUse();
    }
  }, [currentLine, user, canLearnNewLine, canPractice, isPro, isAgainstMode, isReview, isPracticeMode, recordLineLearn, recordPracticeUse]);

  useEffect(() => {
    if (opening) setTheme(opening.themeId);
  }, [opening, setTheme]);

  const [playerColor, setPlayerColor] = useState<"w" | "b">(colorParam || opening?.primarySide || "w");

  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [currentNodes, setCurrentNodes] = useState<OpeningNode[]>(activeTree);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [feedback, setFeedback] = useState<{
    type: MoveCategory;
    message: string;
    variationName?: string;
    suggestedMove?: string;
    alternativeNode?: OpeningNode;
    detectedOpening?: { id: string; name: string; nodes: OpeningNode[] };
    detectedVariation?: { variationId: string; lineIndex: number };
  } | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [currentVariation, setCurrentVariation] = useState<{ name: string; description: string } | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [crucialMomentShown, setCrucialMomentShown] = useState(false);
  const [crucialSquare, setCrucialSquare] = useState<string | null>(null);
  const [crucialMomentMessage, setCrucialMomentMessage] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);

  // Mastery prompt state
  const [showMasteryPrompt, setShowMasteryPrompt] = useState(false);
  const [lineCompleted, setLineCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  // Progress tracking
  const [moveResults, setMoveResults] = useState<("correct" | "alternative" | "mistake" | "pending")[]>([]);

  // Switch confirmation modal state
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [pendingSwitchData, setPendingSwitchData] = useState<{
    playerMoveScore: number | null;
    masterMoveScore: number | null;
    playerMoveSan: string;
    masterMoveSan: string;
    onAdopt: () => void;
    onStay: () => void;
  } | null>(null);

  const chess = chessRef.current;

  const saveSnapshot = (): HistorySnapshot => ({
    fen,
    currentNodes,
    moveHistory: [...moveHistory],
    moveCount,
    currentVariation,
  });

  const restoreSnapshot = (snap: HistorySnapshot) => {
    chess.load(snap.fen);
    setFen(snap.fen);
    setCurrentNodes(snap.currentNodes);
    setMoveHistory(snap.moveHistory);
    setMoveCount(snap.moveCount);
    setCurrentVariation(snap.currentVariation);
    setFeedback(null);
    setIsComputerTurn(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const current = saveSnapshot();
    setRedoStack((prev) => [current, ...prev]);
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    restoreSnapshot(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const current = saveSnapshot();
    setUndoStack((prev) => [...prev, current]);
    const next = redoStack[0];
    setRedoStack((s) => s.slice(1));
    restoreSnapshot(next);
  };

  const pickComputerNode = useCallback((children: OpeningNode[], moveIndex: number): OpeningNode | null => {
    if (children.length === 0) return null;
    if (preferredMoves && moveIndex < preferredMoves.length) {
      const preferredSan = preferredMoves[moveIndex];
      const preferred = children.find((c) => c.move === preferredSan);
      if (preferred) return preferred;
    }
    return children.find((c) => c.category === "main_line") || children[0];
  }, [preferredMoves]);

  // Handle line completion
  const handleLineComplete = useCallback((wasCorrect: boolean) => {
    if (!currentLine) return;
    setLineCompleted(true);
    playLineCompleteSound();
    playCelebrationSound();
    setShowConfetti(true);

    if (isAgainstMode) return; // No progress tracking in against mode

    const progress = recordAttempt(currentLine.id, wasCorrect);
    if (wasCorrect && !progress.mastered && progress.correctAttempts >= MASTERY_PROMPT_THRESHOLD) {
      setTimeout(() => {
        playMasterySound();
        setShowMasteryPrompt(true);
        setShowConfetti(true);
      }, 800);
    }
  }, [currentLine, isAgainstMode]);

  // Check if the line is complete (no more nodes + all moves played)
  const checkLineCompletion = useCallback((nodes: OpeningNode[]) => {
    if (nodes.length === 0 && !lineCompleted && currentLine) {
      handleLineComplete(!hadMistake);
    }
  }, [lineCompleted, currentLine, hadMistake, handleLineComplete]);

  const initialAutoPlayed = useRef(false);
  useEffect(() => {
    if (initialAutoPlayed.current) return;
    if (!opening) return;
    const firstMover = "w";
    if (playerColor !== firstMover && activeTree.length > 0) {
      initialAutoPlayed.current = true;
      const mainNode = pickComputerNode(activeTree, 0) || activeTree[0];
      setIsComputerTurn(true);
      setTimeout(() => {
        try {
          chess.move(mainNode.move);
          const newFen = chess.fen();
          setFen(newFen);
          setMoveHistory([{ san: mainNode.move, moveNumber: 1, isWhite: true }]);
          setCurrentNodes(mainNode.children);
          setUndoStack([{
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            currentNodes: activeTree,
            moveHistory: [],
            moveCount: 0,
            currentVariation: null,
          }]);
          checkLineCompletion(mainNode.children);
        } catch {}
        setIsComputerTurn(false);
      }, 600);
    }
  }, [opening, playerColor, chess, resetCounter]);

  const findInOtherOpenings = useCallback((moveList: string[]): { id: string; name: string; nodes: OpeningNode[] } | null => {
    for (const op of openings) {
      if (op.id === openingId) continue;
      let nodes = op.tree;
      let matched = true;
      for (const san of moveList) {
        const found = nodes.find((n) => n.move === san);
        if (!found) { matched = false; break; }
        nodes = found.children;
      }
      if (matched && moveList.length > 0) {
        return { id: op.id, name: op.name, nodes };
      }
    }
    return null;
  }, [openingId]);

  const moveHints = useMemo(() => {
    const hints = new Map<string, { category: MoveCategory; targets: Map<string, MoveCategory> }>();
    if (!currentNodes.length) return hints;
    const tempChess = new Chess(fen);
    if (tempChess.turn() !== playerColor) return hints;
    const legalMoves = tempChess.moves({ verbose: true });
    const totalMovesPlayed = moveHistory.length;
    currentNodes.forEach((node) => {
      const matching = legalMoves.find((m) => m.san === node.move);
      if (matching) {
        const isOnPreferredPath = preferredMoves && totalMovesPlayed < preferredMoves.length && node.move === preferredMoves[totalMovesPlayed];
        const effectiveCat: MoveCategory = preferredMoves 
          ? (isOnPreferredPath ? "main_line" : "legit_alternative")
          : node.category;
        if (!hints.has(matching.from)) {
          hints.set(matching.from, { category: effectiveCat, targets: new Map() });
        }
        hints.get(matching.from)!.targets.set(matching.to, effectiveCat);
        hints.get(matching.from)!.targets.set(matching.san, effectiveCat);
      }
    });
    return hints;
  }, [currentNodes, fen, playerColor, moveHistory.length, preferredMoves]);

  const autoPlayComputerMove = useCallback((children: OpeningNode[], moveIndex: number) => {
    const chosen = pickComputerNode(children, moveIndex);
    if (!chosen) {
      checkLineCompletion(children);
      return;
    }

    setIsComputerTurn(true);
    setTimeout(() => {
      const snapBefore = {
        fen: chess.fen(),
        currentNodes: children,
        moveHistory: [...moveHistory],
        moveCount,
        currentVariation,
      };

      try {
        const result = chess.move(chosen.move);
        if (result) {
          const newFen = chess.fen();
          setFen(newFen);
          const isW = chess.turn() === "b";
          const mn = Math.ceil(chess.moveNumber());
          setMoveHistory((prev) => {
            const updated = [...prev, { san: chosen.move, moveNumber: isW ? mn : mn - 1, isWhite: isW }];
            return updated;
          });
          setCurrentNodes(chosen.children);
          if (chosen.variationName) {
            setCurrentVariation({
              name: chosen.variationName,
              description: tf<(n: string) => string>("studyingThe")(chosen.variationName),
            });
          }
          setUndoStack((prev) => [...prev, snapBefore]);
          setRedoStack([]);
          
          // Check if this computer move is the crucial moment
          const cm = currentLine?.crucialMoment;
          const compMoveIndex = moveIndex; // use the parameter, not stale moveHistory closure
          if (cm && !cm.isPlayerMove && compMoveIndex === cm.moveIndex && !crucialMomentShown) {
            setCrucialMomentShown(true);
            if (result) {
              setCrucialSquare(result.to);
            }
            const mainLineRef = allVariationLines[0];
            const insteadOf = mainLineRef && cm.moveIndex < mainLineRef.moves.length
              ? mainLineRef.moves[cm.moveIndex]
              : null;
            const msg = insteadOf
              ? `The opponent played ${cm.move} instead of ${insteadOf} — that's different!`
              : `The opponent played ${cm.move} — that's different!`;
            setCrucialMomentMessage(msg);
            setFeedback({
              type: "main_line",
              message: `🛡️ ${msg}`,
            });
          } else {
            setFeedback(null);
          }
          
          checkLineCompletion(chosen.children);
        }
      } catch {}
      setIsComputerTurn(false);
    }, 800);
  }, [chess, moveHistory, moveCount, currentVariation, checkLineCompletion, currentLine, crucialMomentShown, allVariationLines]);


  const handleMove = useCallback(
    async (from: string, to: string, san: string) => {
      if (isComputerTurn || lineCompleted) return;

      // Compute challenge mode inside callback to ensure fresh value
      const lp = currentLine ? getLineProgress(currentLine.id) : null;
      const isChallengeMode = !isAgainstMode && (isPracticeMode || !!(lp && !lp.mastered && lp.correctAttempts >= MASTERY_PROMPT_THRESHOLD - 1));

      const snapshot = saveSnapshot();
      const matchedNode = currentNodes.find((node) => node.move === san);

      try {
        chess.move({ from, to });
      } catch {
        return;
      }

      const newFen = chess.fen();
      setFen(newFen);

      const isWhite = chess.turn() === "b";
      const moveNum = Math.ceil(chess.moveNumber());
      const newHistory = [...moveHistory, { san, moveNumber: isWhite ? moveNum : moveNum - 1, isWhite }];
      setMoveHistory(newHistory);
      setMoveCount((c) => c + 1);
      setHintVisible(false);
      setCrucialSquare(null);
      setCrucialMomentMessage(null); // Clear crucial moment message so normal explanations resume
      setUndoStack((prev) => [...prev, snapshot]);
      setRedoStack([]);

      const getSuggestedMoveForCurrentPly = (fallback?: string) =>
        (preferredMoves && newHistory.length - 1 < preferredMoves.length
          ? preferredMoves[newHistory.length - 1]
          : currentNodes.find((n) => n.category === "main_line")?.move) ||
        fallback ||
        currentNodes[0]?.move ||
        san;

      if (!matchedNode) {
        // Check cross-opening transposition first
        const allSans = newHistory.map((m) => m.san);
        const detected = findInOtherOpenings(allSans);
        if (detected) {
          // Cross-opening transposition — treat as mistake, undo the move
          chess.undo();
          setFen(chess.fen());
          setMoveHistory((prev) => prev.slice(0, -1));
          setUndoStack((prev) => prev.slice(0, -1));
          setHadMistake(true);
          const recommendedSan = getSuggestedMoveForCurrentPly();
          if (isChallengeMode) {
            setHintVisible(true);
            setFeedback({
              type: "mistake",
              message: "Play the move indicated by the green arrow.",
            });
          } else {
            setFeedback({
              type: "mistake",
              message: t("notBestMove"),
              suggestedMove: recommendedSan,
            });
          }
          return;
        }

        // Off-tree move with no transposition — treat as mistake
        chess.undo();
        setFen(chess.fen());
        setMoveHistory((prev) => prev.slice(0, -1));
        setUndoStack((prev) => prev.slice(0, -1));
        setHadMistake(true);
        const recommendedSan = getSuggestedMoveForCurrentPly();
        if (isChallengeMode) {
          setHintVisible(true);
          setFeedback({
            type: "mistake",
            message: "Play the move indicated by the green arrow.",
          });
        } else {
          setFeedback({
            type: "mistake",
            message: t("notBestMove"),
            suggestedMove: recommendedSan,
          });
        }
        return;
      }

      // If this move is on the preferred study path, treat it as main_line
      // If there IS a preferred path and this move is NOT on it, demote to legit_alternative
      const totalMovesPlayed = newHistory.length;
      const isOnPreferredPath = preferredMoves && (totalMovesPlayed - 1) < preferredMoves.length && 
        san === preferredMoves[totalMovesPlayed - 1];
      const effectiveCategory: MoveCategory = isOnPreferredPath 
        ? "main_line" 
        : (preferredMoves && matchedNode.category === "main_line" && !isOnPreferredPath)
          ? "legit_alternative"
          : matchedNode.category;

      switch (effectiveCategory) {
        case "main_line": {
          setMoveResults(prev => [...prev, "correct"]);
          const isAlreadyStudying = matchedNode.variationName && variationParam && 
            matchedNode.variationName.toLowerCase().replace(/\s+/g, '-') === variationParam;
          
          // Check if this player move is the crucial moment
          const cm = currentLine?.crucialMoment;
          const justPlayedIndex = newHistory.length - 1;
          if (cm && cm.isPlayerMove && justPlayedIndex === cm.moveIndex && !crucialMomentShown) {
            setCrucialMomentShown(true);
            setFeedback({
              type: "main_line",
              message: `⚡ Key moment! Here you play ${cm.moveNumber}${cm.isWhiteMove ? "." : "..."}${cm.move} — this is what makes this line unique.`,
            });
          } else {
            setFeedback({
              type: "main_line",
              message: matchedNode.variationName && !isAlreadyStudying
                ? tf<(n: string) => string>("goodThisIs")(matchedNode.variationName)
                : t("goodContinue"),
            });
          }
          if (matchedNode.variationName) {
            setCurrentVariation({
              name: matchedNode.variationName,
              description: tf<(n: string) => string>("studyingThe")(matchedNode.variationName),
            });
          }
          setCurrentNodes(matchedNode.children);
          autoPlayComputerMove(matchedNode.children, newHistory.length);
          break;
        }

        case "legit_alternative": {
          // When studying a specific line, treat alternatives as mistakes — undo and retry
          setMoveResults(prev => [...prev, "alternative"]);
          chess.undo();
          setFen(chess.fen());
          setMoveHistory((prev) => prev.slice(0, -1));
          setUndoStack((prev) => prev.slice(0, -1));
          setHadMistake(true);
          const recommendedSan = getSuggestedMoveForCurrentPly(matchedNode.suggestedMove);
          setFeedback({
            type: "mistake",
            message: t("notBestMove"),
            suggestedMove: recommendedSan,
          });
          break;
        }

        case "mistake":
          setMoveResults(prev => [...prev, "mistake"]);
          chess.undo();
          setFen(chess.fen());
          setMoveHistory((prev) => prev.slice(0, -1));
          setUndoStack((prev) => prev.slice(0, -1));
          setHadMistake(true);
          if (isChallengeMode) {
            // In challenge mode, reveal the correct move arrow and prompt to play it
            setHintVisible(true);
            setFeedback({
              type: "mistake",
              message: "Play the move indicated by the green arrow.",
            });
          } else {
            setFeedback({
              type: "mistake",
              message: matchedNode.explanation || t("notBestMove"),
              suggestedMove: matchedNode.suggestedMove,
            });
          }
          break;
      }
    },
    [chess, currentNodes, isComputerTurn, moveHistory, autoPlayComputerMove, lineCompleted, findInOtherOpenings, opening, preferredMoves, variationParam]
  );


  const handleReset = () => {
    initialAutoPlayed.current = false;
    chess.reset();
    setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    setCurrentNodes(activeTree);
    setMoveHistory([]);
    setFeedback(null);
    setMoveCount(0);
    setIsComputerTurn(false);
    setCurrentVariation(null);
    setUndoStack([]);
    setRedoStack([]);
    setHadMistake(false);
    setCrucialMomentShown(false);
    setCrucialSquare(null);
    setCrucialMomentMessage(null);
    setLineCompleted(false);
    setShowMasteryPrompt(false);
    setMoveResults([]);
    setShowConfetti(false);
    setShowSwitchConfirm(false);
    setPendingSwitchData(null);
    setResetCounter((c) => c + 1);
    setHintVisible(false);
  };

  const handleColorSwitch = (color: "w" | "b") => {
    if (color === playerColor) return;
    setPlayerColor(color);
    handleReset();

    if (color !== "w" && activeTree.length > 0) {
      const mainNode = pickComputerNode(activeTree, 0) || activeTree[0];
      initialAutoPlayed.current = true;
      setIsComputerTurn(true);
      setTimeout(() => {
        try {
          chess.move(mainNode.move);
          setFen(chess.fen());
          setMoveHistory([{ san: mainNode.move, moveNumber: 1, isWhite: true }]);
          setCurrentNodes(mainNode.children);
        } catch {}
        setIsComputerTurn(false);
      }, 600);
    }
  };

  const handleMasteryResponse = (mastered: boolean) => {
    if (currentLine) {
      markMastered(currentLine.id, mastered);
    }
    if (mastered) {
      playCelebrationSound();
      setShowConfetti(true);
    }
    setShowMasteryPrompt(false);
  };

  const goToNextLine = () => {
    if (!currentLine || !variationParam) return;
    const currentIdx = allVariationLines.findIndex((l) => l.id === currentLine.id);
    if (currentIdx < allVariationLines.length - 1) {
      // Check if the next line is new and user hit free-tier limit
      const nextLine = allVariationLines[currentIdx + 1];
      const nextProgress = getLineProgress(nextLine.id);
      const isNextNew = nextProgress.attempts === 0;
      if (isNextNew && user && !canLearnNewLine) {
        setUpgradeReason("lines");
        setShowUpgradeModal(true);
        return;
      }
      navigate(
        `/study/${openingId}/play?color=${colorParam || opening?.primarySide || "w"}&variation=${variationParam}&line=${currentIdx + 1}`,
        { replace: true }
      );
      window.location.reload();
    } else {
      navigate(`/study/${openingId}`);
    }
  };

  // Compute arrow: show the recommended move arrow on the board
  const arrowTarget = useMemo(() => {
    if (!opening || lineCompleted || isComputerTurn) return null;
    // Check challenge mode inline to avoid forward reference
    const lp = currentLine ? getLineProgress(currentLine.id) : null;
    const isChallenge = isPracticeMode || !!(lp && !lp.mastered && lp.correctAttempts >= MASTERY_PROMPT_THRESHOLD - 1);
    if (isChallenge && !hintVisible) return null;
    const tempChess = new Chess(fen);
    if (tempChess.turn() !== playerColor) return null;


    const totalMoves = moveHistory.length;
    let expectedSan: string | null = null;
    if (preferredMoves && totalMoves < preferredMoves.length) {
      expectedSan = preferredMoves[totalMoves];
    } else {
      const mainNode = currentNodes.find(n => n.category === "main_line");
      if (mainNode) expectedSan = mainNode.move;
    }
    if (!expectedSan) return null;

    const legalMoves = tempChess.moves({ verbose: true });
    const match = legalMoves.find(m => m.san === expectedSan);
    if (!match) return null;
    return { from: match.from, to: match.to };
  }, [opening, fen, playerColor, moveHistory.length, preferredMoves, currentNodes, currentLine, lineCompleted, isComputerTurn, isPracticeMode, hintVisible]);

  const totalPlayerMoves = useMemo(() => {
    if (!currentLine) return 0;
    return currentLine.moves.filter((_, i) => {
      return playerColor === "w" ? i % 2 === 0 : i % 2 === 1;
    }).length;
  }, [currentLine, playerColor]);

  const playerMovesCompleted = useMemo(() => {
    return moveHistory.filter(m => (playerColor === "w" ? m.isWhite : !m.isWhite)).length;
  }, [moveHistory, playerColor]);

  if (!opening) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("openingNotFound")}</p>
      </div>
    );
  }

  const colorLabel = playerColor === "w" ? t("white") : t("black");
  const sideLabel = playerColor === opening.primarySide
    ? tf<(c: string) => string>("playAs")(colorLabel)
    : tf<(c: string) => string>("playAgainst")(colorLabel);

  const displayName = currentLine
    ? currentLine.name
    : currentVariation
    ? currentVariation.name
    : tn("openingName", opening.id);

  const lineProgress = currentLine ? getLineProgress(currentLine.id) : null;
  const isChallengeMode = !isAgainstMode && (isPracticeMode || !!(lineProgress && !lineProgress.mastered && lineProgress.correctAttempts >= MASTERY_PROMPT_THRESHOLD - 1));


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/study/${openingId}`)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </motion.button>
          <div>
            <h1 className="font-serif text-lg font-semibold text-foreground leading-tight">
              {displayName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {sideLabel}
              {isChallengeMode && !lineCompleted && (
                <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Zap className="w-3 h-3" /> {isPracticeMode ? "Practice" : "Challenge"}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isPracticeMode && !lineCompleted && !isComputerTurn && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setHintVisible(v => !v)}
              className={`p-2 rounded-lg transition-colors ${hintVisible ? 'bg-accent' : 'hover:bg-accent'}`}
              title="Show hint"
            >
              <Eye className="w-4 h-4" style={{ color: hintVisible ? "hsl(45, 100%, 55%)" : undefined }} />
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleUndo} disabled={undoStack.length === 0 || isComputerTurn}
            className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-30" title="Undo"
          >
            <Undo2 className="w-4 h-4 text-foreground/70" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleRedo} disabled={redoStack.length === 0 || isComputerTurn}
            className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-30" title="Redo"
          >
            <Redo2 className="w-4 h-4 text-foreground/70" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05, rotate: -20 }} whileTap={{ scale: 0.95 }}
            onClick={handleReset} className="p-2 rounded-lg hover:bg-accent transition-colors" title="Reset"
          >
            <RotateCcw className="w-4 h-4 text-foreground/70" />
          </motion.button>
        </div>
      </header>

      {/* Eval progress bar */}
      <div className="w-full h-1" style={{ background: "hsl(var(--muted))" }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: totalPlayerMoves > 0 ? `${Math.min(100, (playerMovesCompleted / totalPlayerMoves) * 100)}%` : "0%",
            background: isChallengeMode
              ? "hsl(35, 92%, 50%)"
              : `linear-gradient(90deg, ${currentTheme.primaryColor}, ${currentTheme.accentColor})`,
          }}
        />
      </div>

      {/* Main content - two column on desktop */}
      <div className="flex-1 flex overflow-hidden">
        {/* Board column */}
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-3 pt-2">
          {/* Board */}
          <Chessboard
            fen={fen}
            onMove={handleMove}
            moveHints={isChallengeMode ? new Map() : moveHints}
            disabled={isComputerTurn || lineCompleted}
            flipped={playerColor === "b"}
            playerColor={playerColor}
            arrowFrom={arrowTarget?.from}
            arrowTo={arrowTarget?.to}
            highlightSquare={crucialSquare}
            highlightColor={activeVariation?.isTrap ? "red" : "gold"}
          />

          {/* Feedback message area */}
          {(
            <div className="min-h-[52px] max-h-[180px] overflow-y-auto flex items-center justify-center text-center px-2 py-2">
              <AnimatePresence mode="wait">
                {isChallengeMode && !lineCompleted && !feedback && (
                  <motion.div key="challenge-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="rounded-lg px-4 py-2 text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  >
                    Play from memory — no hints!
                  </motion.div>
                )}
                {!isChallengeMode && !feedback && !lineCompleted && arrowTarget && (
                  <motion.div key="play-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="rounded-lg px-4 py-2.5 text-sm text-muted-foreground"
                    style={{ background: "hsl(var(--muted) / 0.5)" }}
                  >
                    Play the move indicated by the green arrow
                  </motion.div>
                )}
                {!feedback && !lineCompleted && !arrowTarget && !isComputerTurn && (
                  <motion.div key="your-turn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-sm text-muted-foreground"
                  >
                    Your turn
                  </motion.div>
                )}
                {feedback && feedback.type === "main_line" && !lineCompleted && (
                  <motion.div key="good" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`text-sm font-medium ${crucialMomentShown && feedback.message.startsWith("⚡") || feedback.message.startsWith("🛡️") ? "rounded-lg px-4 py-2" : ""}`}
                    style={
                      feedback.message.startsWith("⚡") || feedback.message.startsWith("🛡️")
                        ? { color: currentTheme.accentColor, background: `${currentTheme.accentColor}15`, border: `1px solid ${currentTheme.accentColor}30` }
                        : { color: "hsl(140, 65%, 45%)" }
                    }
                  >
                    {feedback.message}
                  </motion.div>
                )}

                {feedback && feedback.type === "mistake" && !lineCompleted && (
                  <motion.div key="mistake" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-sm text-foreground"
                  >
                    <span className="font-bold" style={{ color: "hsl(0, 65%, 50%)" }}>{feedback.message}</span>
                    {feedback.suggestedMove && (
                      <span className="ml-1">
                        You should play <span className="font-bold" style={{ color: currentTheme.accentColor }}>{feedback.suggestedMove}</span> instead.
                      </span>
                    )}
                  </motion.div>
                )}
                {lineCompleted && isChallengeMode && !showMasteryPrompt && (
                  <motion.div key="challenge-done" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="rounded-lg px-4 py-3 text-sm font-medium mb-3"
                      style={{ background: "hsl(140, 65%, 45%, 0.12)", color: "hsl(140, 65%, 45%)" }}
                    >
                      Now try to play the line correctly without guidance.
                    </div>
                  </motion.div>
                )}
                {lineCompleted && !isChallengeMode && !showMasteryPrompt && (
                  <motion.div key="done" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <Trophy className="w-6 h-6 mx-auto mb-1" style={{ color: currentTheme.accentColor }} />
                    <p className="text-sm font-semibold text-foreground">
                      {hadMistake ? t("lineCompleted") : t("perfectRun")}
                    </p>
                  </motion.div>
                )}
                {showMasteryPrompt && (
                  <motion.div key="mastery" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: currentTheme.accentColor }} />
                    <p className="font-serif text-lg font-semibold text-foreground mb-1">{t("masteryQuestion")}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Progress dots */}
          {totalPlayerMoves > 0 && (
            <ProgressDots
              total={totalPlayerMoves}
              current={playerMovesCompleted}
              results={moveResults}
            />
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom action bar */}
          <div className="pb-6 pt-2">
            <AnimatePresence mode="wait">
              {feedback && feedback.type === "mistake" && !lineCompleted && (
                <motion.div key="mistake-btn" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFeedback(null)}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-colors"
                    style={{ background: "hsl(0, 65%, 50%)" }}
                  >
                    {t("tryAgain")}
                  </motion.button>
                </motion.div>
              )}

              {/* Line completed actions - only on mobile */}
              {isMobile && lineCompleted && !showMasteryPrompt && (
                <motion.div key="complete-btn" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="flex gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="flex-1 py-3.5 rounded-xl text-sm font-semibold border border-border/50 text-foreground hover:bg-accent transition-colors"
                  >
                    {t("practiceAgain")}
                  </motion.button>
                  {allVariationLines.length > 0 && currentLine && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={goToNextLine}
                      className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-background flex items-center justify-center gap-1.5 transition-colors"
                      style={{ background: currentTheme.accentColor }}
                    >
                      Continue
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Lichess Analysis - mobile, after completed or mastery */}
              {isMobile && (lineCompleted || showMasteryPrompt) && (isPro || canAnalyze) && (
                <motion.div key="lichess-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  <button
                    onClick={() => {
                      if (user && !isPro) recordAnalysisUse();
                      const encodedFen = fen.replace(/ /g, "_");
                      const color = playerColor === "w" ? "white" : "black";
                      window.open(`https://lichess.org/analysis/${encodedFen}?color=${color}`, "_blank");
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-medium border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {t("lichessAnalysis")}
                    {!isPro && <span className="text-[10px] opacity-60">({t("oncePerDay")})</span>}
                  </button>
                </motion.div>
              )}
              {isMobile && showMasteryPrompt && (
                <motion.div key="mastery-btns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="flex gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMasteryResponse(false)}
                    className="flex-1 py-3.5 rounded-xl text-sm font-semibold border border-border/50 text-foreground transition-colors"
                  >
                    {t("notYet")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMasteryResponse(true)}
                    className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-background transition-colors"
                    style={{ background: currentTheme.accentColor }}
                  >
                    {t("yesMastered")}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar - desktop only */}
        {!isMobile && variationParam && (
          <div className="w-80 flex-shrink-0">
            <StudySidebar
              openingId={opening.id}
              variationId={variationParam}
              lineIndex={lineParam !== null ? parseInt(lineParam, 10) : 0}
              openingName={tn("openingName", opening.id)}
              lineName={displayName}
              playerSide={playerColor}
              allMoves={currentLine?.moves || []}
              moveHistory={moveHistory}
              lineCompleted={lineCompleted}
              hadMistake={hadMistake}
              isChallengeMode={isChallengeMode}
              showMasteryPrompt={showMasteryPrompt}
              lineProgress={lineProgress}
              totalPlayerMoves={totalPlayerMoves}
              playerMovesCompleted={playerMovesCompleted}
              onReset={handleReset}
              onNextLine={goToNextLine}
              onMasteryResponse={handleMasteryResponse}
              hasNextLine={allVariationLines.length > 0 && !!currentLine && allVariationLines.findIndex(l => l.id === currentLine.id) < allVariationLines.length - 1}
              conclusionText={currentLine ? lineConclusions[currentLine.id] : undefined}
              crucialMomentMessage={crucialMomentMessage}
              fen={fen}
            />
          </div>
        )}
      </div>

      {/* Switch confirmation modal */}
      <SwitchConfirmModal
        open={showSwitchConfirm}
        playerMoveScore={pendingSwitchData?.playerMoveScore ?? null}
        masterMoveScore={pendingSwitchData?.masterMoveScore ?? null}
        playerMoveSan={pendingSwitchData?.playerMoveSan ?? ""}
        masterMoveSan={pendingSwitchData?.masterMoveSan ?? ""}
        onAdopt={() => pendingSwitchData?.onAdopt()}
        onStay={() => pendingSwitchData?.onStay()}
      />

      {/* Confetti celebration */}
      <ConfettiBurst trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Upgrade modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => { setShowUpgradeModal(false); if (upgradeFromGate) navigate(-1); setUpgradeFromGate(false); }}
        reason={upgradeReason}
      />
    </div>
  );
}
