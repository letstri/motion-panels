'use client'

import { Group, Panel, Separator } from 'glidepanels/react'
import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'

// #region helpers
const STAGE = 'h-[300px] rounded-[14px] border border-line bg-sunken p-2.5'

const CARD =
  'flex h-full w-full flex-col overflow-hidden rounded-[9px] border border-line bg-surface'

const CARD_HEAD =
  'flex h-8 flex-none items-center justify-between gap-2.5 whitespace-nowrap border-line border-b px-2.5 text-[12px] text-muted'

const BADGE =
  'rounded-[5px] bg-sunken px-1.5 py-px font-mono text-[11px] text-text tabular-nums'

const ROW =
  'flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-md px-2 py-[3px] text-[12px] text-muted before:size-1.5 before:flex-none before:rounded-sm before:bg-line-strong data-active:bg-sunken data-active:text-text'

const LINE =
  'flex gap-3 whitespace-pre px-3 font-mono text-[12px] text-muted leading-[1.75]'

const LINE_NUMBER =
  'before:min-w-3.5 before:flex-none before:text-right before:text-line-strong before:[counter-increment:line] before:content-[counter(line)]'

const BUTTON =
  'cursor-pointer rounded-[7px] border border-transparent px-2.5 py-[3px] text-[13px] text-muted hover:text-text aria-pressed:bg-surface aria-pressed:text-text aria-pressed:shadow-pressed'

const CONTROL = `${BUTTON} border-line bg-surface`

// The package renders its own edge grip inside a panel that has no Separator;
// that one is a hit area and stays unstyled, which is why the line lives here
// rather than on [role='separator'] globally.
const SEPARATOR =
  "z-10 flex items-center justify-center outline-none after:rounded-full after:bg-line-strong after:transition-colors after:duration-150 after:content-[''] hover:after:bg-muted focus-visible:after:bg-muted active:after:bg-accent aria-[orientation=vertical]:-mx-[7px] aria-[orientation=horizontal]:-my-[7px] aria-[orientation=horizontal]:h-3.5 aria-[orientation=vertical]:w-3.5 aria-[orientation=horizontal]:after:h-0.5 aria-[orientation=horizontal]:after:w-[calc(100%-20px)] aria-[orientation=vertical]:after:h-[calc(100%-20px)] aria-[orientation=vertical]:after:w-0.5 data-crossing:after:bg-muted data-resizing:after:bg-accent"

const Pane = ({ style, ...props }: ComponentProps<typeof Panel>) => (
  <Panel style={{ padding: 3, ...style }} {...props} />
)

const Card = ({
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
      {size ? <span className={BADGE}>{size}</span> : null}
    </div>
    {children}
  </div>
)

const px = (size: number, collapsed?: boolean) =>
  collapsed ? 'collapsed' : `${size}px`

const Rows = ({ active, items }: { active?: string; items: string[] }) => (
  <ul className="list-none overflow-hidden p-2">
    {items.map((item) => (
      <li className={ROW} key={item} data-active={item === active || undefined}>
        {item}
      </li>
    ))}
  </ul>
)

const Lines = ({
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

const FILES = ['index.tsx', 'group.tsx', 'panel.tsx', 'separator.tsx']
const SYMBOLS = ['Group', 'Panel', 'Separator', 'useGroup']

const SOURCE = [
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

const OUTPUT = ['$ pnpm add glidepanels', 'Packages: +1', 'done in 1.2s']

const Editor = () => (
  <Card label="workspace.tsx">
    <Lines lines={SOURCE} />
  </Card>
)

const Demo = ({
  children,
  controls,
  tall,
}: {
  children: ReactNode
  controls?: ReactNode
  tall?: boolean
}) => (
  <figure className="mt-5 flex flex-col gap-2.5">
    {controls ? (
      <div className="flex items-center gap-2">{controls}</div>
    ) : null}
    <div className={tall ? `${STAGE} h-[360px]` : STAGE}>{children}</div>
  </figure>
)
// #endregion

// #region split
const Split = ({ separator }: { separator?: boolean }) => {
  const [width, setWidth] = useState(240)

  return (
    <Demo>
      <Group orientation="horizontal">
        <Pane
          size={width}
          defaultSize={240}
          minSize={160}
          maxSize={420}
          onSizeChange={setWidth}
        >
          <Card label="Files" size={px(width)}>
            <Rows items={FILES} active="panel.tsx" />
          </Card>
        </Pane>
        {separator ? (
          <Separator className={SEPARATOR} aria-label="Resize files" />
        ) : null}
        <Pane>
          <Editor />
        </Pane>
      </Group>
    </Demo>
  )
}

export const HorizontalDemo = () => <Split />

export const SeparatorDemo = () => <Split separator />
// #endregion

// #region orientation
export const VerticalDemo = () => {
  const [height, setHeight] = useState(120)

  return (
    <Demo>
      <Group orientation="vertical">
        <Pane>
          <Editor />
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize output" />
        <Pane
          size={height}
          defaultSize={120}
          minSize={80}
          maxSize={220}
          onSizeChange={setHeight}
        >
          <Card label="Output" size={px(height)}>
            <Lines lines={OUTPUT} terminal />
          </Card>
        </Pane>
      </Group>
    </Demo>
  )
}
// #endregion

// #region collapsing
const FOLDS = {
  fade: {
    animate: { opacity: 1 },
    initial: { opacity: 0 },
    transition: { duration: 0.35 },
  },
  scale: {
    animate: { scale: 1 },
    initial: { scale: 0.85 },
  },
  slide: {
    animate: { translateX: '0%' },
    initial: { translateX: '-100%' },
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

type Fold = keyof typeof FOLDS

const formatProp = (value: object) =>
  JSON.stringify(value)
    .replaceAll(/"(?<key>[^"]+)":/gu, '$<key>: ')
    .replaceAll('"', "'")
    .replaceAll(',', ', ')
    .replace('{', '{ ')
    .replace(/\}$/u, ' }')

export const FoldDemo = () => {
  const [width, setWidth] = useState(260)
  const [collapsed, setCollapsed] = useState(false)
  const [fold, setFold] = useState<Fold>('slide')

  return (
    <>
      <Demo
        controls={
          <>
            <div className="border-line bg-sunken flex gap-0.5 rounded-[9px] border p-0.5">
              {Object.keys(FOLDS).map((name) => (
                <button
                  key={name}
                  type="button"
                  className={BUTTON}
                  aria-pressed={name === fold}
                  onClick={() => setFold(name as Fold)}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`${CONTROL} ml-auto`}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          </>
        }
      >
        <Group orientation="horizontal">
          <Pane
            {...FOLDS[fold]}
            size={width}
            defaultSize={260}
            minSize={180}
            maxSize={400}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            onSizeChange={setWidth}
            style={{ originX: 1 }}
          >
            <Card label="Navigator" size={px(width, collapsed)}>
              <Rows items={SYMBOLS} active="Panel" />
            </Card>
          </Pane>
          <Separator className={SEPARATOR} aria-label="Resize navigator" />
          <Pane>
            <Editor />
          </Pane>
        </Group>
      </Demo>
      <pre className="border-line bg-sunken text-muted m-0 overflow-x-auto rounded-[9px] border px-3.5 py-3 font-mono text-[13px]">
        {`<Panel${Object.entries(FOLDS[fold])
          .map(([prop, value]) => `\n  ${prop}={${formatProp(value)}}`)
          .join('')}\n/>`}
      </pre>
    </>
  )
}
// #endregion

// #region pinning
const PIN_TEXT =
  'Pinning holds this text at the width the panel ends the fold with, so the line breaks are measured once instead of on every frame. Turn the pin off and watch the words rewrap the whole way through. Real content pays that cost on every frame too: a code editor relaying out, a virtualised table remeasuring its rows.'

const PinSplit = ({ end }: { end?: boolean }) => {
  const [width, setWidth] = useState(240)
  const [collapsed, setCollapsed] = useState(false)
  const [pinned, setPinned] = useState(true)

  const sidebar = (
    <Pane
      size={width}
      defaultSize={240}
      minSize={160}
      maxSize={420}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      onSizeChange={setWidth}
    >
      <Card label="Sidebar" size={px(width, collapsed)}>
        <Rows items={FILES} active="group.tsx" />
      </Card>
    </Pane>
  )
  const article = (
    <Panel pin={pinned}>
      <p className="text-muted overflow-hidden px-4 py-3 text-[13px] leading-[1.7]">
        {PIN_TEXT}
      </p>
    </Panel>
  )

  return (
    <Demo
      controls={
        <>
          <button
            type="button"
            className={CONTROL}
            aria-pressed={pinned}
            onClick={() => setPinned(!pinned)}
          >
            pin {pinned ? 'on' : 'off'}
          </button>
          <button
            type="button"
            className={`${CONTROL} ml-auto`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </>
      }
    >
      <Group orientation="horizontal">
        {end ? article : sidebar}
        <Separator className={SEPARATOR} aria-label="Resize sidebar" />
        {end ? sidebar : article}
      </Group>
    </Demo>
  )
}

export const PinDemo = () => <PinSplit />

export const PinEndDemo = () => <PinSplit end />
// #endregion

// #region nesting
export const NestedDemo = () => {
  const [sidebar, setSidebar] = useState(200)
  const [terminal, setTerminal] = useState(100)

  return (
    <Demo>
      <Group orientation="horizontal">
        <Pane
          size={sidebar}
          defaultSize={200}
          minSize={140}
          maxSize={360}
          onSizeChange={setSidebar}
        >
          <Card label="Files" size={px(sidebar)}>
            <Rows items={FILES} active="panel.tsx" />
          </Card>
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize files" />
        <Panel>
          <Group orientation="vertical">
            <Pane>
              <Editor />
            </Pane>
            <Separator className={SEPARATOR} aria-label="Resize console" />
            <Pane
              size={terminal}
              defaultSize={100}
              minSize={60}
              maxSize={180}
              onSizeChange={setTerminal}
            >
              <Card label="Console" size={px(terminal)}>
                <Lines lines={OUTPUT} terminal />
              </Card>
            </Pane>
          </Group>
        </Panel>
      </Group>
    </Demo>
  )
}
// #endregion

// #region both-edges
export const BothEdgesDemo = () => {
  const [left, setLeft] = useState(180)
  const [right, setRight] = useState(180)

  return (
    <Demo>
      <Group orientation="horizontal">
        <Pane
          size={left}
          defaultSize={180}
          minSize={120}
          maxSize={300}
          onSizeChange={setLeft}
        >
          <Card label="Files" size={px(left)}>
            <Rows items={FILES} active="index.tsx" />
          </Card>
        </Pane>
        <Pane>
          <Editor />
        </Pane>
        <Pane
          size={right}
          defaultSize={180}
          minSize={120}
          maxSize={300}
          onSizeChange={setRight}
        >
          <Card label="Outline" size={px(right)}>
            <Rows items={SYMBOLS} />
          </Card>
        </Pane>
      </Group>
    </Demo>
  )
}
// #endregion

// #region intersections
export const DeepNestDemo = () => {
  const [files, setFiles] = useState(140)
  const [outline, setOutline] = useState(120)
  const [terminal, setTerminal] = useState(90)

  return (
    <Demo tall>
      <Group orientation="horizontal">
        <Pane
          size={files}
          defaultSize={140}
          minSize={100}
          maxSize={240}
          onSizeChange={setFiles}
        >
          <Card label="Files" size={px(files)}>
            <Rows items={FILES} active="separator.tsx" />
          </Card>
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize files" />
        <Panel>
          <Group orientation="vertical">
            <Panel>
              <Group orientation="horizontal">
                <Pane>
                  <Editor />
                </Pane>
                <Separator className={SEPARATOR} aria-label="Resize outline" />
                <Pane
                  size={outline}
                  defaultSize={120}
                  minSize={80}
                  maxSize={220}
                  onSizeChange={setOutline}
                >
                  <Card label="Outline" size={px(outline)}>
                    <Rows items={SYMBOLS} active="Separator" />
                  </Card>
                </Pane>
              </Group>
            </Panel>
            <Separator className={SEPARATOR} aria-label="Resize terminal" />
            <Pane
              size={terminal}
              defaultSize={90}
              minSize={60}
              maxSize={160}
              onSizeChange={setTerminal}
            >
              <Card label="Terminal" size={px(terminal)}>
                <Lines lines={OUTPUT} terminal />
              </Card>
            </Pane>
          </Group>
        </Panel>
      </Group>
    </Demo>
  )
}

// #endregion
