

## Add Board/Tree View Toggle with Visual Tree Graph

### Overview
Add a toggle in the header area that switches between the current board view and a new visual tree graph view (like the reference screenshot — a node-graph layout with connected move nodes).

### Changes

**1. View toggle (`src/pages/RepertoireBuilder.tsx`)**
- Add state: `viewMode: "board" | "tree"` (default `"board"`)
- Place a two-button toggle group (board icon + tree icon) in the header bar, next to the side selector
- When `viewMode === "board"`, render the existing board + sidebar layout
- When `viewMode === "tree"`, render the new `VisualTreeGraph` component full-width

**2. New component: `src/components/VisualTreeGraph.tsx`**

A canvas/SVG-based visual tree that renders the `OpeningNode[]` as a horizontal node graph:
- **Root node**: orange diamond (starting position)
- **Move nodes**: rounded green pills showing `1. e4`, `1... e5`, etc.
- **Branching nodes**: show a small minus/collapse indicator when they have multiple children
- **Connections**: curved/straight lines between parent → child nodes
- **Layout algorithm**: main continuation flows horizontally right; branches fork vertically downward (like the reference image)
- **Interactions**: click a node → navigate to that path in the builder (calls `onNavigate(path)`)
- Active/selected node highlighted with an orange border

**Layout logic:**
- Walk the tree recursively, assign (x, y) coordinates
- Main line (child index 0) continues horizontally (same y, x + spacing)
- Branch lines (child index 1+) drop down (y + vertical spacing) then continue horizontally
- Use SVG `<line>` or `<path>` for connections, `<foreignObject>` or `<g>` for node pills

**Props:**
```typescript
interface VisualTreeGraphProps {
  tree: OpeningNode[];
  currentPath: TreePath;
  onNavigate: (path: TreePath) => void;
}
```

### Files
- `src/pages/RepertoireBuilder.tsx` — add toggle state + conditional rendering
- `src/components/VisualTreeGraph.tsx` — new visual tree graph component

