import { Code } from '@/components/docs/code'
import { ASIDE, CHIP, LEAD } from '@/components/docs/prose'
import { Reference } from '@/components/docs/reference'
import { Section, Subheading } from '@/components/docs/section'
import { CoreDemo } from '@/demos'

export const Core = () => (
  <Section
    id="core"
    title="Core, without React"
    lead={
      'The demo below renders no components: it builds a group and a panel from the core and wires them to plain DOM nodes. Same bounds, same folds, same keyboard \u2014 drag the seam, or focus the grip and use the arrows. This is the whole surface an adapter for another framework has to cover.'
    }
  >
    <CoreDemo />
    <Code
      code={`
import { attachSeparator, createPanel, createPanelGroup, FILL_ATTRIBUTE } from 'motion-panels'

export function mountSplit(root: HTMLElement, panel: HTMLElement, fill: HTMLElement, grip: HTMLElement) {
  const group = createPanelGroup('horizontal')

  Object.assign(root.style, { display: 'flex', flexDirection: group.axes.direction, overflow: 'clip' })
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

  controller.motion.size.on('change', (value) => {
    panel.style.width = \`\${Math.max(0, value)}px\`
  })

  grip.role = 'separator'
  grip.tabIndex = 0
  grip.ariaOrientation = group.axes.separator
  const detachGrip = attachSeparator(grip, group, controller)

  return () => {
    detachGrip()
    detach()
    controller.destroy()
  }
}
`}
    />
    <p className={ASIDE}>
      <code className={CHIP}>attach</code> reads the panel&apos;s place in the
      group — which side of the filling panel it sits on, and so which edge
      drags — and returns the detach.{' '}
      <code className={CHIP}>attachSeparator</code> wires the separator: pointer
      drags and crossings, keyboard, double-click reset, and the live aria-value
      and data attributes. <code className={CHIP}>sync</code> feeds the panel
      new options on every state change, the same calls the React adapter makes
      in layout effects. Everything else is state you already own.
    </p>
    <Subheading>What every element needs</Subheading>
    <p className={`${LEAD} mt-3`}>
      The core owns numbers, never nodes. It reads one attribute and hands back
      motion values and a state object; laying the flexbox out is the
      adapter&apos;s half of the deal. This is that half, in full.
    </p>
    <Reference
      head={['Element', 'What you give it']}
      rows={[
        [
          'group root',
          'display: flex, flex-direction from axes.direction, and overflow: clip on the outermost group.',
        ],
        [
          'filling panel',
          'The FILL_ATTRIBUTE plus flex: 1 and a zero min-width or min-height. Every sized panel finds its own side by looking for this one.',
        ],
        [
          'sized panel',
          'flex-shrink: 0 and its extent from motion.size, floored at 0. Feed the negative part back as a margin on the dragging edge and an overshoot pulls the layout instead of pushing it.',
        ],
        [
          'panel content',
          'flex-shrink: 0, 100% on the cross axis, and its extent from motion.content — the value that holds a layout still while the panel edge slides across it.',
        ],
        [
          'separator',
          "role='separator', tabIndex, aria-orientation from axes.separator, touch-action: none, and attachSeparator. It writes aria-valuenow, data-resizing and data-crossing itself.",
        ],
        [
          'pinned fill',
          'A flex wrapper with justify-content from group.fill.anchor, and the child sized by group.fill.size. Both are motion values the folding panel drives.',
        ],
      ]}
    />
    <Subheading>Folds and reorders</Subheading>
    <p className={`${LEAD} mt-3`}>
      The demo above stops at a drag. A fold is one sync away, and a reorder is
      two calls around the DOM change: measure the children before, play the
      trip after.
    </p>
    <Code
      code={`
import type { PanelController, PanelGroup, PanelOptions } from 'motion-panels'
import { reorder } from 'motion-panels'

export function wireExtras(controller: PanelController, options: PanelOptions, content: HTMLElement, toggle: HTMLElement) {
  let collapsed = false

  toggle.addEventListener('click', () => {
    collapsed = !collapsed
    controller.sync({ ...options, collapsed })
  })

  controller.motion.content.on('change', (value) => {
    content.style.width = \`\${value}px\`
  })
}

export function move(root: HTMLElement, axes: PanelGroup['axes'], change: () => void) {
  const before = reorder.measure(root, axes)
  change()
  reorder.play(before, axes)
}
`}
    />
  </Section>
)
