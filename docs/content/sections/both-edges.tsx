import { Code } from '@/components/docs/code'
import { Section } from '@/components/docs/section'
import { BothEdgesDemo } from '@/demos'

export const BothEdges = () => (
  <Section
    id="both-edges"
    title="Panels on both edges"
    lead="Each sized panel finds its own side: one before the filling panel drags on its end edge, one after it on its start edge. Two sized panels around one filling panel need no extra wiring, and again no separators."
  >
    <BothEdgesDemo />
    <Code
      code={`
import type { ReactNode } from 'react'
declare function FileTree(): ReactNode
declare function Editor(): ReactNode
declare function Outline(): ReactNode
// ---cut---
import { Group, Panel } from 'motion-panels/react'
import { useState } from 'react'

export function Workbench() {
  const [left, setLeft] = useState(180)
  const [right, setRight] = useState(180)

  return (
    <Group>
      <Panel size={left} minSize={120} onSizeChange={setLeft}>
        <FileTree />
      </Panel>
      <Panel>
        <Editor />
      </Panel>
      <Panel size={right} minSize={120} onSizeChange={setRight}>
        <Outline />
      </Panel>
    </Group>
  )
}
`}
    />
  </Section>
)
