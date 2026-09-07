import { Code } from '@/components/docs/code'
import { ASIDE } from '@/components/docs/prose'
import { Section } from '@/components/docs/section'
import { DeepNestDemo, NestedDemo } from '@/demos'

export const Nesting = () => (
  <Section
    id="nesting"
    title="Nesting and intersections"
    lead={
      'Groups nest: here a vertical split lives inside the filling panel of a horizontal one. Where the two seams meet, press near the crossing and both separators follow the pointer \u2014 the cursor turns to move and each one resizes its own panel. Nothing to add: any separator whose grip reaches the pointer joins the drag.'
    }
  >
    <NestedDemo />
    <Code
      code={`
import type { ReactNode } from 'react'
declare function FileTree(): ReactNode
declare function Editor(): ReactNode
declare function Console(): ReactNode
// ---cut---
import { Group, Panel, Separator } from 'motion-panels/react'
import { useState } from 'react'

export function Ide() {
  const [sidebar, setSidebar] = useState(200)
  const [terminal, setTerminal] = useState(100)

  return (
    <Group>
      <Panel size={sidebar} minSize={140} onSizeChange={setSidebar}>
        <FileTree />
      </Panel>
      <Separator />
      <Panel>
        <Group orientation="vertical">
          <Panel>
            <Editor />
          </Panel>
          <Separator />
          <Panel size={terminal} minSize={60} onSizeChange={setTerminal}>
            <Console />
          </Panel>
        </Group>
      </Panel>
    </Group>
  )
}
`}
    />
    <p className={ASIDE}>
      Depth is not limited. Below, a horizontal split sits in the top panel of a
      vertical split, which sits in the filling panel of the outer row. Both
      crossings resize both axes: files with terminal at the left end of the
      terminal seam, outline with terminal at its right end — two levels apart,
      and neither knows about the other.
    </p>
    <DeepNestDemo />
  </Section>
)
