'use client'

import { Group, Panel, Separator } from 'motion-panels/react'
import { motion, useSpring, useTransform } from 'motion/react'
import type { ReactNode } from 'react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { Pane, SEPARATOR as SEAM } from './shared'

interface View {
  agent: number
  files: number
  id: string
  label: string
  lead?: boolean
  output: number
}

const VIEWS: View[] = [
  { agent: 0, files: 160, id: 'code', label: 'Code', output: 104 },
  { agent: 232, files: 160, id: 'split', label: 'Split', output: 104 },
  {
    agent: 232,
    files: 160,
    id: 'pair',
    label: 'Pair',
    lead: true,
    output: 104,
  },
  { agent: 0, files: 0, id: 'focus', label: 'Focus', lead: true, output: 0 },
]

const DWELL = 3600

const tier = (room: number) => (room < 380 ? 0 : room < 560 ? 1 : 2)

const fit = (view: View, room: number) => ({
  agent: room < 560 ? 0 : Math.min(view.agent, Math.round(room * 0.36)),
  files: room < 380 ? 0 : Math.min(view.files, Math.round(room * 0.26)),
  output: view.output,
})

const SETTLE = 260

const FOLD = { bounce: 0.1, type: 'spring', visualDuration: 0.34 } as const
const TRAVEL = { bounce: 0.16, type: 'spring', visualDuration: 0.42 } as const

const ENTER = { animate: { opacity: 1 }, initial: { opacity: 0 } }

const STAGGER = {
  hidden: {},
  shown: { transition: { delayChildren: 0.08, staggerChildren: 0.045 } },
}

const RISE = {
  hidden: { opacity: 0, y: 6 },
  shown: { opacity: 1, transition: { duration: 0.32, ease: 'easeOut' }, y: 0 },
} as const

const CALM = '(prefers-reduced-motion: reduce)'

const useStill = () =>
  useSyncExternalStore(
    (wake) => {
      const query = matchMedia(CALM)
      query.addEventListener('change', wake)
      return () => query.removeEventListener('change', wake)
    },
    () => matchMedia(CALM).matches,
    () => false
  )

const List = ({ children }: { children: ReactNode }) => (
  <motion.ul
    animate="shown"
    className="list-none"
    initial="hidden"
    variants={STAGGER}
  >
    {children}
  </motion.ul>
)

const Slab = ({
  badge,
  bleed,
  children,
  label,
}: {
  badge?: ReactNode
  bleed?: boolean
  children: ReactNode
  label: string
}) => (
  <div className="bg-card flex h-full w-full flex-col overflow-hidden border">
    <div className="kicker text-muted-foreground/70 flex h-8 flex-none items-center justify-between gap-2 border-b px-2.5 whitespace-nowrap">
      <span>{label}</span>
      {badge}
    </div>
    <div className="relative min-h-0 flex-1 overflow-hidden">
      {children}
      <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent" />
      {bleed ? (
        <div className="from-card pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent" />
      ) : null}
    </div>
  </div>
)

const Ticker = ({ folded, value }: { folded: boolean; value: number }) => {
  const spring = useSpring(value, { damping: 30, stiffness: 320 })
  const text = useTransform(spring, (size) => `${Math.round(size)}px`)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <span className="text-muted-foreground/50 font-mono text-[10px] tracking-normal tabular-nums">
      {folded ? 'folded' : <motion.span>{text}</motion.span>}
    </span>
  )
}

const TREE = [
  { name: 'src', nest: false },
  { name: 'group.tsx', nest: true },
  { name: 'panel.tsx', nest: true, open: true },
  { name: 'separator.tsx', nest: true },
  { name: 'index.ts', nest: false },
]

const Files = () => (
  <div className="p-2">
    <List>
      {TREE.map(({ name, nest, open }) => (
        <motion.li
          className={`flex items-center gap-2 overflow-hidden px-2 py-[3px] text-[12px] whitespace-nowrap ${
            open ? 'bg-muted text-foreground' : 'text-muted-foreground'
          } ${nest ? 'pl-4' : ''}`}
          key={name}
          variants={RISE}
        >
          <span
            className={`size-1 flex-none ${
              open ? 'bg-foreground' : 'bg-muted-foreground/40'
            }`}
          />
          {name}
        </motion.li>
      ))}
    </List>
  </div>
)

const CODE = [
  'export function Workspace() {',
  '  const [w, setW] = useState(288)',
  '',
  '  return (',
  '    <Group>',
  '      <Panel size={w}>',
  '        <Files />',
  '      </Panel>',
  '      <Separator />',
  '      <Panel pin>',
  '        <Editor />',
  '      </Panel>',
  '    </Group>',
  '  )',
  '}',
]

const CARET = 5

const KEYWORD = /^(?:export|function|const|return|import|from)$/u

const tone = (token: string) => {
  if (KEYWORD.test(token)) {
    return 'text-foreground'
  }
  if (/^["']/u.test(token)) {
    return 'text-muted-foreground'
  }
  if (/^[A-Z]/u.test(token)) {
    return 'text-foreground/70'
  }
  if (/^[a-z]/u.test(token)) {
    return 'text-muted-foreground/85'
  }
  return 'text-muted-foreground/45'
}

const Editor = () => (
  <div className="py-2.5">
    {CODE.map((line, row) => (
      <div
        className={`flex gap-3 px-3 font-mono text-[12px] leading-[1.75] whitespace-pre ${
          row === CARET ? 'bg-foreground/[0.045]' : ''
        }`}
        key={`row-${row}`}
      >
        <span className="text-muted-foreground/35 w-3.5 flex-none text-right tabular-nums">
          {row + 1}
        </span>
        <span>
          {line.split(/(?<gap>[\s<>{}()[\]=/,]+)/u).map((token, index) => (
            <span className={tone(token)} key={`${row}-${index}`}>
              {token}
            </span>
          ))}
          {row === CARET ? (
            <motion.span
              animate={{ opacity: [1, 1, 0, 0] }}
              className="bg-foreground/70 ml-px inline-block h-[13px] w-[6px] translate-y-[2px]"
              transition={{
                duration: 1.1,
                ease: 'linear',
                repeat: Number.POSITIVE_INFINITY,
                times: [0, 0.5, 0.5, 1],
              }}
            />
          ) : null}
        </span>
      </div>
    ))}
  </div>
)

const OUTPUT = ['$ pnpm add motion-panels', 'Packages: +1', 'done in 1.2s']

const Output = () => (
  <div className="py-2">
    <List>
      {OUTPUT.map((line, row) => (
        <motion.li
          className="text-muted-foreground flex px-3 font-mono text-[12px] leading-[1.7] whitespace-pre"
          key={line}
          variants={RISE}
        >
          {row === 0 ? (
            <span className="text-foreground/80">{line}</span>
          ) : (
            line
          )}
        </motion.li>
      ))}
    </List>
  </div>
)

const TURNS = [
  { from: 'you', text: 'Make the file tree collapsible.' },
  { from: 'agent', text: 'Added onCollapsedChange to the Files panel.' },
  { from: 'agent', text: 'Enter on its separator toggles it now.' },
]

const Dots = () => (
  <div className="flex gap-1 px-2.5 pt-1">
    {[0, 1, 2].map((dot) => (
      <motion.span
        animate={{ opacity: [0.25, 1, 0.25] }}
        className="bg-muted-foreground size-1 rounded-full"
        key={dot}
        transition={{
          delay: dot * 0.16,
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
        }}
      />
    ))}
  </div>
)

const Agent = () => (
  <div className="flex flex-col gap-3 p-2.5">
    <List>
      {TURNS.map(({ from, text }) => (
        <motion.li className="mb-3 last:mb-0" key={text} variants={RISE}>
          <span className="kicker text-muted-foreground/50">{from}</span>
          <p
            className={`mt-1 text-[12px] leading-[1.55] ${
              from === 'agent' ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            {text}
          </p>
        </motion.li>
      ))}
    </List>
    <Dots />
  </div>
)

export const HeroDemo = () => {
  const [active, setActive] = useState('split')
  const [lead, setLead] = useState(false)
  const [fold, setFold] = useState({
    agent: false,
    files: false,
    output: false,
  })
  const [size, setSize] = useState({ agent: 232, files: 160, output: 104 })
  const [held, setHeld] = useState(false)
  const [hover, setHover] = useState(false)
  const still = useStill()
  const shown = useRef<View>(VIEWS[1])
  const beat = useRef(0)
  const roomRef = useRef(0)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => () => clearTimeout(beat.current), [])

  const apply = useCallback((view: View) => {
    const last = shown.current
    const room = fit(view, roomRef.current)
    shown.current = view
    setActive(view.id)
    setFold({
      agent: room.agent === 0,
      files: room.files === 0,
      output: room.output === 0,
    })
    setSize((kept) => ({
      agent: room.agent || kept.agent,
      files: room.files || kept.files,
      output: room.output || kept.output,
    }))

    if (Boolean(view.lead) === Boolean(last.lead)) {
      return
    }
    const folding = (['agent', 'files', 'output'] as const).some(
      (key) => (room[key] === 0) !== (fit(last, roomRef.current)[key] === 0)
    )
    clearTimeout(beat.current)
    if (folding) {
      beat.current = window.setTimeout(
        () => setLead(Boolean(view.lead)),
        SETTLE
      )
    } else {
      setLead(Boolean(view.lead))
    }
  }, [])

  useEffect(() => {
    const watch = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0
      const was = roomRef.current
      roomRef.current = width
      if (!held && (was === 0 || tier(was) !== tier(width))) {
        apply(shown.current)
      }
    })
    if (stage.current) {
      watch.observe(stage.current)
    }
    return () => watch.disconnect()
  }, [apply, held])

  const running = !(held || hover || still)

  useEffect(() => {
    const step = running
      ? window.setTimeout(() => {
          const at = VIEWS.findIndex((view) => view.id === active)
          apply(VIEWS[(at + 1) % VIEWS.length])
        }, DWELL)
      : 0
    return () => clearTimeout(step)
  }, [active, apply, running])

  const grab = (key: keyof typeof size) => ({
    onCollapsedChange: (collapsed: boolean) => {
      setHeld(true)
      setFold((last) => ({ ...last, [key]: collapsed }))
    },
    onSizeChange: (next: number) => {
      setHeld(true)
      setSize((last) => ({ ...last, [key]: next }))
    },
  })

  const files = (
    <Pane
      key="files"
      {...ENTER}
      collapsed={fold.files}
      maxSize={260}
      minSize={112}
      size={size.files}
      transition={FOLD}
      {...grab('files')}
    >
      <Slab
        badge={<Ticker folded={fold.files} value={size.files} />}
        label="Files"
      >
        <Files />
      </Slab>
    </Pane>
  )

  const agent = (
    <Pane
      key="agent"
      {...ENTER}
      collapsed={fold.agent}
      maxSize={340}
      minSize={168}
      size={size.agent}
      transition={FOLD}
      {...grab('agent')}
    >
      <Slab
        badge={<Ticker folded={fold.agent} value={size.agent} />}
        label="Agent"
      >
        <Agent />
      </Slab>
    </Pane>
  )

  const workspace = (
    <Panel key="workspace">
      <Group orientation="vertical" transition={TRAVEL}>
        <Pane>
          <Slab bleed label="workspace.tsx">
            <Editor />
          </Slab>
        </Pane>
        <Separator aria-label="Resize output" className={SEAM} />
        <Pane
          {...ENTER}
          collapsed={fold.output}
          maxSize={168}
          minSize={56}
          size={size.output}
          transition={FOLD}
          {...grab('output')}
        >
          <Slab
            badge={<Ticker folded={fold.output} value={size.output} />}
            label="Output"
          >
            <Output />
          </Slab>
        </Pane>
      </Group>
    </Panel>
  )

  const seams = [
    <Separator
      aria-label={lead ? 'Resize agent' : 'Resize files'}
      className={SEAM}
      key="seam-a"
    />,
    <Separator
      aria-label={lead ? 'Resize files' : 'Resize agent'}
      className={SEAM}
      key="seam-b"
    />,
  ]

  return (
    <figure
      className="overflow-hidden border"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className="bg-card flex flex-wrap items-center gap-2 border-b p-2">
        <div className="flex items-center gap-0.5">
          {VIEWS.map((view) => (
            <button
              className={`relative px-2.5 py-1.5 text-[12px] transition-colors ${
                view.id === active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={view.id === active}
              key={view.id}
              onClick={() => {
                setHeld(true)
                apply(view)
              }}
              type="button"
            >
              {view.id === active ? (
                <motion.span
                  className="bg-muted absolute inset-0 -z-10"
                  layoutId="hero-view"
                  transition={{
                    bounce: 0.2,
                    type: 'spring',
                    visualDuration: 0.3,
                  }}
                />
              ) : null}
              {view.label}
              {view.id === active && running ? (
                <motion.span
                  animate={{ scaleX: 1 }}
                  className="bg-foreground/45 absolute inset-x-0 bottom-0 h-px origin-left"
                  initial={{ scaleX: 0 }}
                  key={active}
                  transition={{ duration: DWELL / 1000, ease: 'linear' }}
                />
              ) : null}
            </button>
          ))}
        </div>
        <button
          aria-label={held ? 'Resume the reel' : 'Stop the reel'}
          className="kicker text-muted-foreground/50 hover:text-foreground ml-auto hidden items-center gap-1.5 transition-colors min-[420px]:flex"
          onClick={() => setHeld((stopped) => !stopped)}
          type="button"
        >
          <motion.span
            animate={{ opacity: running ? [1, 0.35, 1] : 1 }}
            className={`size-1.5 rounded-full ${
              running ? 'bg-foreground/70' : 'bg-muted-foreground/40'
            }`}
            transition={{
              duration: 2.4,
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
          {held ? 'resume' : hover ? 'drag a seam' : running ? 'auto' : 'still'}
        </button>
      </div>
      <div className="bg-well relative h-[300px] p-2.5 min-[900px]:h-[420px]">
        <div className="from-foreground/[0.05] pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent" />
        <div className="relative h-full" ref={stage}>
          <Group orientation="horizontal" transition={TRAVEL}>
            {lead
              ? [agent, seams[0], workspace, seams[1], files]
              : [files, seams[0], workspace, seams[1], agent]}
          </Group>
        </div>
      </div>
    </figure>
  )
}
