import { Code } from '@/components/docs/code'
import { Section } from '@/components/docs/section'

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
  </Section>
)
