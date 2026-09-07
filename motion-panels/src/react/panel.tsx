import type { HTMLMotionProps, Transition } from 'motion/react'
import { AnimatePresence, motion, useTransform } from 'motion/react'
import { useRef, useState, useSyncExternalStore } from 'react'

import type { PanelController, PanelOptions } from '../core'
import {
  coarsePointer,
  createPanel,
  EDGE_SIZE_FINE,
  edgeSize,
  reducedMotion,
} from '../core'
import { timing } from '../core/panel'
import { useGroup, useIsomorphicLayoutEffect } from './internal'
import { Separator } from './separator'

export type SizedPanelProps = HTMLMotionProps<'div'> & {
  collapsed?: boolean
  defaultSize?: number
  maxSize?: number
  minSize?: number
  onCollapsedChange?: (collapsed: boolean) => void
  onSizeChange?: (size: number) => void
  size: number
  transition?: Transition
}

export type FillPanelProps = HTMLMotionProps<'div'> & {
  pin?: boolean
  size?: undefined
}

export type PanelProps = FillPanelProps | SizedPanelProps

const useReducedMotion = () =>
  useSyncExternalStore(reducedMotion.subscribe, reducedMotion.get, () => false)

const useEdgeSize = () =>
  useSyncExternalStore(coarsePointer.subscribe, edgeSize, () => EDGE_SIZE_FINE)

export const usePanelState = (panel: PanelController) =>
  useSyncExternalStore(
    panel.subscribe,
    () => panel.state,
    () => panel.state
  )

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
  collapsed,
  defaultSize,
  exit,
  initial,
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
  const state = usePanelState(panel)
  const edge = useEdgeSize()
  // subscribed only so a preference flip re-renders into `timing`
  useReducedMotion()
  // Written straight to width and margin on purpose: a custom property on the
  // panel would invalidate style for every descendant on each drag frame.
  const rendered = useTransform(panel.motion.size, (value) =>
    Math.max(0, value)
  )
  const overshoot = useTransform(panel.motion.size, (value) =>
    Math.min(0, value)
  )

  useIsomorphicLayoutEffect(() => {
    panel.sync(options)
  })

  useIsomorphicLayoutEffect(
    () => (elementRef.current ? panel.attach(elementRef.current) : undefined),
    [panel]
  )

  const closed = exit ?? (typeof initial === 'boolean' ? undefined : initial)
  const present =
    !collapsed || state.dragging || (closed === undefined && state.folding)

  return (
    <motion.div
      ref={elementRef}
      style={{
        display: 'flex',
        flexDirection: axes.direction,
        flexShrink: 0,
        justifyContent: state.end ? 'flex-end' : 'flex-start',
        overflow:
          collapsed || state.dragging || state.folding ? 'clip' : 'visible',
        position: 'relative',
        [axes.extent]: rendered,
        [`margin${axes.axis}${state.end ? 'End' : 'Start'}`]: overshoot,
      }}
    >
      <AnimatePresence custom={props.custom} initial={false}>
        {present && (
          <motion.div
            key="content"
            exit={closed}
            initial={initial}
            transition={timing(transition)}
            style={{
              ...style,
              flexShrink: 0,
              [axes.cross]: '100%',
              [axes.extent]: panel.motion.content,
            }}
            {...props}
          />
        )}
      </AnimatePresence>
      {state.bare && (
        <Separator
          data-motion-panels-edge
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
