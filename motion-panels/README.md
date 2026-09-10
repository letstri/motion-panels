# motion-panels

Resizable panels animated with [Motion](https://motion.dev). A framework-agnostic core with a React adapter, unstyled, and with no layout library underneath.

Think `react-resizable-panels`, except the folding, collapsing and snapping are real animations — and the resizing engine is plain DOM, so other frameworks can sit on top of it.

```sh
pnpm add motion-panels motion       # the core alone
pnpm add motion-panels motion react # with the React adapter
```

Or through shadcn, which writes a styled separator over the same components into `components/ui/motion-panels.tsx`:

```sh
npx shadcn@latest add https://motion-panels.letstri.dev/r/motion-panels.json
```

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

Space the panels with padding, a flex gap on the group (it opens on both sides of a separator), or not at all: the room a panel may take is measured, never assumed from the group extent. Every size is pixels or a percentage of the group — `useState<Size>('30%')` gives a panel that follows the group as it resizes, and `onSizeChange` reports back in whichever form it was given.

Folding, collapsing, pinning, nesting, separator intersections, keyboard and RTL support, plus the framework-agnostic core API — all with live demos:

**[motion-panels.letstri.dev](https://motion-panels.letstri.dev)**

## License

MIT © Valerii Strilets
