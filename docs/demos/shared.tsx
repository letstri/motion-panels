'use client'

import { Panel } from 'motion-panels/react'
import type { ComponentProps, ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

export const CARD = 'flex h-full w-full flex-col overflow-hidden border bg-card'

export const CARD_HEAD =
  'kicker flex h-8 flex-none items-center justify-between gap-2.5 whitespace-nowrap border-b px-2.5 text-muted-foreground'

export const SIZE_BADGE =
  'font-mono text-[10px] normal-case tracking-normal tabular-nums'

const ROW =
  'flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-[3px] text-[12px] text-muted-foreground before:size-1 before:flex-none before:bg-muted-foreground/40 data-active:bg-muted data-active:text-foreground data-active:before:bg-foreground'

const LINE =
  'flex gap-3 whitespace-pre px-3 font-mono text-[12px] text-muted-foreground leading-[1.75]'

const LINE_NUMBER =
  'before:min-w-3.5 before:flex-none before:text-right before:text-muted-foreground/50 before:[counter-increment:line] before:content-[counter(line)]'

export const SEPARATOR =
  "z-10 flex items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 after:bg-muted-foreground/45 after:opacity-0 after:transition after:duration-150 after:content-[''] hover:after:bg-muted-foreground hover:after:opacity-100 focus-visible:after:bg-foreground focus-visible:after:opacity-100 active:after:bg-foreground aria-[orientation=horizontal]:h-3.5 aria-[orientation=vertical]:w-3.5 aria-[orientation=horizontal]:after:h-0.5 aria-[orientation=horizontal]:after:w-[calc(100%-20px)] aria-[orientation=vertical]:after:h-[calc(100%-20px)] aria-[orientation=vertical]:after:w-0.5 data-crossing:after:bg-muted-foreground data-crossing:after:opacity-100 data-resizing:after:bg-foreground data-resizing:after:opacity-100"

export const Pane = ({ style, ...props }: ComponentProps<typeof Panel>) => (
  <Panel style={{ padding: 3, ...style }} {...props} />
)

export const Card = ({
  children,
  label,
  size,
}: {
  children: ReactNode
  label: string
  size?: string
}) => (
  <div className={CARD}>
    <div className={CARD_HEAD}>
      <span>{label}</span>
      {size ? (
        <Badge className={SIZE_BADGE} variant="secondary">
          {size}
        </Badge>
      ) : null}
    </div>
    {children}
  </div>
)

export const px = (size: number, collapsed?: boolean) =>
  collapsed ? 'collapsed' : `${size}px`

export const Rows = ({
  active,
  items,
}: {
  active?: string
  items: string[]
}) => (
  <ul className="list-none overflow-hidden p-2">
    {items.map((item) => (
      <li className={ROW} key={item} data-active={item === active || undefined}>
        {item}
      </li>
    ))}
  </ul>
)

export const Lines = ({
  lines,
  terminal,
}: {
  lines: string[]
  terminal?: boolean
}) => (
  <ol className="list-none overflow-hidden py-2.5 [counter-reset:line]">
    {lines.map((line) => (
      <li className={terminal ? LINE : `${LINE} ${LINE_NUMBER}`} key={line}>
        {line}
      </li>
    ))}
  </ol>
)

export const FILES = ['index.tsx', 'group.tsx', 'panel.tsx', 'separator.tsx']
export const SYMBOLS = ['Group', 'Panel', 'Separator', 'useGroup']

export const SOURCE = [
  'export function Workspace() {',
  '  const [width, setWidth] = useState(240)',
  '',
  '  return (',
  '    <Group orientation="horizontal">',
  '      <Panel size={width} onSizeChange={setWidth} />',
  '      <Separator />',
  '      <Panel pin />',
  '    </Group>',
  '  )',
  '}',
]

export const OUTPUT = [
  '$ pnpm add motion-panels',
  'Packages: +1',
  'done in 1.2s',
]

export const FOLDS = {
  fade: {
    animate: { opacity: 1 },
    initial: { opacity: 0 },
    transition: { duration: 0.35 },
  },
  scale: {
    animate: { scale: 1 },
    initial: { scale: 0.85 },
  },
  flip: {
    animate: { rotateY: 0, transformPerspective: 500 },
    initial: { rotateY: -75, transformPerspective: 500 },
    style: { originX: 1 },
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  snap: {
    transition: { duration: 0 },
  },
  spring: {
    animate: { scale: 1 },
    initial: { scale: 0.9 },
    transition: { bounce: 0.4, duration: 0.7, type: 'spring' },
  },
} as const satisfies Record<string, Partial<ComponentProps<typeof Panel>>>

export const Editor = () => (
  <Card label="workspace.tsx">
    <Lines lines={SOURCE} />
  </Card>
)

export const CONTROLS = 'bg-card flex flex-wrap items-center gap-2 border-b p-2'

export const Demo = ({
  children,
  controls,
  footer,
  tall,
}: {
  children: ReactNode
  controls?: ReactNode
  footer?: ReactNode
  tall?: boolean
}) => (
  <figure className="mt-6 overflow-hidden border">
    {controls ? <div className={CONTROLS}>{controls}</div> : null}
    <div className={`bg-well p-2.5 ${tall ? 'h-[360px]' : 'h-[300px]'}`}>
      {children}
    </div>
    {footer ? <div className="bg-card border-t">{footer}</div> : null}
  </figure>
)
