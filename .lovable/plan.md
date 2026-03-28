

# Repertoire Builder: Tree Layout Fix + Rich Annotations

## Overview
Three changes: fix the move tree to render inline (not diagonal), add move symbol annotations using the uploaded icons, and add arrow/highlight drawing on the board.

## 1. Copy symbol icons to `public/symbols/`
Copy all 10 uploaded images:
- `best_64x.png`, `alternative_64x.png`, `blunder_64x.png`, `book_64x.png`, `brilliant_64x.png`, `excellent_64x.png`, `forced_64x.png`, `missed_oppurtunity.png`, `mistake_64x.png`, `great_find_64x.png`

## 2. Extend `OpeningNode` interface (`src/data/openings.ts`)
Add optional fields:
- `nag?: string` — symbol key (e.g. `"brilliant"`, `"blunder"`, `"book"`)
- `arrows?: { from: string; to: string; color: string }[]`
- `highlights?: { square: string; color: string }[]`

## 3. Rewrite `TreeView` layout (Lichess-style inline)
Current: every node indents with `ml-3 border-l`. This causes diagonal drift even for single-child continuations.

New behavior:
- **First child** (index 0) at each node renders **inline** — continues straight down, no indent
- **Siblings at index 1+** render as indented sub-variations with `ml-4 border-l`
- Sub-variations follow the same rule internally
- Result: main line goes straight down; branches fork off to the right

## 4. NAG symbol selector in annotation panel
When a node is selected, show a row of clickable symbol buttons above the text annotation:
- Each button shows the icon image (16-20px) with a tooltip label
- Clicking sets `node.nag`; clicking again removes it
- Symbol mapping: `brilliant`, `great_find`, `best`, `excellent`, `interesting` (great_find), `book`, `forced`, `alternative`, `mistake`, `blunder`, `missed_opportunity`
- In the tree view, the NAG icon renders as a small (12px) badge next to the move text

## 5. Arrow and highlight drawing on the board
**Chessboard.tsx changes:**
- New props: `customArrows?: { from: string; to: string; color: string }[]` and `customHighlights?: { square: string; color: string }[]`
- Render highlights as colored semi-transparent square overlays
- Render arrows as SVG lines/polygons (reuse `MoveArrow` pattern, but with custom colors)

**RepertoireBuilder.tsx changes:**
- Right-click-drag on board draws an arrow (default green; shift = red, alt = yellow, ctrl = blue)
- Right-click on a square toggles a highlight (cycles green → red → yellow → blue → off)
- Arrows and highlights are saved to the selected node and persist in the tree
- When navigating to a node, its stored arrows/highlights are passed to the board

## Files Modified
| File | Change |
|------|--------|
| `public/symbols/*` | 10 new icon files |
| `src/data/openings.ts` | Add `nag`, `arrows`, `highlights` to `OpeningNode` |
| `src/components/Chessboard.tsx` | Add `customArrows`, `customHighlights` props + rendering |
| `src/pages/RepertoireBuilder.tsx` | Rewrite TreeView layout, add NAG selector, add arrow/highlight interaction |

