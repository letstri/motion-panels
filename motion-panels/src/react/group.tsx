import type { HTMLMotionProps, MotionStyle, Transition } from 'motion/react'
import { motion, Reorder } from 'motion/react'
import type { ReactNode } from 'react'
import { isValidElement, useContext, useMemo, useRef, useState } from 'react'

import type { Orientation } from '../core'
import { createPanelGroup, isRtl, reorder } from '../core'
import { DEV } from '../core/env'
import {
  GripContext,
  GroupContext,
  ReorderContext,
  useIsomorphicLayoutEffect,
} from './internal'

export type GroupProps<V = unknown> = Omit<
  HTMLMotionProps<'div'>,
  'children' | 'values'
> & {
  children?: ReactNode
  onOrderChange?: (order: V[]) => void
  order?: V[]
  orientation?: Orientation
  reorder?: boolean
  transition?: Transition
}

const childKeys = (children: ReactNode) =>
  String([children].flat().map((child) => isValidElement(child) && child.key))

export const Group = <V,>({
  children,
  onOrderChange,
  order,
  orientation = 'horizontal',
  reorder: travel = true,
  style,
  transition,
  ...props
}: GroupProps<V>) => {
  const parent = useContext(GroupContext)
  const [carrying, setCarrying] = useState(false)
  const [rtl, setRtl] = useState(false)
  // oxlint-disable-next-line react/hook-use-state -- created once, never replaced
  const [group] = useState(() => createPanelGroup(orientation))
  const root = useRef<HTMLDivElement>(null)
  const { axes } = group

  const sorting = useMemo(
    () =>
      order === undefined || onOrderChange === undefined
        ? null
        : {
            carry: setCarrying,
            carrying,
            onOrderChange,
            order,
            transition,
            travel,
          },
    [carrying, onOrderChange, order, transition, travel]
  )

  const keys = childKeys(children)
  const lastKeys = useRef(keys)
  const before = useRef<Map<Element, number> | null>(null)
  /* oxlint-disable react/refs -- getSnapshotBeforeUpdate has no hook form */
  if (keys !== lastKeys.current && root.current) {
    lastKeys.current = keys
    before.current =
      travel && !carrying ? reorder.measure(root.current, axes) : null
  }
  /* oxlint-enable react/refs */

  useIsomorphicLayoutEffect(() => {
    if (DEV && (order === undefined) !== (onOrderChange === undefined)) {
      console.warn(
        'Motion Panels: a group reorders only with both order and onOrderChange — one without the other moves nothing.'
      )
    }
  }, [onOrderChange, order])

  useIsomorphicLayoutEffect(() => {
    setRtl(axes.point === 'x' && isRtl(root.current))
    const boxes = before.current
    before.current = null
    if (boxes) {
      reorder.play(boxes, axes, transition)
    }
  }, [axes, keys, transition])

  /**
   * Motion walks a single-axis reorder by pointer velocity alone: it steps to
   * the next entry in `values`, which in an RTL row sits the other way round.
   * Hand it the order the row reads on screen and turn the answer back.
   */
  const reversed = rtl && sorting !== null
  const flip = (next: V[]) => sorting?.onOrderChange(next.toReversed())

  const box: MotionStyle = {
    display: 'flex',
    flexDirection: axes.direction,
    height: '100%',
    overflow: parent ? undefined : 'clip',
    pointerEvents: carrying ? 'none' : undefined,
    width: '100%',
    ...style,
  }

  return (
    <GroupContext.Provider value={group}>
      <ReorderContext.Provider value={sorting}>
        <GripContext.Provider value={null}>
          {sorting ? (
            <Reorder.Group
              ref={root}
              as="div"
              axis={axes.point}
              // oxlint-disable-next-line react/jsx-handler-names -- motion names the prop
              onReorder={reversed ? flip : sorting.onOrderChange}
              values={reversed ? sorting.order.toReversed() : sorting.order}
              style={box}
              {...props}
            >
              {children}
            </Reorder.Group>
          ) : (
            <motion.div ref={root} style={box} {...props}>
              {children}
            </motion.div>
          )}
        </GripContext.Provider>
      </ReorderContext.Provider>
    </GroupContext.Provider>
  )
}
