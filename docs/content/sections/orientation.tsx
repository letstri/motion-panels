import { Code } from '@/components/docs/code'
import { Section } from '@/components/docs/section'
import { VerticalDemo } from '@/demos'

export const Orientation = () => (
  <Section
    id="orientation"
    title="Orientation"
    lead={
      'The same split on the other axis. Nothing about the panel or the separator changes \u2014 the group decides the axis, the cursor, the separator orientation and which arrow keys grow it.'
    }
  >
    <VerticalDemo />
    <Code
      code={`
import type { ReactNode } from 'react'
declare function Editor(): ReactNode
declare function Output(): ReactNode
// ---cut---
import { Group, Panel, Separator } from 'motion-panels/react'
import { useState } from 'react'

export function Workspace() {
  const [height, setHeight] = useState(120)

  return (
    <Group orientation="vertical">
      <Panel>
        <Editor />
      </Panel>
      <Separator />
      <Panel size={height} minSize={80} maxSize={220} onSizeChange={setHeight}>
        <Output />
      </Panel>
    </Group>
  )
}
`}
    />
  </Section>
)
