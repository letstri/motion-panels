import type { HTMLMotionProps, Transition } from 'motion/react'
import { AnimatePresence, motion, useTransform } from 'motion/react'
import { useRef, useState } from 'react'

import type { PanelOptions, Size } from '../core'
import {
  coarsePointer,
  createPanel,
  edgeSize,
  reducedMotion,
  timing,
} from '../core'
import { useGroup, useIsomorphicLayoutEffect, useStore } from './internal'
import { Separator } from './separator'

export type SizedPanelProps = HTMLMotionProps<'div'> & {
  collapsed?: boolean
  defaultSize?: Size
  keepMounted?: boolean
  maxSize?: Size
  minSize?: Size
  onCollapsedChange?: (collapsed: boolean) => void
  onSizeChange?: (size: number) => void
  size: Size
  transition?: Transition
}

export type FillPanelProps = HTMLMotionProps<'div'> & {
  pin?: boolean
  size?: undefined
}

export type PanelProps = FillPanelProps | SizedPanelProps

const FillPanel = ({ pin, style, transition, ...props }: FillPanelProps) => {
  const {
    axes: { cross, direction, extent },
    fill,
  } = useGroup()
  const overflow = useTransform(fill.size, (value) =>
    value === '100%' ? 'visible' : 'clip'
  )
  const box = { flex: 1, minHeight: 0, minWidth: 0 }

  return pin ? (
    <motion.div
      data-motion-panels-fill
      style={{
        ...box,
        display: 'flex',
        flexDirection: direction,
        justifyContent: fill.anchor,
        overflow,
      }}
    >
      <motion.div
        transition={transition}
        style={{
          ...style,
          flexShrink: 0,
          [cross]: '100%',
          [extent]: fill.size,
        }}
        {...props}
      />
    </motion.div>
  ) : (
    <motion.div
      data-motion-panels-fill
      transition={transition}
      style={{ ...box, ...style }}
      {...props}
    />
  )
}

const SizedPanel = ({
  animate,
  collapsed,
  custom,
  defaultSize,
  exit,
  initial,
  keepMounted = true,
  maxSize,
  minSize,
  onCollapsedChange,
  onSizeChange,
  size,
  style,
  transition,
  ...props
}: SizedPanelProps) => {
  const group = useGroup()
  const { axes } = group
  const elementRef = useRef<HTMLDivElement>(null)
  const options: PanelOptions = {
    collapsed,
    defaultSize,
    maxSize,
    minSize,
    onCollapsedChange,
    onSizeChange,
    size,
    transition,
  }
  // oxlint-disable-next-line react/hook-use-state -- the controller is created once and mutated, never replaced
  const [panel] = useState(() => createPanel(group, options))
  const state = useStore(panel.subscribe, () => panel.state)
  const edge = useStore(coarsePointer.subscribe, edgeSize)
  useStore(reducedMotion.subscribe, reducedMotion.get)
  const extent = useTransform(panel.motion.size, Math.abs)

  const closedPose =
    exit ?? (typeof initial === 'boolean' ? undefined : initial)
  const present =
    !collapsed || state.dragging || (closedPose === undefined && state.folding)
  const [shown, setShown] = useState(present)
  if (present && !shown) {
    setShown(true)
  }
  const mounted = keepMounted ? shown : present
  // oxlint-disable-next-line react/hook-use-state -- a constant captured at mount, never set again
  const [openAtMount] = useState(present)
  const wasMounted = useRef(false)

  useIsomorphicLayoutEffect(() => {
    const mounting = mounted && !wasMounted.current
    panel.sync(options, mounting)
    wasMounted.current = mounted
  })

  useIsomorphicLayoutEffect(
    () => (elementRef.current ? panel.attach(elementRef.current) : undefined),
    []
  )

  const renderContent = (
    pose: Pick<SizedPanelProps, 'animate' | 'exit' | 'initial'>
  ) => (
    <motion.div
      key="content"
      custom={custom}
      transition={timing(transition)}
      style={{
        ...style,
        flexShrink: 0,
        [axes.cross]: '100%',
        [axes.extent]: panel.motion.content,
      }}
      {...props}
      {...pose}
    />
  )

  const clipping = !!collapsed || state.dragging || state.folding

  return (
    <motion.div
      ref={elementRef}
      style={{
        display: 'flex',
        flexDirection: axes.direction,
        flexShrink: 0,
        justifyContent: state.end ? 'flex-start' : 'flex-end',
        overflow: clipping ? 'clip' : 'visible',
        position: 'relative',
        [axes.extent]: extent,
      }}
    >
      {keepMounted ? (
        mounted &&
        renderContent({
          animate: present ? animate : closedPose,
          initial: openAtMount ? false : initial,
        })
      ) : (
        <AnimatePresence custom={custom} initial={false}>
          {present && renderContent({ animate, exit: closedPose, initial })}
        </AnimatePresence>
      )}
      {state.bare && (
        <Separator
          data-motion-panels-edge
          end={state.end}
          own={panel}
          style={{ [axes.extent]: edge }}
        />
      )}
    </motion.div>
  )
}

export const Panel = (props: PanelProps) =>
  props.size === undefined ? (
    <FillPanel {...props} />
  ) : (
    <SizedPanel {...props} />
  )
