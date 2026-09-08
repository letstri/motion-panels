import { Code } from '@/components/docs/code'
import { Section } from '@/components/docs/section'
import { BothEdgesDemo } from '@/demos'

export const BothEdges = () => (
  <Section
    id="both-edges"
    title="Panels on both edges"
    lead="Each sized panel finds its own side: one before the filling panel drags on its end edge, one after it on its start edge. Two sized panels around one filling panel need no extra wiring, and again no separators. These two are percentages and stay percentages: a drag reports one back, so they keep following the group."
  >
    <BothEdgesDemo />
    <Code
      code={`
import type { ReactNode } from 'react'
declare function FileTree(): ReactNode
declare function Editor(): ReactNode
declare function Outline(): ReactNode
// ---cut---
import type { Size } from 'motion-panels/react'
import { Group, Panel } from 'motion-panels/react'
import { useState } from 'react'

export function Workbench() {
  const [left, setLeft] = useState<Size>('25%')
  const [right, setRight] = useState<Size>('25%')

  return (
    <Group>
      <Panel size={left} minSize="14%" maxSize="35%" onSizeChange={setLeft}>
        <FileTree />
      </Panel>
      <Panel>
        <Editor />
      </Panel>
      <Panel size={right} minSize="14%" maxSize="35%" onSizeChange={setRight}>
        <Outline />
      </Panel>
    </Group>
  )
}
`}
    />
  </Section>
)
