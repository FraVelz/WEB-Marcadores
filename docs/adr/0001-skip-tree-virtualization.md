# ADR 0001 — Skip tree virtualization (for now)

- **Status:** Accepted
- **Date:** 2026-07-15
- **Ticket:** C3-1

## Context

Plan 12 Oleada 3 asks for tree virtualization **if** measured libraries exceed **300 visible nodes** with jank (INP expand/collapse budget ≤ 150 ms in `03-web-marcadores.md` §8). The explorer already renders a flat list of rows (`MarcadoresTreeView` + `useMarcadoresTreeDerived`) with keyboard nav, DnD, and `aria-expanded`.

## Measurement (2026-07-15)

Synthetic libraries via `measureTreeFlatten` / `measureTreeFlatten.test.ts` (same walk as production tree flatten, no collapse):

| Nodes | Avg flatten (local Node) |
| ----: | -----------------------: |
|   100 |                 ~0.03 ms |
|   300 |                 ~0.05 ms |
|   500 |                 ~0.08 ms |
|  1000 |                 ~0.15 ms |

CI gate in the unit test: flatten at ≥300 nodes stays **&lt; 5 ms** (orders of magnitude under the INP budget for the _data_ walk). Real-usage checklist (`docs/ops/uso-real-checklist.md`) has **no** evidence yet of a personal library ≥300 nodes.

DOM cost of ~300 simple rows is acceptable for mid polish; adding `react-window` / Virtuoso would force rework of:

- keyboard focus + `itemRefs` map
- pragmatic-drag-and-drop drop targets
- tree `role="tree"` / `aria-expanded` semantics

## Decision

**Do not ship list virtualization in Oleada 3.** Keep full-row render + collapse-as-lazy-children.

Revisit when **both** are true:

1. A real (or fixture) library shows **≥ 300 visible rows** expanded, and
2. Measured INP on expand/collapse or scroll **exceeds 150 ms** on a mid-tier device.

Then prefer windowing **or** stronger lazy-by-folder loading, with an ADR update.

## Consequences

- **Positive:** Avoids high-risk a11y/DnD regression for a problem we have not measured in prod.
- **Positive:** Measurement + test keep the gate honest (no silent “later”).
- **Negative:** A power user with 1k+ bookmarks may see list jank until we revisit.

## Alternatives considered

| Option               | Why not now                                                 |
| -------------------- | ----------------------------------------------------------- |
| Always virtualize    | Complexity vs unproven need; breaks current tree a11y path  |
| Cap UI at 300        | Bad UX; import already allows larger trees                  |
| Only virtualize grid | Same DnD/ref issues; grid is folder-scoped, usually smaller |

## References

- `src/features/marcadores/utils/measureTreeFlatten.ts`
- `src/features/marcadores/utils/measureTreeFlatten.test.ts`
- `src/features/marcadores/components/MarcadoresTreeView.tsx`
- Plan 12 §5.2 C3-1; guide `03-web-marcadores.md` §8 / §12
