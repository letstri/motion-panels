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
import { createPanel, createPanelGroup, FILL_ATTRIBUTE } from 'motion-panels'

export function mountSplit(root: HTMLElement, panel: HTMLElement, fill: HTMLElement, grip: HTMLElement) {
  const group = createPanelGroup('horizontal')

  // The core owns numbers, not nodes: the group root is yours to lay out.
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
    <p className={ASIDE}>
      <code className={CHIP}>attach</code> reads the panel&apos;s place in the
      group — which side of the filling panel it sits on, and so which edge
      drags — and returns the detach. <code className={CHIP}>sync</code> feeds
      it new options on every state change, the same call the React adapter
      makes in a layout effect. Everything else is state you already own.
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
          "role='separator', tabIndex, aria-orientation from axes.separator, and aria-valuenow from controller.target.",
        ],
        [
          'pinned fill',
          'A flex wrapper with justify-content from group.fill.anchor, and the child sized by group.fill.size. Both are motion values the folding panel drives.',
        ],
      ]}
    />
    <Subheading>Folds and crossings</Subheading>
    <p className={`${LEAD} mt-3`}>
      The demo above stops at a drag. Two more calls carry the rest: a fold is
      one sync away, and a crossing is the grip registry handing you the
      separators that share the point you pressed.
    </p>
    <Code
      code={`
import type { PanelController, PanelOptions } from 'motion-panels'
import { grips } from 'motion-panels'

export function wireExtras(controller: PanelController, options: PanelOptions, content: HTMLElement, grip: HTMLElement, toggle: HTMLElement) {
  let collapsed = false

  // Collapsing is not a separate mode: a fold is the target moving to zero, so
  // sync it like any other option change and the animation follows.
  toggle.addEventListener('click', () => {
    collapsed = !collapsed
    controller.sync({ ...options, collapsed })
  })

  // Bind the second motion value and the content keeps its own width the whole
  // way down, so nothing inside it rewraps on a frame of the fold.
  controller.motion.content.on('change', (value) => {
    content.style.width = \`\${value}px\`
  })

  // Everything the React adapter puts on data attributes lives on state, which
  // is frozen and replaced only when it changes.
  const stop = controller.subscribe(() => {
    grip.toggleAttribute('data-resizing', controller.state.dragging)
  })

  // Register every grip once. The registry caches rects and drops them on
  // resize and scroll, so hit testing mid-drag costs nothing.
  const unregister = grips.register(grip, controller)

  grip.addEventListener('pointerdown', (event) => {
    grips.invalidate()
    const crossed = grips.at(event)
    const partners = grips.partners(crossed, grip)
    // Both separators of a crossing move together, so say so with the cursor.
    const cursor = partners.length > 0 ? 'move' : undefined

    grips.mark('held', crossed)
    controller.drag.start(cursor)
    for (const partner of partners) {
      partner.drag.start(cursor)
    }
    // Hand every partner the same offsets in move, and end them together.
  })

  return () => {
    unregister()
    stop()
  }
}
`}
    />
  </Section>
)
