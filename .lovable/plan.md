

## Add Check/Checkmate/Promotion Sounds + Promotion UI

### 1. Sound Effects (`src/lib/chessSounds.ts`)

Add three new sound entries:
- `check`: `move-check.mp3`
- `checkmate`: `game-end.webm` (reuse existing URL)
- `promote`: `promote.mp3`

Export `playCheckSound()`, `playCheckmateSound()`, `playPromoteSound()`.

### 2. Sound Detection (`src/components/Chessboard.tsx`)

In the move-detection `useEffect` (lines 74-127), after determining the move type, also check the new FEN for check/checkmate state using `chess.js`:
- Create a temporary `Chess(fen)` from the new fen
- If `chess.isCheckmate()` → play checkmate sound (overrides all others)
- Else if `chess.inCheck()` → play check sound (overrides move/capture)
- Else if promotion detected (piece changed type on arrival) → play promote sound
- Otherwise, existing logic (capture/castle/move)

### 3. Promotion UI (`src/components/Chessboard.tsx`)

Add a promotion picker modal inside the Chessboard:

- New state: `promotionPending: { from: string; to: string } | null`
- When a pawn move to rank 1 or 8 is detected among legal moves in `handleSquareClick` and `handleDragEnd`, instead of immediately calling `onMove`, set `promotionPending`
- Show a vertical overlay of 4 piece SVGs (Queen, Rook, Bishop, Knight) in the player's color, positioned over the target square column
- On selection, call `onMove(from, to, san)` with the correct promotion SAN (e.g., `e8=Q`)
- Clicking outside or pressing Escape cancels

**Detection logic**: Check if any legal move from the source to the target has a `promotion` field set (chess.js includes this in verbose moves).

**Piece icons**: Use the existing SVG piece images from `PIECE_IMAGES` — e.g., for white promoting: `wQ.svg`, `wR.svg`, `wB.svg`, `wN.svg`.

### Files Changed
- `src/lib/chessSounds.ts` — add 3 sounds
- `src/components/Chessboard.tsx` — promotion UI + check/checkmate/promotion sound logic

