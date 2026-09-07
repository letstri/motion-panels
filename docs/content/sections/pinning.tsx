import { Code } from '@/components/docs/code'
import { ASIDE } from '@/components/docs/prose'
import { Section } from '@/components/docs/section'
import { PinDemo } from '@/demos'

export const Pinning = () => (
  <Section
    id="pinning"
    title="Pinning"
    lead="A filling panel reflows its content on every frame of a fold. A pinned one sizes the content once, up front, and anchors it to the edge that is not moving, so the content holds still while the fold slides the panel edge across it. Toggle the pin off and watch the paragraph rewrap the whole way through."
  >
    <PinDemo />
    <p className={ASIDE}>
      Pin content that bleeds to its own edges: an editor, a document, a table.
      A block with its own border or rounded corners shows that edge jumping
      instead, which is why the paragraph here has no frame of its own. The
      anchor follows the fold, so a sized panel placed after the filling one
      pins to the start edge instead.
    </p>
    <Code
      code={`
import type { ReactNode } from 'react'
declare function FileTree(): ReactNode
declare function Document(): ReactNode
// ---cut---
import { Group, Panel, Separator } from 'motion-panels/react'
import { useState } from 'react'

export function Workspace() {
  const [width, setWidth] = useState(240)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Group>
      <Panel
        size={width}
        minSize={160}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onSizeChange={setWidth}
      >
        <FileTree />
      </Panel>
      <Separator />
      <Panel pin>
        <Document />
      </Panel>
    </Group>
  )
}
`}
    />
  </Section>
)
