import { Code } from '@/components/docs/code'
import { ASIDE } from '@/components/docs/prose'
import { Section } from '@/components/docs/section'
import { PinDemo } from '@/demos'

export const Pinning = () => (
  <Section
    id="pinning"
    title="Pinning"
    lead="A panel reflows its content on every frame of a fold or a drag. A pinned one sizes the content once, up front, and anchors it to the edge that is not moving, so the content holds still while the panel edge slides across it. A drag sizes it to the largest extent the drag can reach. Toggle the pin off and watch the paragraph rewrap the whole way through."
  >
    <PinDemo />
    <p className={ASIDE}>
      The pin prop holds the whole panel content, so use it for content that
      bleeds to its own edges: an editor, a document, a table. A panel with a
      frame of its own (a card with a border, a header, a toolbar) wraps only
      its heavy part in a Pin instead: the frame keeps following the pointer,
      the Pin holds still inside it and its parent clips the far end like a
      viewport, and when the pointer rests it lays out once at the size on
      screen.
    </p>
    <Code
      code={`
import type { ReactNode } from 'react'
declare function FileTree(): ReactNode
declare function Document(): ReactNode
// ---cut---
import { Group, Panel, Pin, Separator } from 'motion-panels/react'
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
      <Panel className="card">
        <header>Document</header>
        <Pin className="viewport">
          <Document />
        </Pin>
      </Panel>
    </Group>
  )
}
`}
    />
  </Section>
)
