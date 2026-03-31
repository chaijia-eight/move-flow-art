

## Chapter Management: Delete, Rename, Default Naming

### Changes — `src/pages/RepertoireBuilder.tsx`

**1. Default chapter name = "Chapter X"**
- When creating a chapter (both in `createChapter` and initial load for old-format data), use `Chapter ${index + 1}` as the default name.
- Update `newChapterName` state default and its reset after chapter creation to always reflect the next chapter number.

**2. Rename chapter (inline editing)**
- Add state: `editingChapterIdx: number | null` and `editingChapterName: string`.
- Double-click on a chapter tab → enter inline edit mode (replace the tab text with a small `Input`).
- On Enter or blur → save the new name into `chapters[idx].name`, exit edit mode.
- On Escape → cancel and exit edit mode.

**3. Delete chapter**
- Add a small `X` button on each chapter tab (shown on hover or when active), only when there are 2+ chapters.
- On click → remove that chapter from `chapters`, adjust `activeChapterIdx` if needed (clamp to valid range), reset `currentPath`.
- If only 1 chapter remains, hide the delete button.

**4. Chapter tab UI update**
- Each tab becomes a flex row: chapter name (or inline input) + delete X button.
- Hover state shows delete icon with subtle opacity transition.

### Technical Details

| Feature | Implementation |
|---------|---------------|
| Rename | `editingChapterIdx` state, double-click handler, controlled `Input` with `onKeyDown` (Enter/Escape) and `onBlur` |
| Delete | Filter out chapter by index, clamp `activeChapterIdx` to `Math.min(current, newLength - 1)` |
| Default name | `Chapter ${chapters.length + 1}` pattern in `createChapter` and initial `newChapterName` |

### Files
- `src/pages/RepertoireBuilder.tsx` — all changes in one file

