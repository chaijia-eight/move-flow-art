import { motion } from "framer-motion";

interface EvalBarProps {
  evalBefore: number | null;
  evalAfter: number | null;
  flipped?: boolean;
}

function evalToWhitePct(pawns: number): number {
  const clamped = Math.max(-10, Math.min(10, pawns));
  return 50 + (clamped / 10) * 50;
}

function formatEval(pawns: number): string {
  if (Math.abs(pawns) >= 90) return pawns > 0 ? "M" : "-M";
  return (pawns >= 0 ? "+" : "") + pawns.toFixed(1);
}

export default function EvalBar({ evalBefore, evalAfter, flipped = false }: EvalBarProps) {
  if (evalBefore === null || evalAfter === null) return null;

  const beforePct = evalToWhitePct(evalBefore);
  const afterPct = evalToWhitePct(evalAfter);
  const displayPct = flipped ? 100 - afterPct : afterPct;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-5 rounded-sm overflow-hidden border border-border relative"
        style={{ height: "100%" }}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-white"
          initial={{ height: `${flipped ? 100 - beforePct : beforePct}%` }}
          animate={{ height: `${displayPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-zinc-800" style={{ zIndex: -1 }} />
      </div>

      <span className="text-[10px] font-mono text-muted-foreground">
        {formatEval(evalAfter)}
      </span>
    </div>
  );
}
