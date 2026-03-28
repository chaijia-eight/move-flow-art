
## Remove trap names from Study Hub

**What changes**: Remove the trap name (`h3` element showing the variation name) from each trap card in the "Crushing Lines" section of the Study Hub. The flame icon and description will remain.

**File**: `src/pages/StudyHub.tsx` (lines 542-546)

Remove the `h3` element that displays `tVar(variation.id, "name", variation.name)`. Keep the flame icon and the lock timer badge on the same row.
