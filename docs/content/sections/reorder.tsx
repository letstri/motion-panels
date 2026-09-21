import { Code } from '@/components/docs/code'
import { ASIDE } from '@/components/docs/prose'
import { Section } from '@/components/docs/section'
import { ReorderDemo } from '@/demos'

export const Reordering = () => (
  <Section
    id="reordering"
    title="Reordering"
    lead="Grab the dots in a panel header and carry the panel across: the two sides trade places and travel there. Give the group the order it should read and a callback, give each movable panel its value, and the drag is motion's own reorder gesture — the order lives in your state, so it is yours to persist."
  >
    <ReorderDemo />
    <Code
      code={`
import type { ReactNode } from 'react'
declare function Files(): ReactNode
declare function Outline(): ReactNode
declare function Editor(): ReactNode
declare const GRIP: string
// ---cut---
import { Group, Handle, Panel, Separator } from 'motion-panels/react'
import { useState } from 'react'

const SIDES: Record<string, ReactNode> = {
  files: <Files />,
  outline: <Outline />,
}

export function Workspace() {
  const [order, setOrder] = useState(['files', 'outline'])

  const side = (id: string) => (
    <Panel key={id} size={200} value={id}>
      <Handle className={GRIP}>⠿</Handle>
      {SIDES[id]}
    </Panel>
  )

  return (
    <Group order={order} onOrderChange={setOrder}>
      {side(order[0])}
      <Separator />
      <Panel>
        <Editor />
      </Panel>
      <Separator />
      {side(order[1])}
    </Group>
  )
}
`}
    />
    <p className={ASIDE}>
      The filling panel carries no value here, and that is the whole rule: a
      group holds at most one sized panel on each side of it, so the panels that
      move are the ones you name in <code>order</code>, and no drag can reach an
      order the group cannot hold. A panel left out stays where it is — the
      middle card above shows no dots, because <code>Handle</code> renders
      nothing inside a panel the group does not move. Handles are buttons: focus
      one and the arrow keys along the group axis move the panel too. Motion
      takes the drag from there — it snaps the panel back if it lands nowhere
      and scrolls a long group at the edges — and a right-to-left group carries
      the panel the way the row reads.
    </p>
  </Section>
)
