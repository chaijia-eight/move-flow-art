
## Repertoire Builder (Garden v2)

**Status**: Phase 1-4 implemented

### What was built:
1. **Database**: `user_repertoires` table with `tree jsonb` column storing `OpeningNode[]` trees, full RLS policies
2. **Garden Hub** (`/garden`): Grid of user repertoire cards with edit/study/delete
3. **Repertoire Builder** (`/garden/build/:id?`): Full board-based tree editor with branching, annotations, Stockfish evaluation, and save
4. **Repertoire Study** (`/garden/study/:id`): Practice mode that extracts lines from the tree and quizzes the user with progress tracking and mastery prompts

### Routes:
- `/garden` — Hub listing all repertoires
- `/garden/build` — New repertoire
- `/garden/build/:repertoireId` — Edit existing
- `/garden/study/:repertoireId` — Practice lines

### Old Garden removed:
- Deleted `GardenCard.tsx`, `GardenPractice.tsx`
- Removed `/study/:openingId/custom/:lineId` route
