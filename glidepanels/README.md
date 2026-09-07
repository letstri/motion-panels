# glidepanels

Resizable panels that **glide**. A framework-agnostic core with a React adapter, animated with [Motion](https://motion.dev), unstyled, and with no layout library underneath.

Think `react-resizable-panels`, except the folding, collapsing and snapping are real animations — and the resizing engine is plain DOM, so other frameworks can sit on top of it.

```sh
pnpm add glidepanels motion react
```

## React

```tsx
import { Group, Panel, Separator } from 'glidepanels/react'
import { useState } from 'react'

function Layout() {
  const [size, setSize] = useState(280)

  return (
    <Group orientation="horizontal">
      <Panel
        defaultSize={280}
        minSize={200}
        maxSize={480}
        size={size}
        onSizeChange={setSize}
      >
        <Sidebar />
      </Panel>
      <Separator />
      <Panel>
        <Content />
      </Panel>
    </Group>
  )
}
```

### `Group`

Flex container. `orientation` is `horizontal` (default) or `vertical`. Groups nest — put one inside a `Panel`.

A group holds **at most one sized panel on each side of a fill panel**: one before it, one after it. Layouts with more splits are expressed by nesting groups, which is also how nested orientations work.

### `Panel`

A panel is _sized_ when given `size`, and _filling_ otherwise.

- `size` / `onSizeChange` — controlled pixel size. `onSizeChange` fires once at the end of a drag, and on every keyboard step; during a drag the size is driven by a motion value, so no re-render per frame.
- `minSize` / `maxSize` — bounds. `maxSize` is additionally capped by the space the other sized panels leave, so a panel can never push a sibling out of the group.
- `collapsed` / `onCollapsedChange` — folds the panel to zero. Dragging past half of `minSize` collapses; `Enter` on the separator toggles. Collapse-on-drag needs both `minSize` and `onCollapsedChange`.
- `defaultSize` — what a separator double-click resets to.
- `transition` — Motion transition for folding. Defaults to a 250ms ease; automatically becomes instant under `prefers-reduced-motion: reduce`.
- `pin` (filling panels only) — keeps the content at its final size and clipped while a sized panel folds, so heavy content (an editor, a virtualised table) lays out once per fold instead of once per frame. The content is anchored to the edge that is not moving, so it holds still while the panel edge slides across it. Off by default. Pin content that bleeds to its own edges; a block with its own border or rounded corners shows that edge jumping instead.

A sized panel can always be dragged by the edge facing the filling panel, `Separator` or not.

### `Separator`

Optional, rendered between two panels. It carries the visible grip, the keyboard interface and the double-click reset. It resizes the sized panel beside it and sits over that panel's edge without taking flow space, so style it with a size and a negative margin to straddle the seam.

A sized panel with no `Separator` of its own renders one as the drag area on its edge. That one carries `data-glidepanels-edge`, is meant to stay invisible, and is still focusable — exclude it when styling by `[role='separator']`, and give it a focus style so keyboard users can find it.

Keyboard, on a focused separator:

| Key | Action |
| --- | --- |
| Arrow keys along the axis | resize by 10px |
| `Shift` + arrows, `PageUp` / `PageDown` | resize by 50px |
| `Home` / `End` | minimum / maximum size |
| `Enter` | toggle collapsed |
| `Escape` (while dragging) | cancel the drag and restore the starting size |

### Intersections

Where two separators meet, a press near the crossing drags every separator whose grip reaches the pointer, each resizing its own panel, with a `move` cursor. Nothing to add for nested groups.

While the pointer sits at a crossing, every separator it would drag carries `data-crossing`; from press until release they carry `data-resizing` instead, whether or not the drag has moved yet.

```tsx
<Group orientation="horizontal">
  <Panel size={sidebar} onSizeChange={setSidebar}>
    <Sidebar />
  </Panel>
  <Separator />
  <Panel>
    <Group orientation="vertical">
      <Panel>
        <Editor />
      </Panel>
      <Separator />
      <Panel size={output} onSizeChange={setOutput}>
        <Output />
      </Panel>
    </Group>
  </Panel>
</Group>
```

## Core

`glidepanels` (the root export) has no framework dependency — it is the resizing engine the React adapter is built on, so an adapter for another framework Motion supports (Vue, via `motion-v`) is a thin binding layer, not a rewrite.

```ts
import { createPanel, createPanelGroup, grips } from 'glidepanels'
import { animate, motionValue } from 'motion/react'

const group = createPanelGroup({ animate, motionValue }, 'horizontal')
const panel = createPanel(group, { size: 280, minSize: 200, maxSize: 480 })

const detach = panel.attach(element) // reads the panel's position in the group

panel.subscribe(render) // state: { bare, dragging, end, folding }
panel.motion.size // MotionValue<number> — bind to the panel's width/height
panel.drag.start()
panel.drag.move({ x: 40, y: 0 })
panel.drag.end()
```

- `createPanelGroup(motion, orientation)` — the shared registry: axes, the fill panel's motion values, the sized panels by side. `motion` is `{ animate, motionValue }`, handed in by the adapter so the panels and the elements that render them always share one Motion instance.
- `createPanel(group, options)` — one panel's state machine: bounds, drag, keyboard, fold animations, collapse. `sync(options)` feeds it new props; `destroy()` releases it.
- `grips` — the pointer registry behind crossings: rect-cached hit testing, `crossed` / `held` marking, and the partner lookup that makes an intersection drag several separators at once.

The docs site carries a live split built this way — no components, just the core wired to plain DOM nodes — next to the React version of the same layout.

## Accessibility and input

- Separators are `role="separator"`, focusable, and expose `aria-orientation`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`. Pass `aria-label` to name the panel a separator resizes; the default is `Resize panel`.
- Fold and collapse animations respect `prefers-reduced-motion: reduce`.
- Edge drag areas grow from 8px to 20px, and crossing slack from 5px to 12px, on coarse pointers.
- Dragging locks text selection (including `-webkit-user-select` for Safari) and restores it on release, on cancel, and on unmount.
- Layouts in `dir="rtl"` drag and step in the direction the user sees.

## Known limits

- Sizes are controlled by you and are **not** clamped when the container shrinks; re-clamp on resize if your layout can get smaller than the panels.
- A group needs a filling panel to tell which side each sized panel is on.
- `onSizeChange` reports at the end of a drag, not per frame. Read `panel.motion.size` if you need a live value.

## License

MIT © Valerii Strilets
