import type { Transition } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { isValidElement, useContext, useRef, useState } from 'react'

import type { Orientation } from '../core'
import { createPanelGroup, reorder } from '../core'
import { GroupContext, useIsomorphicLayoutEffect } from './internal'

export type GroupProps = ComponentProps<'div'> & {
  orientation?: Orientation
  transition?: Transition
}

const childKeys = (children: ReactNode) =>
  String([children].flat().map((child) => isValidElement(child) && child.key))

export const Group = ({
  children,
  orientation = 'horizontal',
  style,
  transition,
  ...props
}: GroupProps) => {
  const parent = useContext(GroupContext)
  // oxlint-disable-next-line react/hook-use-state -- created once, never replaced
  const [group] = useState(() => createPanelGroup(orientation))
  const root = useRef<HTMLDivElement>(null)
  const { axes } = group

  const keys = childKeys(children)
  const lastKeys = useRef(keys)
  const before = useRef<Map<Element, number> | null>(null)
  /* oxlint-disable react/refs -- getSnapshotBeforeUpdate has no hook form */
  if (keys !== lastKeys.current && root.current) {
    lastKeys.current = keys
    before.current = reorder.measure(root.current, axes)
  }
  /* oxlint-enable react/refs */

  useIsomorphicLayoutEffect(() => {
    const boxes = before.current
    before.current = null
    if (boxes) {
      reorder.play(boxes, axes, transition)
    }
  }, [axes, keys, transition])

  return (
    <GroupContext.Provider value={group}>
      <div
        ref={root}
        style={{
          display: 'flex',
          flexDirection: axes.direction,
          height: '100%',
          overflow: parent ? undefined : 'clip',
          width: '100%',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </GroupContext.Provider>
  )
}
