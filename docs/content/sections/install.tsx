import { Code } from '@/components/docs/code'
import { CHIP, LEAD } from '@/components/docs/prose'
import { Section, Subheading } from '@/components/docs/section'
import { ShadcnDemo } from '@/demos'

export const Install = () => (
  <Section
    id="install"
    title="Install"
    lead="Two entry points: motion-panels is the resizing engine and depends on nothing but motion, motion-panels/react is the components. React is an optional peer, so the core alone never loads the React types."
  >
    <Code
      lang="sh"
      code={`pnpm add motion-panels motion       # the core alone
pnpm add motion-panels motion react # with the React adapter`}
    />
    <Code
      code={`
import { createPanel, createPanelGroup } from 'motion-panels'
//       ^?
import { Group, Panel, Separator } from 'motion-panels/react'
`}
    />
    <Subheading>shadcn</Subheading>
    <p className={`${LEAD} mt-4`}>
      The registry ships one item: a styled separator over the same components,
      written into your project as{' '}
      <span className={CHIP}>components/ui/motion-panels.tsx</span> and yours to
      edit. It pulls the package in for you.
    </p>
    <ShadcnDemo />
    <Code
      lang="sh"
      code="npx shadcn@latest add https://motion-panels.letstri.dev/r/motion-panels.json"
    />
    <Code
      twoslash={false}
      code={`import { PanelGroup, Panel, PanelSeparator } from '@/components/ui/motion-panels'
import { useState } from 'react'

export function Layout() {
  const [width, setWidth] = useState(240)

  return (
    <PanelGroup orientation="horizontal">
      <Panel size={width} minSize={160} maxSize={420} onSizeChange={setWidth}>
        <FileTree />
      </Panel>
      <PanelSeparator withHandle />
      <Panel>
        <Editor />
      </Panel>
    </PanelGroup>
  )
}
`}
    />
  </Section>
)
