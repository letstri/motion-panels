import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import { useCallback, useRef, useState, useSyncExternalStore } from 'react'

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- hr is void: cannot be focused or hold the grip line */
import type { PanelController, Side } from '../core'
import { grips, hasFillAfter } from '../core'
import { noop } from '../core/env'
import type { Point } from '../core/grips'
import { useGroup, useIsomorphicLayoutEffect } from './internal'

export type SeparatorProps = HTMLMotionProps<'div'> & {
  own?: PanelController
}

export const Separator = ({
  'aria-label': ariaLabel = 'Resize panel',
  own,
  style,
  tabIndex = 0,
  transition,
  ...props
}: SeparatorProps) => {
  const { axes, panels, subscribe } = useGroup()
  const slotRef = useRef<HTMLDivElement>(null)
  const gripRef = useRef<HTMLDivElement>(null)
  const pressed = useRef<Point | null>(null)
  const partners = useRef<PanelController[]>([])
  const dragged = useRef(false)
  const [side, setSide] = useState<Side>()

  useIsomorphicLayoutEffect(() => {
    if (!own) {
      setSide(hasFillAfter(slotRef.current) ? 'start' : 'end')
    }
  })

  const panel = useSyncExternalStore(
    subscribe,
    () => own ?? (side ? panels.get(side) : undefined),
    () => own
  )
  const subscribePanel = useCallback(
    (listener: () => void) => panel?.subscribe(listener) ?? noop,
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
  const moving = hit !== null

  const each = (act: (target: PanelController) => void) => {
    for (const target of [panel, ...partners.current]) {
      if (target) {
        act(target)
      }
    }
  }

  useIsomorphicLayoutEffect(
    () =>
      gripRef.current && panel
        ? grips.register(gripRef.current, panel)
        : undefined,
    [panel]
  )

  const grip = (
    <motion.div
      ref={gripRef}
      role="separator"
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-orientation={axes.separator}
      aria-valuemax={panel?.options.maxSize}
      aria-valuemin={panel?.options.minSize ?? 0}
      aria-valuenow={value}
      aria-valuetext={`${value} pixels`}
      data-crossing={crossing || undefined}
      data-resizing={resizing || undefined}
      transition={transition}
      style={{
        cursor: moving ? 'move' : axes.cursor,
        flexShrink: 0,
        touchAction: 'none',
        ...style,
      }}
      {...props}
      onDoubleClick={() => {
        if (!dragged.current) {
          panel?.reset()
        }
      }}
      onKeyDown={(event) => panel?.resizeByKey(event)}
      onPan={(_, info) => each((target) => target.drag.move(info.offset))}
      onPanEnd={(event) => {
        each((target) => target.drag.end())
        partners.current = []
        grips.invalidate()
        grips.mark('crossed', grips.at(event))
      }}
      onPanStart={() => {
        dragged.current = true
        const crossed = pressed.current ? grips.at(pressed.current) : []
        partners.current = grips.partners(crossed, gripRef.current)
        const cursor = partners.current.length > 0 ? 'move' : undefined
        each((target) => target.drag.start(cursor))
      }}
      onPointerCancel={() => {
        grips.mark('held', [])
        each((target) => target.drag.cancel())
        partners.current = []
      }}
      onPointerDown={(event) => {
        dragged.current = false
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

  const seam = {
    display: 'flex',
    flexDirection: axes.direction,
    justifyContent: 'center',
    [axes.extent]: 0,
  } as const

  return own ? (
    <div
      style={{
        ...seam,
        position: 'absolute',
        [`inset${axes.axis}${own.state.end ? 'End' : 'Start'}`]: 0,
        [`inset${axes.crossAxis}`]: 0,
      }}
    >
      {grip}
    </div>
  ) : (
    <motion.div
      ref={slotRef}
      data-motion-panels-separator
      style={{ ...seam, flex: 'none' }}
    >
      {grip}
    </motion.div>
  )
}
