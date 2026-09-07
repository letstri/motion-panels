import { Code } from '@/components/docs/code'
import { Section } from '@/components/docs/section'
import { FoldDemo } from '@/demos'

export const Collapsing = () => (
  <Section
    id="collapsing"
    title="Collapsing and folds"
    lead="A collapsed panel folds to zero, and its content animates with whatever motion props the panel carries, so the fold is yours to design. Pick a preset and toggle. The content is anchored to the edge facing the filling panel, so a slide leans into the fold and originX pins a scale to that same edge. Passing onCollapsedChange also turns on drag-below-half-the-minimum and Enter on the separator."
  >
    <FoldDemo />
    <Code
      code={`
import type { ReactNode } from 'react'
declare function Navigator(): ReactNode
declare function Editor(): ReactNode
// ---cut---
import { Group, Panel, Separator } from 'motion-panels/react'
import { useState } from 'react'

export function Workspace() {
  const [width, setWidth] = useState(260)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Group>
      <Panel
        size={width}
        minSize={180}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onSizeChange={setWidth}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ bounce: 0.4, duration: 0.7, type: 'spring' }}
        style={{ originX: 1 }}
      >
        <Navigator />
      </Panel>
      <Separator />
      <Panel>
        <Editor />
      </Panel>
    </Group>
  )
}
`}
    />
  </Section>
)
