

## Fix: Engine Eval Always From White's Perspective

**Problem**: Stockfish returns scores relative to the side to move. So when it's Black's turn and White is winning, the engine says +3.3 (good for Black to move? no — it's the raw score). Actually, the score is from the side-to-move's perspective: +3.3 on White's turn means White is ahead, but +3.3 on Black's turn means Black is ahead. The display doesn't normalize to White's perspective.

**Fix** in `src/pages/RepertoireBuilder.tsx`:

1. In `formatScore`, check whose turn it is from `currentFen`. If it's Black's turn, negate the score before displaying, so the eval is always from White's perspective (standard convention: positive = White advantage).

2. Similarly fix the color thresholds on the score display — apply the same normalization so green = White ahead, red = Black ahead regardless of whose turn it is.

**Changes:**
- `formatScore` will accept the FEN or turn info, negate `ev.score` when it's Black's turn
- Update the color conditional to use the normalized score
- Same normalization for `ev.mate` display

