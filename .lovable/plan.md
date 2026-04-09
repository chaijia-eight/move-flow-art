

# Auto-Validate All Opening Lines with Engine

## What this does
Run every move of every line (163 lines, ~3,400 moves) through a chess engine validator to catch:
- **Illegal moves** (wrong FENs, impossible moves)
- **Obvious blunders** (moves that lose significant material or position, scored by Stockfish)
- **Suspicious sequences** (moves that don't match standard theory)

Then generate a **report document** highlighting every problem found, organized by opening, so you know exactly what to fix.

## Steps

1. **Write a validation script** that:
   - Imports all openings from `openingTrees.ts` and extracts all 163 lines using the same `extractAllLines` logic
   - Replays each line move-by-move using `chess.js` to verify legality
   - Optionally evaluates key moves with Stockfish to flag blunders (moves losing >200cp vs best)
   - Records every issue found with opening name, variation, line index, move number, and what's wrong

2. **Generate a Word document** (`Line_Audit_Report.docx`) organized by opening, showing:
   - Which lines are clean vs problematic
   - Each flagged move with the issue description
   - Suggested corrections where possible

3. **Also regenerate `Move_Explanations_v4.docx`** with problem moves highlighted in the document so you can fix explanations alongside the moves

## What you'll get
- A clear audit showing "Italian Game Giuoco Piano line 3, move 7: Blunder — loses a piece" type findings
- You can then tell me "fix lines X, Y, Z" or edit the doc and hand it back

## Technical details
- Uses `chess.js` for move legality validation
- Uses the project's own `extractAllLines` function for consistent line extraction  
- Script runs in Node.js on the server — no UI changes needed

