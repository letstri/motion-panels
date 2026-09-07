import type { HTMLMotionProps, Transition } from 'motion/react'
import { AnimatePresence, motion, useTransform } from 'motion/react'
import { useRef, useState, useSyncExternalStore } from 'react'

import type { PanelController, PanelOptions } from '../core'
import {
  coarsePointer,
  createPanel,
  EDGE_SIZE_COARSE,
  EDGE_SIZE_FINE,
  reducedMotion,
  TRANSITION,
} from '../core'
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

const INSTANT: Transition = { duration: 0 }

const useReducedMotion = () =>
  useSyncExternalStore(reducedMotion.subscribe, reducedMotion.get, () => false)

const useEdgeSize = () =>
  useSyncExternalStore(
    coarsePointer.subscribe,
    () => (coarsePointer.get() ? EDGE_SIZE_COARSE : EDGE_SIZE_FINE),
    () => EDGE_SIZE_FINE
  )

export const usePanelState = (panel: PanelController) =>
  useSyncExternalStore(
    panel.subscribe,
    () => panel.state,
    () => panel.state
  )

const FillPanel = ({ pin, style, ...props }: FillPanelProps) => {
  const {
    axes: { cross, direction, extent },
    fill,
  } = useGroup()
  const overflow = useTransform(fill.size, (value) =>
    value === '100%' ? 'visible' : 'clip'
  )

  if (!pin) {
    return (
      <motion.div
        data-glidepanels-fill
        style={{ flex: 1, minHeight: 0, minWidth: 0, ...style }}
        {...props}
      />
    )
  }

  return (
    <motion.div
      data-glidepanels-fill
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: direction,
        justifyContent: fill.anchor,
        minHeight: 0,
        minWidth: 0,
        overflow,
      }}
    >
      <motion.div
        style={{
          ...style,
          flexShrink: 0,
          [cross]: '100%',
          [extent]: fill.size,
        }}
        {...props}
      />
    </motion.div>
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
  const reduced = useReducedMotion()
  const rendered = useTransform(panel.motion.size, (value) =>
    Math.max(0, value)
  )
  const overshoot = useTransform(panel.motion.size, (value) =>
    Math.min(0, value)
  )

  useIsomorphicLayoutEffect(() => {
    panel.sync(options)
  })

  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current

    return element ? panel.attach(element) : undefined
  }, [panel])

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
            transition={reduced ? INSTANT : (transition ?? TRANSITION)}
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
          data-glidepanels-edge
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
