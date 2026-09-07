'use client'

import { Group, Panel, Separator } from 'motion-panels/react'
import { useRef, useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import {
  CONTROLS,
  Card,
  Editor,
  FILES,
  Lines,
  OUTPUT,
  Pane,
  Rows,
  SEPARATOR,
  px,
} from './shared'

const TURNS = [
  { from: 'you', text: 'Make the file tree collapsible.' },
  { from: 'agent', text: 'Added onCollapsedChange to the Files panel.' },
  { from: 'agent', text: 'Enter on its separator toggles it now.' },
]

const Chat = () => (
  <ul className="flex list-none flex-col gap-3 overflow-hidden p-2.5">
    {TURNS.map(({ from, text }) => (
      <li key={text}>
        <span className="kicker text-muted-foreground/60">{from}</span>
        <p
          className={`mt-1 text-[12px] leading-[1.55] ${
            from === 'agent' ? 'text-muted-foreground' : ''
          }`}
        >
          {text}
        </p>
      </li>
    ))}
  </ul>
)

const SHARE = { agent: 0.7, editor: 0.3 }

// One clock for every box in the row. A switch is a reorder and two folds at
// once, and neighbours that travel and resize on different curves tear the
// seams between them: the row is only ever as tight as its slowest panel.
//
// A spring rather than a tween: smooth is a matter of the curve, not the clock,
// and a spring carries its speed into the arrival instead of braking into it.
// visualDuration is time to arrive, not time to settle, so this is quicker off
// the mark than the house curve and the tail is only the spring letting go.
// Bounce stays low: five boxes overshooting together is a wobble, not a
// flourish.
const SWITCH = {
  bounce: 0.15,
  type: 'spring',
  visualDuration: 0.3,
} as const

// Opacity is the only fold that survives the trip. Anything with a transform of
// its own — a hinge, a spring — fights the travel transform the reorder is
// already driving, and the two cards tumble through each other.
//
// The boxes swap sides, so at some point in the trip they are on top of one
// another. Content therefore keeps its own clock, off the spring: it leaves
// well before the crossing and comes back after it, which is what stops the
// overlap from reading as two cards ghosting. Both are shorter than the trip,
// so this costs the switch nothing.
const FOLD = {
  animate: { opacity: 1, transition: { delay: 0.08, duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
  initial: { opacity: 0 },
  transition: SWITCH,
} as const

type Mode = 'agent' | 'editor'

// A mode is a reorder, not a state: the chat changes sides. layoutDependency
// on the Group is what animates the trip — Motion measures the row on exactly
// the renders where mode changed, and never on a drag frame.
export const HeroDemo = () => {
  const [mode, setMode] = useState<Mode>('editor')
  const [files, setFiles] = useState(150)
  const [terminal, setTerminal] = useState(112)
  const [agent, setAgent] = useState(280)
  const stageRef = useRef<HTMLDivElement>(null)

  const chatting = mode === 'agent'

  // Measured once, at the switch: after that the seam owns the width.
  const switchTo = (next: Mode) => {
    setMode(next)
    const stage = stageRef.current
    if (stage) {
      setAgent(Math.round(stage.clientWidth * SHARE[next]))
    }
  }

  const closes = (collapsed: boolean) =>
    switchTo(collapsed ? 'agent' : 'editor')

  // A fade leans on no edge, so it reads right from either side.
  const chat = (
    <Pane
      key="chat"
      {...FOLD}
      size={agent}
      minSize={Math.min(160, agent)}
      onSizeChange={setAgent}
    >
      <Card label="Agent" size={px(agent)}>
        <Chat />
      </Card>
    </Pane>
  )

  const tree = (
    <Pane
      key="files"
      {...FOLD}
      size={files}
      defaultSize={150}
      minSize={110}
      maxSize={260}
      collapsed={chatting}
      onCollapsedChange={closes}
      onSizeChange={setFiles}
    >
      <Card label="Files" size={px(files, chatting)}>
        <Rows items={FILES} active="panel.tsx" />
      </Card>
    </Pane>
  )

  const workspace = (
    <Panel key="workspace" transition={SWITCH}>
      <Group orientation="vertical">
        <Pane>
          <Editor />
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize output" />
        <Pane
          {...FOLD}
          size={terminal}
          defaultSize={112}
          minSize={56}
          maxSize={160}
          collapsed={chatting}
          onCollapsedChange={closes}
          onSizeChange={setTerminal}
        >
          <Card label="Output" size={px(terminal, chatting)}>
            <Lines lines={OUTPUT} terminal />
          </Card>
        </Pane>
      </Group>
    </Panel>
  )

  const seams = [
    <Separator
      key="seam-a"
      className={SEPARATOR}
      aria-label={chatting ? 'Resize agent' : 'Resize files'}
    />,
    <Separator
      key="seam-b"
      className={SEPARATOR}
      aria-label={chatting ? 'Resize files' : 'Resize agent'}
    />,
  ]

  return (
    <figure className="overflow-hidden border">
      <div className={CONTROLS}>
        <ToggleGroup
          size="sm"
          value={[mode]}
          onValueChange={([next]) => next && switchTo(next as Mode)}
        >
          <ToggleGroupItem value="editor">Editor</ToggleGroupItem>
          <ToggleGroupItem value="agent">Agent</ToggleGroupItem>
        </ToggleGroup>
        <span className="kicker text-muted-foreground/60 ml-auto hidden min-[420px]:block">
          or drag a seam
        </span>
      </div>
      <div className="bg-well h-[290px] p-2.5 min-[900px]:h-[400px]">
        {/* Measured instead of the well, whose padding is not the group. */}
        <div className="h-full" ref={stageRef}>
          <Group orientation="horizontal" layoutDependency={mode}>
            {chatting
              ? [chat, seams[0], workspace, seams[1], tree]
              : [tree, seams[0], workspace, seams[1], chat]}
          </Group>
        </div>
      </div>
    </figure>
  )
}
