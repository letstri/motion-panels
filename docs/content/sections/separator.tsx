import { Code } from '@/components/docs/code'
import { Reference } from '@/components/docs/reference'
import { Section } from '@/components/docs/section'
import { SeparatorDemo } from '@/demos'

export const SeparatorSection = () => (
  <Section
    id="separator"
    title="Separator"
    lead="Drop a Separator between two panels and the same split gains a visible grip, keyboard control and double-click reset. It finds the sized panel next to it, resizes that one, and sits centred on the seam without taking space in the flow. It is a focusable [role='separator'] carrying the panel size on aria-valuenow."
  >
    <SeparatorDemo />
    <Reference
      head={['Key', 'Does']}
      rows={[
        ['Arrows', 'Grow or shrink by 10px, along the group axis'],
        ['Shift + arrows', 'The same, by 50px'],
        ['Page up / Page down', 'The same, by 50px, without a modifier'],
        ['Home / End', 'Jump to minSize or maxSize'],
        ['Enter', 'Toggle collapsed (needs onCollapsedChange)'],
        [
          'Double-click',
          'Reset to defaultSize, or to the size the panel mounted with',
        ],
      ]}
    />
    <Code
      code={`
import type { ReactNode } from 'react'
declare function FileTree(): ReactNode
declare function Editor(): ReactNode
// ---cut---
import { Group, Panel, Separator } from 'motion-panels/react'

export function Layout() {
  return (
    <Group>
      <Panel size={240} minSize={160} maxSize={420}>
        <FileTree />
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
