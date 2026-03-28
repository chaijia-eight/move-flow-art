

# Learning Path + List View Together in StudyHub

## Overview
Add the winding circle-path visualization **above** each variation's existing line list. Both share the same data and navigation logic. The path provides a visual overview; the expandable list below it provides detail.

## Layout Per Variation

```text
┌─────────────────────────────────────────┐
│  ● Exchange Variation    2/5 lines      │  <- clickable header (unchanged)
│                                         │
│         ◉                               │  <- winding path of circles
│       ◉   ◉                             │     (always visible when expanded)
│         ◉                               │
│           ◉                             │
│                                         │
│  ┌─ Line 1: Main Line ──────────── ✓ ┐  │  <- existing list items
│  ├─ Line 2: With Bf5 ──────────── → ┤  │     (unchanged, below path)
│  └─ Line 3: Sideline ───────── 🔒 ┘  │
└─────────────────────────────────────────┘
```

## New Component: `src/components/LearningPath.tsx`

Props: `lines: Line[]`, `theme: OpeningTheme`, `openingId: string`, `variationId: string`, `primarySide: "w" | "b"`, `onNavigate: (lineIndex: number) => void`

Rendering:
- Circles laid out on a serpentine vertical path (zigzag pattern: center, right, center, left, repeating)
- Each circle ~40px, filled with `theme.accentColor` if unlocked, gray if locked
- SVG progress ring around each circle: `strokeDashoffset` based on `correctAttempts / 3`
- Mastered circles show a checkmark inside
- Connecting line between circles (thin curved SVG path or simple straight segments)
- Click a circle → calls `onNavigate(lineIndex)`

## Changes to `src/pages/StudyHub.tsx`

Inside the expanded variation section (lines ~412-516), insert `<LearningPath>` above the existing line list. Both use the same `lines` array, `getLineProgress`, `isLineUnlocked`, and navigation handler. No removal of the list — they coexist.

## Files Modified
| File | Change |
|------|--------|
| `src/components/LearningPath.tsx` | New component — winding circle path |
| `src/pages/StudyHub.tsx` | Import and render `LearningPath` inside each expanded variation, above existing list |

