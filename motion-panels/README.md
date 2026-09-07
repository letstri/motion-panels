# motion-panels

Resizable panels animated with [Motion](https://motion.dev). A framework-agnostic core with a React adapter, unstyled, and with no layout library underneath.

Think `react-resizable-panels`, except the folding, collapsing and snapping are real animations — and the resizing engine is plain DOM, so other frameworks can sit on top of it.

```sh
pnpm add motion-panels motion       # the core alone
pnpm add motion-panels motion react # with the React adapter
```

## React

```tsx
import { Group, Panel, Separator } from 'motion-panels/react'
import { useState } from 'react'

function Layout() {
  const [size, setSize] = useState(280)

  return (
    <Group orientation="horizontal">
      <Panel minSize={200} maxSize={480} size={size} onSizeChange={setSize}>
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

Reordering animates on its own. Give the children keys, render them in a new order, and every box in the group travels from where it was to where the new order puts it instead of jumping there. The group's `transition` times the trip, and it goes instant under `prefers-reduced-motion: reduce`. A panel that moves also re-reads which side of the fill panel it is on, so folds keep anchoring on the edge facing the fill.

```tsx
<Group orientation="horizontal">
  {mode === 'agent' ? [chat, seam, workspace] : [workspace, seam, chat]}
</Group>
```

Give the children stable `key`s: React has to move the panels, not swap their props.

### `Panel`

A panel is _sized_ when given `size`, and _filling_ otherwise.

- `size` / `onSizeChange` — controlled pixel size. `onSizeChange` fires once at the end of a drag, and on every keyboard step; during a drag the size is driven by a motion value, so no re-render per frame.
- `minSize` / `maxSize` — bounds. `maxSize` is additionally capped by the space the other sized panels leave, so a panel can never push a sibling out of the group.
- `collapsed` / `onCollapsedChange` — folds the panel to zero. Dragging past half of `minSize` collapses; `Enter` on the separator toggles. Collapse-on-drag needs both `minSize` and `onCollapsedChange`.
- `resetSize` — what a separator double-click resets to. Defaults to the size the panel mounted with, so double-click reset works without it.
- `transition` — Motion transition for folding. Defaults to a 250ms ease; automatically becomes instant under `prefers-reduced-motion: reduce`.
- `pin` (filling panels only) — keeps the content at its final size and clipped while a sized panel folds, so heavy content (an editor, a virtualised table) lays out once per fold instead of once per frame. The content is anchored to the edge that is not moving, so it holds still while the panel edge slides across it. Off by default. Pin content that bleeds to its own edges; a block with its own border or rounded corners shows that edge jumping instead.

A sized panel renders two elements: an outer box that carries the animated extent, and the content box that takes your `style`, `className` and the rest of the props. `initial` / `animate` / `exit` apply to the content, so it can fade or slide while the box folds.

A sized panel can always be dragged by the edge facing the filling panel, `Separator` or not.

### `Separator`

Optional, rendered between two panels. It carries the visible grip, the keyboard interface and the double-click reset. It resizes the sized panel beside it and sits centred on the seam without taking flow space, so give it a size and it straddles the boundary on its own.

A sized panel with no `Separator` of its own renders one as the drag area on its edge. That one carries `data-motion-panels-edge`, is meant to stay invisible, and is still focusable — exclude it when styling by `[role='separator']`, and give it a focus style so keyboard users can find it.

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

`motion-panels` (the root export) has no framework dependency — it is the resizing engine the React adapter is built on, so an adapter for another framework Motion supports (Vue, via `motion-v`) is a thin binding layer, not a rewrite.

```ts
import {
  createPanel,
  createPanelGroup,
  FILL_ATTRIBUTE,
  grips,
} from 'motion-panels'

const group = createPanelGroup('horizontal')
const panel = createPanel(group, { size: 280, minSize: 200, maxSize: 480 })

fill.setAttribute(FILL_ATTRIBUTE, '') // the panel that takes what is left
const detach = panel.attach(element) // reads the panel's position in the group

panel.subscribe(render) // state: { bare, dragging, end, folding }
panel.motion.size // MotionValue<number> — bind to the panel's width/height
panel.motion.content // the content extent, held still while the panel folds
panel.drag.start()
panel.drag.move({ x: 40, y: 0 })
panel.drag.end()
panel.resizeByKey(event) // arrows, Shift, Page, Home / End, Enter
panel.sync({ size: 280, collapsed: true }) // a fold is one option change
panel.destroy() // drop the internal subscriptions when the node is gone
```

The core owns numbers, never nodes, so the adapter lays the flexbox out. That half is small and fixed:

| Element | What you give it |
| --- | --- |
| group root | `display: flex`, `flex-direction` from `group.axes.direction`, and `overflow: clip` on the outermost group. |
| filling panel | `FILL_ATTRIBUTE`, `flex: 1`, and a zero `min-width` / `min-height`. Every sized panel finds its own side by looking for this one. |
| sized panel | `flex-shrink: 0` and its extent from `motion.size` floored at 0. Feed the negative part back as a margin on the dragging edge so an overshoot pulls the layout instead of pushing it. |
| panel content | `flex-shrink: 0`, `100%` on the cross axis, extent from `motion.content`. |
| separator | `role="separator"`, `tabIndex`, `aria-orientation` from `group.axes.separator`, `aria-valuenow` from `panel.target`. |
| pinned fill | A flex wrapper with `justify-content` from `group.fill.anchor`, and the child sized by `group.fill.size`. |

For crossings, register each grip with `grips.register(element, panel)`, then on pointer down ask `grips.at(event)` what it hit and `grips.partners(hits, self)` for the controllers to drag alongside your own.

- `createPanelGroup(orientation)` — the shared registry: axes, the fill panel's motion values, the sized panels by side.
- `createPanel(group, options)` — one panel's state machine: bounds, drag, keyboard, fold animations, collapse. `sync(options)` feeds it new props; `destroy()` releases it.
- `usePanelState(panel)` (from `motion-panels/react`) — subscribes a React component to a controller's `state` if you drive the core yourself.
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
- A group needs a filling panel to tell which side each sized panel is on, and holds at most one sized panel per side. Both mistakes log a warning in development builds.
- `onSizeChange` reports at the end of a drag, not per frame. Read `panel.motion.size` if you need a live value.

## License

MIT © Valerii Strilets
