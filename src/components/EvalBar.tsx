import { motion } from "framer-motion";

interface EvalBarProps {
  evalBefore: number | null;
  evalAfter: number | null;
  flipped?: boolean;
}

function evalToWhitePct(cp: number): number {
  // Sigmoid-ish mapping: ±500cp → ~5%-95%
  const clamped = Math.max(-1000, Math.min(1000, cp));
  return 50 + (clamped / 1000) * 50;
}

function formatEval(cp: number): string {
  if (Math.abs(cp) >= 10000) return cp > 0 ? "M" : "-M";
  const pawns = cp / 100;
  return (pawns >= 0 ? "+" : "") + pawns.toFixed(1);
}

export default function EvalBar({ evalBefore, evalAfter, flipped = false }: EvalBarProps) {
  const hasData = evalBefore !== null && evalAfter !== null;
  if (!hasData) return null;

  const beforePct = evalToWhitePct(evalBefore);
  const afterPct = evalToWhitePct(evalAfter);
  const displayPct = flipped ? 100 - afterPct : afterPct;
  const delta = evalAfter - evalBefore;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Eval label */}
      <span className="text-[10px] font-mono text-muted-foreground">
        {formatEval(evalAfter)}
      </span>

      {/* Bar */}
      <div
        className="w-5 rounded-sm overflow-hidden border border-border relative"
        style={{ height: "100%" }}
      >
        {/* White portion (from bottom) */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-white"
          initial={{ height: `${flipped ? 100 - beforePct : beforePct}%` }}
          animate={{ height: `${displayPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Black portion fills remaining */}
        <div className="absolute inset-0 bg-zinc-800" style={{ zIndex: -1 }} />
      </div>

      {/* Delta label */}
      <span
        className={`text-[10px] font-mono ${
          delta > 50
            ? "text-emerald-400"
            : delta < -50
            ? "text-red-400"
            : "text-muted-foreground"
        }`}
      >
        {delta > 0 ? "+" : ""}
        {(delta / 100).toFixed(1)}
      </span>
    </div>
  );
}
