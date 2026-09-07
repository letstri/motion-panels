import type { ReactNode } from 'react'

import { Code } from './code'
import { CoreDemo } from './core-demo'
import {
  BothEdgesDemo,
  DeepNestDemo,
  FoldDemo,
  HorizontalDemo,
  NestedDemo,
  PinDemo,
  PinEndDemo,
  SeparatorDemo,
  VerticalDemo,
} from './demos'
import { Source } from './source-view'

const SECTIONS = [
  { id: 'install', title: 'Install' },
  { id: 'quick-start', title: 'Quick start' },
  { id: 'separator', title: 'Separator' },
  { id: 'orientation', title: 'Orientation' },
  { id: 'collapsing', title: 'Collapsing and folds' },
  { id: 'pinning', title: 'Pinning' },
  { id: 'nesting', title: 'Nesting and intersections' },
  { id: 'both-edges', title: 'Panels on both edges' },
  { id: 'core', title: 'Core, without React' },
  { id: 'styling', title: 'Styling' },
  { id: 'api', title: 'API' },
]

const Section = ({
  children,
  id,
  lead,
  title,
}: {
  children: ReactNode
  id: string
  lead: string
  title: string
}) => (
  <section id={id}>
    <h2>{title}</h2>
    <p>{lead}</p>
    {children}
  </section>
)

const API: {
  name: string
  note?: string
  props: [string, string, string][]
}[] = [
  {
    name: 'Group',
    props: [
      [
        'orientation',
        `'horizontal' | 'vertical'`,
        'Axis the panels split on. Groups nest.',
      ],
    ],
  },
  {
    name: 'Panel',
    props: [
      [
        'size',
        'number',
        'Current size in pixels. Omit it and the panel fills what is left.',
      ],
      [
        'onSizeChange',
        '(size: number) => void',
        'Called with the new size as a drag or key press lands.',
      ],
      [
        'defaultSize',
        'number',
        'Size a double-click on the separator resets to.',
      ],
      [
        'minSize / maxSize',
        'number',
        'Drag and keyboard bounds. Max defaults to the group extent.',
      ],
      [
        'collapsed',
        'boolean',
        'Folds the panel to zero. Dragging below half of minSize sets it too.',
      ],
      [
        'onCollapsedChange',
        '(collapsed: boolean) => void',
        'Required for drag-to-collapse and Enter-to-toggle.',
      ],
      [
        'transition',
        'Transition',
        'Motion transition for the fold. Defaults to a 250ms ease.',
      ],
      [
        'initial / animate / exit',
        'motion props',
        'Applied to the content while the panel folds.',
      ],
      [
        'pin',
        'boolean',
        'Filling panels only. Lays the content out once per fold instead of once per frame.',
      ],
    ],
  },
  {
    name: 'Separator',
    note: 'No props of its own. Optional: rendered between two panels it resizes the sized one, sits over its edge without taking flow space, and puts the panel size on aria-valuenow.',
    props: [],
  },
]

const CORE_API: [string, string, string][] = [
  [
    'createPanelGroup',
    '(motion, orientation?) => PanelGroup',
    'The shared registry: axes, the filling panel motion values, the sized panels by side. motion is { animate, motionValue }.',
  ],
  [
    'createPanel',
    '(group, options) => PanelController',
    'One panel state machine: bounds, drag, keyboard, folds, collapse.',
  ],
  [
    'controller.attach',
    '(element) => () => void',
    'Reads the panel place in the group and registers it. Returns the detach.',
  ],
  [
    'controller.sync',
    '(options) => void',
    'Feeds new options in. Changing the target starts a fold.',
  ],
  [
    'controller.motion',
    '{ content, size }',
    'MotionValues for the panel and its content. Bind size to width or height.',
  ],
  [
    'controller.state',
    '{ bare, dragging, end, folding }',
    'Read it through subscribe. A frozen object, replaced only when it changes.',
  ],
  [
    'controller.drag',
    '{ start, move, end, cancel }',
    'Pointer drag, in the units your gesture layer reports.',
  ],
  [
    'controller.resizeByKey',
    '(event) => void',
    'Arrows, Shift, PageUp / PageDown, Home / End, Enter. Takes any KeyboardEvent.',
  ],
  [
    'grips',
    'registry',
    'Rect-cached hit testing behind crossings: register, at, mark, partners.',
  ],
]

const DocsPage = () => (
  <div className="layout">
    <nav className="toc">
      <strong>glidepanels</strong>
      <ol>
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.title}</a>
          </li>
        ))}
      </ol>
    </nav>
    <main>
      <header>
        <h1>Resizable panels that glide</h1>
        <p className="tagline">
          A framework-agnostic core with a React adapter on top. Unstyled,
          animated with motion, no third-party layout library. Separators are
          optional — a sized panel drags by its own edge. Every demo below runs
          the published package; the only styling is the CSS on this page.
        </p>
      </header>

      <Section
        id="install"
        title="Install"
        lead="Two entry points. glidepanels is the resizing engine and depends on nothing but motion; glidepanels/react is the components. React is an optional peer — take the core alone and the React types never load."
      >
        <Code lang="sh" code="pnpm add glidepanels motion react" />
        <Code
          code={`
import { createPanel, createPanelGroup } from 'glidepanels'
//       ^?
import { Group, Panel, Separator } from 'glidepanels/react'
`}
        />
      </Section>

      <Section
        id="quick-start"
        title="Quick start"
        lead="A group is a flex container. A panel with a size holds it; a panel without one fills what is left. That is the whole layout — no separator here: a sized panel is draggable by the edge facing the filling panel, so grab the seam below and pull. Hover any identifier in a snippet to read its real type."
      >
        <HorizontalDemo />
        <Code
          code={`
import { Group, Panel } from 'glidepanels/react'
import { useState } from 'react'

export function Layout() {
  const [width, setWidth] = useState(240)
  //     ^?

  return (
    <Group orientation="horizontal">
      <Panel
        size={width}
        defaultSize={240}
        minSize={160}
        maxSize={420}
        onSizeChange={setWidth}
      >
        <nav>Files</nav>
      </Panel>
      <Panel>
        <main>Editor</main>
      </Panel>
    </Group>
  )
}
`}
        />
        <Source
          blocks={[
            { file: 'demos.tsx', region: 'split' },
            { file: 'demos.tsx', region: 'helpers' },
            { file: 'globals.css', region: 'demo-panes', lang: 'css' },
          ]}
        />
      </Section>

      <Section
        id="separator"
        title="Separator"
        lead="Drop a Separator between two panels and the same split gains a visible grip, keyboard control and double-click reset. It finds the sized panel next to it on its own, resizes that one, and sits over its edge without taking space in the flow. It is a focusable [role='separator'] carrying the panel size on aria-valuenow, so it reads and drives from the keyboard with nothing extra."
      >
        <SeparatorDemo />
        <table>
          <tbody>
            {[
              ['Arrows', 'Grow or shrink by 10px, along the group axis'],
              ['Shift + arrows', 'The same, by 50px'],
              ['Home / End', 'Jump to minSize or maxSize'],
              ['Enter', 'Toggle collapsed (needs onCollapsedChange)'],
              ['Double-click', 'Reset to defaultSize'],
            ].map(([key, effect]) => (
              <tr key={key}>
                <td>
                  <code>{key}</code>
                </td>
                <td>{effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Code
          code={`
import { Group, Panel, Separator } from 'glidepanels/react'

export function Layout() {
  return (
    <Group>
      <Panel size={240} defaultSize={240} minSize={160} maxSize={420}>
        <nav>Files</nav>
      </Panel>
      <Separator />
      <Panel>
        <main>Editor</main>
      </Panel>
    </Group>
  )
}
`}
        />
        <Source
          blocks={[
            { file: 'demos.tsx', region: 'split' },
            { file: 'globals.css', region: 'separators', lang: 'css' },
          ]}
          note="Pane, Card, Rows and Demo are the shared wrappers, listed in full under Quick start."
        />
      </Section>

      <Section
        id="orientation"
        title="Orientation"
        lead="The same split on the other axis. Nothing about the panel or the separator changes — the group decides the axis, the cursor, the separator orientation and which arrow keys grow it."
      >
        <VerticalDemo />
        <Code
          code={`
import { Group, Panel, Separator } from 'glidepanels/react'
import { useState } from 'react'

export function Output() {
  const [height, setHeight] = useState(120)

  return (
    <Group orientation="vertical">
      <Panel>Editor</Panel>
      <Separator />
      <Panel size={height} minSize={80} maxSize={220} onSizeChange={setHeight}>
        <pre>Output</pre>
      </Panel>
    </Group>
  )
}
`}
        />
        <Source
          blocks={[{ file: 'demos.tsx', region: 'orientation' }]}
          note="Pane, Card, Rows and Demo are the shared wrappers, listed in full under Quick start."
        />
      </Section>

      <Section
        id="collapsing"
        title="Collapsing and folds"
        lead="collapsed folds a panel to zero, and its content animates with whatever motion props the panel carries — so the fold is yours to design. Pick a preset and toggle. The content is anchored to the edge facing the filling panel, so a slide leans into the fold and originX pins a scale to that same edge. Passing onCollapsedChange also turns on drag-below-half-the-minimum and Enter on the separator."
      >
        <FoldDemo />
        <Code
          code={`
import { Group, Panel, Separator } from 'glidepanels/react'
import { useState } from 'react'

export function Navigator() {
  const [width, setWidth] = useState(260)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Group>
      <Panel
        size={width}
        minSize={180}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onSizeChange={setWidth}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ bounce: 0.4, duration: 0.7, type: 'spring' }}
        style={{ originX: 1 }}
      >
        <nav>Navigator</nav>
      </Panel>
      <Separator />
      <Panel>Content</Panel>
    </Group>
  )
}
`}
        />
        <Source
          blocks={[
            { file: 'demos.tsx', region: 'collapsing' },
            { file: 'globals.css', region: 'demo-chrome', lang: 'css' },
          ]}
          note="Pane, Card, Rows and Demo are the shared wrappers, listed in full under Quick start."
        />
      </Section>

      <Section
        id="pinning"
        title="Pinning"
        lead="A filling panel reflows its content on every frame of a fold. A pinned one sizes the content once, up front, and anchors it to the edge that is not moving — so the content holds still and the fold slides the panel edge across it. Toggle the pin off and watch the paragraph rewrap the whole way through."
      >
        <PinDemo />
        <p className="note">
          Pin content that bleeds to its own edges: an editor, a document, a
          table. A block with its own border or rounded corners shows that edge
          jumping instead, which is why the paragraph here has no frame of its
          own.
        </p>
        <p className="note">
          The anchor belongs to the fold, not to the left edge. Put the sized
          panel after the filling one and the pinned content holds to the start
          edge instead, so the same collapse reads the same way from the other
          side.
        </p>
        <PinEndDemo />
        <Code
          code={`
import { Group, Panel, Separator } from 'glidepanels/react'
import { useState } from 'react'

export function Workspace() {
  const [width, setWidth] = useState(240)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Group>
      <Panel
        size={width}
        minSize={160}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onSizeChange={setWidth}
      >
        <nav>Sidebar</nav>
      </Panel>
      <Separator />
      <Panel pin>
        <article>Text that would otherwise rewrap on every frame</article>
      </Panel>
    </Group>
  )
}
`}
        />
        <Source
          blocks={[{ file: 'demos.tsx', region: 'pinning' }]}
          note="Pane, Card, Rows and Demo are the shared wrappers, listed in full under Quick start."
        />
      </Section>

      <Section
        id="nesting"
        title="Nesting and intersections"
        lead="Groups nest: here a vertical split lives inside the filling panel of a horizontal one. Where the two seams meet, press near the crossing and both separators follow the pointer — the cursor turns to move and each one resizes its own panel. Nothing to add: any separator whose grip reaches the pointer joins the drag."
      >
        <NestedDemo />
        <Code
          code={`
import { Group, Panel, Separator } from 'glidepanels/react'
import { useState } from 'react'

export function Ide() {
  const [sidebar, setSidebar] = useState(200)
  const [terminal, setTerminal] = useState(100)

  return (
    <Group>
      <Panel size={sidebar} minSize={140} onSizeChange={setSidebar}>
        <nav>Files</nav>
      </Panel>
      <Separator />
      <Panel>
        <Group orientation="vertical">
          <Panel>Editor</Panel>
          <Separator />
          <Panel size={terminal} minSize={60} onSizeChange={setTerminal}>
            <pre>Console</pre>
          </Panel>
        </Group>
      </Panel>
    </Group>
  )
}
`}
        />
        <p className="note">
          Depth is not limited. Below, a horizontal split lives in the top panel
          of a vertical split, which lives in the filling panel of the outer
          row. Both crossings resize both axes: files with terminal at the left
          end of the terminal seam, outline with terminal at its right end — two
          levels apart, and neither knows about the other.
        </p>
        <DeepNestDemo />
        <Code
          code={`
import { Group, Panel, Separator } from 'glidepanels/react'
import { useState } from 'react'

export function Workbench() {
  const [outline, setOutline] = useState(120)
  //     ^?

  return (
    <Group>
      <Panel size={140}>
        <nav>Files</nav>
      </Panel>
      <Separator />
      <Panel>
        <Group orientation="vertical">
          <Panel>
            <Group orientation="horizontal">
              <Panel>
                <main>Editor</main>
              </Panel>
              <Separator />
              <Panel size={outline} onSizeChange={setOutline}>
                <aside>Outline</aside>
              </Panel>
            </Group>
          </Panel>
          <Separator />
          <Panel size={90}>
            <pre>Terminal</pre>
          </Panel>
        </Group>
      </Panel>
    </Group>
  )
}
`}
        />
        <Source
          blocks={[
            { file: 'demos.tsx', region: 'nesting' },
            { file: 'demos.tsx', region: 'intersections' },
            { file: 'globals.css', region: 'separators', lang: 'css' },
          ]}
          note="Pane, Card, Rows and Demo are the shared wrappers, listed in full under Quick start."
        />
      </Section>

      <Section
        id="both-edges"
        title="Panels on both edges"
        lead="Each sized panel finds its own side: one before the filling panel drags on its end edge, one after it on its start edge. Two sized panels around one filling panel need no extra wiring — and, again, no separators."
      >
        <BothEdgesDemo />
        <Code
          code={`
import { Group, Panel } from 'glidepanels/react'
import { useState } from 'react'

export function Workbench() {
  const [left, setLeft] = useState(180)
  const [right, setRight] = useState(180)

  return (
    <Group>
      <Panel size={left} minSize={120} onSizeChange={setLeft}>
        <nav>Files</nav>
      </Panel>
      <Panel>
        <main>Editor</main>
      </Panel>
      <Panel size={right} minSize={120} onSizeChange={setRight}>
        <aside>Outline</aside>
      </Panel>
    </Group>
  )
}
`}
        />
        <Source
          blocks={[{ file: 'demos.tsx', region: 'both-edges' }]}
          note="Pane, Card, Rows and Demo are the shared wrappers, listed in full under Quick start."
        />
      </Section>

      <Section
        id="core"
        title="Core, without React"
        lead="The demo below renders no components: it builds a group and a panel from the core and wires them to plain DOM nodes. Same bounds, same folds, same keyboard — drag the seam, or focus the grip and use the arrows. This is the whole surface an adapter for another framework has to cover, which is why a Vue binding over motion-v is a thin layer rather than a rewrite."
      >
        <CoreDemo />
        <Code
          code={`
import { createPanel, createPanelGroup, FILL_ATTRIBUTE } from 'glidepanels'
import { animate, motionValue } from 'motion'

export function mountSplit(root: HTMLElement, panel: HTMLElement, fill: HTMLElement, grip: HTMLElement) {
  // The adapter hands motion in, so the panels and the elements that render
  // them always share one Motion instance.
  const group = createPanelGroup({ animate, motionValue }, 'horizontal')
  //    ^?

  fill.setAttribute(FILL_ATTRIBUTE, '')

  let size = 240
  const base = {
    minSize: 160,
    maxSize: 420,
    onSizeChange: (next: number) => {
      size = next
      controller.sync({ ...base, size })
    },
  }

  const controller = createPanel(group, { ...base, size })
  const detach = controller.attach(panel)

  // One motion value drives the panel; clamp the overshoot the way you like.
  controller.motion.size.on('change', (value) => {
    panel.style.width = \`\${Math.max(0, value)}px\`
  })

  grip.role = 'separator'
  grip.tabIndex = 0
  grip.ariaOrientation = group.axes.separator

  grip.addEventListener('pointerdown', (event) => {
    const origin = { x: event.clientX, y: event.clientY }
    grip.setPointerCapture(event.pointerId)
    controller.drag.start()

    const onMove = (move: PointerEvent) =>
      controller.drag.move({ x: move.clientX - origin.x, y: move.clientY - origin.y })
    const onUp = () => {
      controller.drag.end()
      grip.removeEventListener('pointermove', onMove)
      grip.removeEventListener('pointerup', onUp)
    }

    grip.addEventListener('pointermove', onMove)
    grip.addEventListener('pointerup', onUp)
  })

  grip.addEventListener('keydown', (event) => controller.resizeByKey(event))
  grip.addEventListener('dblclick', () => controller.reset())

  return () => {
    detach()
    controller.destroy()
  }
}
`}
        />
        <p className="note">
          <code>attach</code> reads the panel&apos;s place in the group — which
          side of the filling panel it sits on, and so which edge drags — and
          returns the detach. <code>sync</code> feeds it new options on every
          state change, the same call the React adapter makes in a layout
          effect. Everything else is state you already own.
        </p>
        <Source
          blocks={[
            { file: 'core-demo.tsx', region: 'core' },
            { file: 'globals.css', region: 'demo-panes', lang: 'css' },
          ]}
        />
      </Section>

      <Section
        id="styling"
        title="Styling"
        lead="Nothing ships styled. A separator is [role='separator'] with aria-orientation, positioned over the edge of the panel it resizes and taking no space in the flow, so give it a width and pull it across the seam with a negative margin. Every separator the pointer would drag from a crossing carries data-crossing while it hovers there, and data-resizing from the press until release, grabbed itself or pulled along. A sized panel with no Separator of its own renders one anyway, as the drag area on its edge — it carries data-glidepanels-edge and should stay invisible, so exclude it from anything you paint."
      >
        <Code
          lang="css"
          code={`
[role='separator'][aria-orientation='vertical'] {
  width: 14px;
  margin-inline: -7px; /* straddle the edge */
}

[role='separator']::after {
  border-radius: 999px;
  background: var(--line);
  content: '';
}

[role='separator']:hover::after,
[role='separator'][data-crossing]::after {
  background: var(--muted);
}

[role='separator'][data-resizing]::after {
  background: var(--accent);
}

/* the edge grip a panel renders for itself: hit area only */
[role='separator'][data-glidepanels-edge]::after {
  display: none;
}
`}
        />
      </Section>

      <Section
        id="api"
        title="API"
        lead="Every component forwards the rest of its props to a motion div."
      >
        {API.map((component) => (
          <div key={component.name}>
            <h3>
              <code>{component.name}</code>
            </h3>
            {component.note ? (
              <p>{component.note}</p>
            ) : (
              <table className="props">
                <tbody>
                  {component.props.map(([name, type, description]) => (
                    <tr key={name}>
                      <td>
                        <code>{name}</code>
                      </td>
                      <td>
                        <code className="type">{type}</code>
                      </td>
                      <td>{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
        <h3>
          <code>glidepanels</code>
        </h3>
        <p>
          The core, for an adapter or for plain DOM. Nothing here imports React.
        </p>
        <table className="props">
          <tbody>
            {CORE_API.map(([name, type, description]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>
                  <code className="type">{type}</code>
                </td>
                <td>{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </main>
  </div>
)

export default DocsPage
