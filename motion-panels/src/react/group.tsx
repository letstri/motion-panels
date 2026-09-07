import type { Transition } from 'motion/react'
import { animate } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { isValidElement, useContext, useMemo, useRef } from 'react'

import type { Orientation } from '../core'
import { createPanelGroup, FILL_ATTRIBUTE, SEPARATOR_ATTRIBUTE } from '../core'
import { timing } from '../core/panel'
import { GroupContext, useIsomorphicLayoutEffect } from './internal'

export type GroupProps = ComponentProps<'div'> & {
  orientation?: Orientation
  transition?: Transition
}

const keysOf = (children: ReactNode) =>
  String([children].flat().map((child) => isValidElement(child) && child.key))

export const Group = ({
  children,
  orientation = 'horizontal',
  style,
  transition,
  ...props
}: GroupProps) => {
  const parent = useContext(GroupContext)
  const group = useMemo(() => createPanelGroup(orientation), [orientation])
  const root = useRef<HTMLDivElement>(null)
  const { direction, point } = group.axes
  const edge = point === 'x' ? 'left' : 'top'

  const keys = keysOf(children)
  const last = useRef(keys)
  const before = useRef<Map<Element, number> | null>(null)
  /* oxlint-disable react/refs -- getSnapshotBeforeUpdate has no hook form */
  if (keys !== last.current && root.current) {
    last.current = keys
    before.current = new Map(
      [...root.current.children].map(
        (child) => [child, child.getBoundingClientRect()[edge]] as const
      )
    )
  }
  /* oxlint-enable react/refs */

  useIsomorphicLayoutEffect(() => {
    const boxes = before.current
    before.current = null
    for (const [child, from] of boxes ?? []) {
      const delta = from - child.getBoundingClientRect()[edge]
      if (
        delta === 0 ||
        !child.isConnected ||
        !(child instanceof HTMLElement)
      ) {
        continue
      }
      const lift =
        !child.hasAttribute(FILL_ATTRIBUTE) &&
        !child.hasAttribute(SEPARATOR_ATTRIBUTE)
      if (lift) {
        child.style.zIndex = '1'
      }
      animate(
        child,
        { [point]: [delta, 0] },
        {
          ...timing(transition),
          onComplete: () => {
            if (lift) {
              child.style.zIndex = ''
            }
          },
        }
      )
    }
  }, [edge, keys, point, transition])

  return (
    <GroupContext.Provider value={group}>
      <div
        ref={root}
        style={{
          display: 'flex',
          flexDirection: direction,
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
