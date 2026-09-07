'use client'

import { Group, Panel, Separator } from 'glidepanels/react'
import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'

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
  <div className="card">
    <div className="card-head">
      <span>{label}</span>
      {size ? <span className="badge">{size}</span> : null}
    </div>
    {children}
  </div>
)

const px = (size: number, collapsed?: boolean) =>
  collapsed ? 'collapsed' : `${size}px`

const Rows = ({ active, items }: { active?: string; items: string[] }) => (
  <ul className="rows">
    {items.map((item) => (
      <li key={item} data-active={item === active || undefined}>
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
  <ol className={terminal ? 'lines terminal' : 'lines'}>
    {lines.map((line) => (
      <li key={line}>{line}</li>
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
  <figure className="demo">
    {controls ? <div className="controls">{controls}</div> : null}
    <div className={tall ? 'stage tall' : 'stage'}>{children}</div>
  </figure>
)

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
        {separator ? <Separator aria-label="Resize files" /> : null}
        <Pane>
          <Editor />
        </Pane>
      </Group>
    </Demo>
  )
}

export const HorizontalDemo = () => <Split />

export const SeparatorDemo = () => <Split separator />

export const VerticalDemo = () => {
  const [height, setHeight] = useState(120)

  return (
    <Demo>
      <Group orientation="vertical">
        <Pane>
          <Editor />
        </Pane>
        <Separator aria-label="Resize output" />
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

const FOLDS = {
  fade: {
    animate: { opacity: 1 },
    initial: { opacity: 0 },
    transition: { duration: 0.35 },
  },
  scale: {
    animate: { opacity: 1, scale: 1 },
    initial: { opacity: 0, scale: 0.9 },
  },
  slide: {
    animate: { scale: 1, translateX: '0' },
    initial: { scale: 0.85, translateX: '100%' },
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
            <div className="segmented">
              {Object.keys(FOLDS).map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={name === fold}
                  onClick={() => setFold(name as Fold)}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="push"
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
            style={{ originX: 0 }}
          >
            <Card label="Navigator" size={px(width, collapsed)}>
              <Rows items={SYMBOLS} active="Panel" />
            </Card>
          </Pane>
          <Separator aria-label="Resize navigator" />
          <Pane>
            <Editor />
          </Pane>
        </Group>
      </Demo>
      <pre className="echo">
        {`<Panel${Object.entries(FOLDS[fold])
          .map(([prop, value]) => `\n  ${prop}={${formatProp(value)}}`)
          .join('')}\n/>`}
      </pre>
    </>
  )
}

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
      <p className="prose">{PIN_TEXT}</p>
    </Panel>
  )

  return (
    <Demo
      controls={
        <>
          <button
            type="button"
            aria-pressed={pinned}
            onClick={() => setPinned(!pinned)}
          >
            pin {pinned ? 'on' : 'off'}
          </button>
          <button
            type="button"
            className="push"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </>
      }
    >
      <Group orientation="horizontal">
        {end ? article : sidebar}
        <Separator aria-label="Resize sidebar" />
        {end ? sidebar : article}
      </Group>
    </Demo>
  )
}

export const PinDemo = () => <PinSplit />

export const PinEndDemo = () => <PinSplit end />

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
        <Separator aria-label="Resize files" />
        <Panel>
          <Group orientation="vertical">
            <Pane>
              <Editor />
            </Pane>
            <Separator aria-label="Resize console" />
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
        <Separator aria-label="Resize files" />
        <Panel>
          <Group orientation="vertical">
            <Panel>
              <Group orientation="horizontal">
                <Pane>
                  <Editor />
                </Pane>
                <Separator aria-label="Resize outline" />
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
            <Separator aria-label="Resize terminal" />
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
