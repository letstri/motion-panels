import { Code } from '@/components/docs/code'
import { Section } from '@/components/docs/section'
import { HorizontalDemo } from '@/demos'

export const QuickStart = () => (
  <Section
    id="quick-start"
    title="Quick start"
    lead={
      'A group is a flex container. A panel with a size holds it, a panel without one fills what is left. That is the whole layout. No separator here \u2014 a sized panel is draggable by the edge facing the filling panel, so grab the seam below and pull. Hover any identifier in a snippet to read its real type.'
    }
  >
    <HorizontalDemo />
    <Code
      code={`
import type { ReactNode } from 'react'
declare function FileTree(): ReactNode
declare function Editor(): ReactNode
// ---cut---
import { Group, Panel } from 'motion-panels/react'
import { useState } from 'react'

export function Layout() {
  const [width, setWidth] = useState(240)

  return (
    <Group orientation="horizontal">
      <Panel
        size={width}
        minSize={160}
        maxSize={420}
        onSizeChange={setWidth}
      >
        <FileTree />
      </Panel>
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
