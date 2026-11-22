import { Code } from '@/components/docs/code'
import { Section } from '@/components/docs/section'
import { RailDemo } from '@/demos'

export const Rail = () => (
  <Section
    id="rail"
    title="Collapsing to a rail"
    lead="Give a panel a collapsedSize and collapsed folds it to that size instead of to nothing: a rail of icons. The content stays mounted and follows the size through the fold, so it lays itself out anew as it narrows instead of being clipped at the open size; what fades or slides inside it is yours, keyed on the same collapsed state. A drag past half the way down to the rail collapses it too."
  >
    <RailDemo />
    <Code
      code={`
import type { ReactNode } from 'react'
declare function Sidebar(props: { collapsed: boolean }): ReactNode
declare function Editor(): ReactNode
// ---cut---
import { Group, Panel, Separator } from 'motion-panels/react'
import { useState } from 'react'

export function Workspace() {
  const [width, setWidth] = useState(220)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Group>
      <Panel
        size={width}
        minSize={180}
        collapsed={collapsed}
        collapsedSize={52}
        onCollapsedChange={setCollapsed}
        onSizeChange={setWidth}
      >
        <Sidebar collapsed={collapsed} />
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
