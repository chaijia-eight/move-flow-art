import React, { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { useAuth } from "@/contexts/AuthContext";
import { useLineOverrides, type LineOverride } from "@/hooks/useLineOverrides";
import { Pencil, Save, X, Trash2, AlertTriangle, Target, FileText, List } from "lucide-react";
import { lineConclusions } from "@/data/lineConclusions";
import type { Line } from "@/lib/lineExtractor";

const DEV_EMAIL = "xinya.vivian@me.com";

interface DevEditPanelProps {
  currentLine: Line | null;
  moveHistory: { san: string; moveNumber: number; isWhite: boolean }[];
  primarySide: "w" | "b";
  onOverrideApplied?: () => void;
}

export default function DevEditPanel({ currentLine, moveHistory, primarySide, onOverrideApplied }: DevEditPanelProps) {
  const { user } = useAuth();
  const { overrides, saveOverride, deleteOverride } = useLineOverrides();
  const [isOpen, setIsOpen] = useState(false);
  const [editMoves, setEditMoves] = useState("");
  const [editConclusion, setEditConclusion] = useState("");
  const [crucialIndex, setCrucialIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"moves" | "crucial" | "conclusion">("moves");

  const isDev = user?.email === DEV_EMAIL;
  if (!isDev || !currentLine) return null;

  const lineId = currentLine.id;
  const override = overrides[lineId];
  const defaultConclusion = lineConclusions[lineId] || "";

  // Load current data into editor when line changes or panel opens
  useEffect(() => {
    if (!isOpen) return;
    const moves = override?.moves || currentLine.moves;
    setEditMoves(moves.join(" "));
    setEditConclusion(override?.conclusion_text || defaultConclusion);
    setCrucialIndex(override?.crucial_moment_index ?? currentLine.crucialMoment?.moveIndex ?? null);
    setValidationError(null);
  }, [isOpen, lineId]);

  const validateMoves = useCallback((movesStr: string): { valid: boolean; moves: string[]; error?: string } => {
    const sans = movesStr.trim().split(/\s+/).filter(Boolean);
    if (sans.length === 0) return { valid: false, moves: [], error: "No moves entered" };

    const chess = new Chess();
    const validMoves: string[] = [];
    for (let i = 0; i < sans.length; i++) {
      try {
        const result = chess.move(sans[i]);
        if (!result) return { valid: false, moves: validMoves, error: `Invalid move at index ${i}: "${sans[i]}"` };
        validMoves.push(result.san.replace(/[+#]/g, "")); // Normalize
      } catch {
        return { valid: false, moves: validMoves, error: `Illegal move at index ${i}: "${sans[i]}"` };
      }
    }
    return { valid: true, moves: validMoves };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setValidationError(null);

    // Validate moves
    const { valid, moves, error } = validateMoves(editMoves);
    if (!valid) {
      setValidationError(error || "Invalid moves");
      setSaving(false);
      return;
    }

    const overrideData: LineOverride = {
      line_id: lineId,
      moves: moves.length > 0 ? moves : null,
      crucial_moment_index: crucialIndex,
      conclusion_text: editConclusion.trim() || null,
    };

    const { error: saveError } = await saveOverride(overrideData);
    if (saveError) {
      setValidationError(`Save failed: ${saveError.message}`);
    } else {
      onOverrideApplied?.();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete all overrides for this line?")) return;
    setSaving(true);
    await deleteOverride(lineId);
    onOverrideApplied?.();
    setSaving(false);
  };

  const handleCaptureCurrentMoves = () => {
    const moves = moveHistory.map(m => m.san);
    setEditMoves(moves.join(" "));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shadow-lg"
        style={{ background: "hsl(0, 70%, 45%)", color: "white" }}
      >
        <Pencil size={14} />
        Dev Edit
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto rounded-xl shadow-2xl border"
      style={{ background: "hsl(0, 0%, 12%)", borderColor: "hsl(0, 0%, 20%)", color: "hsl(0, 0%, 85%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "hsl(0, 0%, 20%)" }}>
        <div className="flex items-center gap-2">
          <Pencil size={14} style={{ color: "hsl(0, 70%, 55%)" }} />
          <span className="text-sm font-bold">Dev Editor</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "hsl(0, 70%, 45%)", color: "white" }}>
            {lineId}
          </span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/10">
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: "hsl(0, 0%, 20%)" }}>
        {[
          { id: "moves" as const, label: "Moves", icon: List },
          { id: "crucial" as const, label: "Crucial", icon: Target },
          { id: "conclusion" as const, label: "Conclusion", icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id ? "border-b-2" : "opacity-50 hover:opacity-80"
            }`}
            style={activeTab === tab.id ? { borderColor: "hsl(0, 70%, 55%)", color: "hsl(0, 70%, 55%)" } : {}}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {activeTab === "moves" && (
          <>
            <div>
              <label className="text-[11px] font-medium opacity-60 uppercase tracking-wider">Move sequence (space-separated SANs)</label>
              <textarea
                value={editMoves}
                onChange={(e) => { setEditMoves(e.target.value); setValidationError(null); }}
                className="w-full mt-1 p-2 rounded-lg text-xs font-mono resize-y min-h-[80px]"
                style={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 25%)", color: "hsl(0, 0%, 85%)" }}
                placeholder="e4 e5 Nf3 Nc6 Bc4 Bc5 ..."
              />
            </div>
            <button
              onClick={handleCaptureCurrentMoves}
              className="w-full py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
              style={{ background: "hsl(220, 50%, 35%)", color: "white" }}
            >
              📸 Capture current moves ({moveHistory.length} played)
            </button>
            <div className="text-[10px] opacity-40">
              Current: {currentLine.moves.length} moves | Override: {override?.moves?.length ?? "none"}
            </div>
          </>
        )}

        {activeTab === "crucial" && (
          <>
            <div>
              <label className="text-[11px] font-medium opacity-60 uppercase tracking-wider">Crucial moment move index (0-based)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={crucialIndex ?? ""}
                  onChange={(e) => setCrucialIndex(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                  className="w-24 p-2 rounded-lg text-xs font-mono"
                  style={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 25%)", color: "hsl(0, 0%, 85%)" }}
                  placeholder="e.g. 9"
                  min={0}
                />
                <span className="text-[11px] opacity-50">
                  {crucialIndex != null && editMoves ? `= "${editMoves.split(/\s+/)[crucialIndex] || "?"}"` : ""}
                </span>
              </div>
            </div>
            <div className="text-[10px] opacity-40">
              Click a move number below to set it as crucial moment:
            </div>
            <div className="flex flex-wrap gap-1 max-h-40 overflow-auto">
              {editMoves.split(/\s+/).filter(Boolean).map((m, i) => {
                const isWhite = i % 2 === 0;
                const moveNum = Math.floor(i / 2) + 1;
                const isOpponent = (primarySide === "w") !== isWhite;
                return (
                  <button
                    key={i}
                    onClick={() => setCrucialIndex(i)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      crucialIndex === i ? "ring-2" : "hover:opacity-80"
                    }`}
                    style={{
                      background: crucialIndex === i ? "hsl(0, 70%, 35%)" : isOpponent ? "hsl(0, 0%, 18%)" : "hsl(0, 0%, 15%)",
                      color: crucialIndex === i ? "white" : isOpponent ? "hsl(0, 50%, 65%)" : "hsl(0, 0%, 60%)",
                      ringColor: "hsl(0, 70%, 55%)",
                    }}
                    title={`Index ${i} — ${isOpponent ? "Opponent" : "Player"} move`}
                  >
                    {isWhite ? `${moveNum}.` : ""}{m}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "conclusion" && (
          <div>
            <label className="text-[11px] font-medium opacity-60 uppercase tracking-wider">Line conclusion text</label>
            <textarea
              value={editConclusion}
              onChange={(e) => setEditConclusion(e.target.value)}
              className="w-full mt-1 p-2 rounded-lg text-xs resize-y min-h-[120px]"
              style={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 25%)", color: "hsl(0, 0%, 85%)" }}
              placeholder="Enter the strategic summary shown when the line is completed..."
            />
            <div className="text-[10px] opacity-40 mt-1">
              Default: {defaultConclusion ? `${defaultConclusion.slice(0, 60)}...` : "(none)"}
            </div>
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <div className="flex items-start gap-2 p-2 rounded-lg text-xs" style={{ background: "hsl(0, 50%, 15%)", color: "hsl(0, 70%, 65%)" }}>
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            {validationError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "hsl(140, 50%, 35%)", color: "white" }}
          >
            <Save size={12} />
            {saving ? "Saving..." : "Save Override"}
          </button>
          {override && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: "hsl(0, 50%, 30%)", color: "white" }}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
