import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import { useCallback, useRef, useState, useSyncExternalStore } from 'react'

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- hr is void: cannot be focused or hold the grip line */
import type { PanelController, Side } from '../core'
import { grips, hasFillAfter } from '../core'
import { useGroup, useIsomorphicLayoutEffect } from './internal'

export type SeparatorProps = HTMLMotionProps<'div'> & {
  own?: PanelController
}

const noop = () => () => {
  // no panel to subscribe to yet
}

export const Separator = ({
  'aria-label': ariaLabel = 'Resize panel',
  own,
  style,
  tabIndex = 0,
  ...props
}: SeparatorProps) => {
  const { axes, panels, subscribe } = useGroup()
  const slotRef = useRef<HTMLDivElement>(null)
  const gripRef = useRef<HTMLDivElement>(null)
  const pressed = useRef<{ clientX: number; clientY: number } | null>(null)
  const partners = useRef<PanelController[]>([])
  const [side, setSide] = useState<Side>()

  useIsomorphicLayoutEffect(() => {
    if (!own) {
      setSide(hasFillAfter(slotRef.current) ? 'start' : 'end')
    }
  }, [own])

  const panel = useSyncExternalStore(
    subscribe,
    () => own ?? (side ? panels.get(side) : undefined),
    () => own ?? undefined
  )
  const subscribePanel = useCallback(
    (listener: () => void) => panel?.subscribe(listener) ?? noop(),
    [panel]
  )
  const dragging = useSyncExternalStore(
    subscribePanel,
    () => panel?.state.dragging ?? false,
    () => false
  )
  const value = useSyncExternalStore(
    subscribePanel,
    () => panel?.target ?? 0,
    () => panel?.target ?? 0
  )
  const hit = useSyncExternalStore(
    grips.subscribe,
    () => grips.state(gripRef.current),
    () => null
  )
  const resizing = hit === 'held' || dragging
  const crossing = hit === 'crossed' && !resizing

  useIsomorphicLayoutEffect(() => {
    const element = gripRef.current

    return element && panel ? grips.register(element, panel) : undefined
  }, [panel])

  const grip = panel && (
    <motion.div
      ref={gripRef}
      role="separator"
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-orientation={axes.separator}
      aria-valuemax={panel.options.maxSize}
      aria-valuemin={panel.options.minSize ?? 0}
      aria-valuenow={value}
      aria-valuetext={`${value} pixels`}
      data-crossing={crossing || undefined}
      data-resizing={resizing || undefined}
      style={{
        cursor: crossing ? 'move' : axes.cursor,
        position: 'absolute',
        touchAction: 'none',
        [`inset${axes.axis}${panel.state.end ? 'End' : 'Start'}`]: 0,
        [`inset${axes.crossAxis}`]: 0,
        ...style,
      }}
      {...props}
      onDoubleClick={() => panel.reset()}
      onKeyDown={(event) => panel.resizeByKey(event)}
      onPan={(_, info) => {
        panel.drag.move(info.offset)
        for (const partner of partners.current) {
          partner.drag.move(info.offset)
        }
      }}
      onPanEnd={(event) => {
        panel.drag.end()
        for (const partner of partners.current) {
          partner.drag.end()
        }
        partners.current = []
        grips.invalidate()
        grips.mark('crossed', grips.at(event))
      }}
      onPanStart={() => {
        const crossed = pressed.current ? grips.at(pressed.current) : []
        partners.current = grips.partners(crossed, gripRef.current)
        const cursor = partners.current.length > 0 ? 'move' : undefined
        panel.drag.start(cursor)
        for (const partner of partners.current) {
          partner.drag.start(cursor)
        }
      }}
      onPointerCancel={() => {
        grips.mark('held', [])
        panel.drag.cancel()
        for (const partner of partners.current) {
          partner.drag.cancel()
        }
        partners.current = []
      }}
      onPointerDown={(event) => {
        pressed.current = { clientX: event.clientX, clientY: event.clientY }
        event.currentTarget.setPointerCapture(event.pointerId)
        grips.invalidate()
        grips.mark('held', grips.at(event))
      }}
      onPointerEnter={() => grips.invalidate()}
      onPointerLeave={() => {
        if (!resizing) {
          grips.mark('crossed', [])
        }
      }}
      onPointerMove={(event) => {
        if (!resizing) {
          grips.mark('crossed', grips.at(event))
        }
      }}
      onPointerUp={() => grips.mark('held', [])}
    />
  )

  if (own) {
    return grip
  }

  return (
    <div
      ref={slotRef}
      data-glidepanels-separator
      style={{ flex: 'none', position: 'relative', [axes.extent]: 0 }}
    >
      {grip}
    </div>
  )
}
