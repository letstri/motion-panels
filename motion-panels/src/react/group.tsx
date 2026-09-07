import type { Transition } from 'motion/react'
import { animate } from 'motion/react'
import type { ComponentProps, ReactNode, RefObject } from 'react'
import { Component, useContext, useMemo, useRef } from 'react'

import type { Orientation } from '../core'
import { createPanelGroup, FILL_ATTRIBUTE, SEPARATOR_ATTRIBUTE } from '../core'
import { timing } from '../core/panel'
import { GroupContext } from './internal'

export type GroupProps = ComponentProps<'div'> & {
  layoutDependency?: unknown
  orientation?: Orientation
  transition?: Transition
}

interface FlipProps {
  children: ReactNode
  dependency: unknown
  edge: 'left' | 'top'
  point: 'x' | 'y'
  root: RefObject<HTMLDivElement | null>
  transition?: Transition
}

// First-last-invert-play for the group's own children, only on the renders
// where `dependency` changed. A class, because getSnapshotBeforeUpdate is the
// one place React lets you measure the old boxes: after render, before the DOM
// moves. Motion's own layout projection cannot be used here — it claims the
// width it measures, and every panel already drives width from a motion value.
// oxlint-disable-next-line react/prefer-function-component -- getSnapshotBeforeUpdate has no hook form
class Flip extends Component<FlipProps> {
  getSnapshotBeforeUpdate(previous: FlipProps) {
    const { dependency, edge, root } = this.props
    if (previous.dependency === dependency || !root.current) {
      return null
    }

    return new Map(
      [...root.current.children].map(
        (child) => [child, child.getBoundingClientRect()[edge]] as const
      )
    )
  }

  componentDidUpdate(
    _previous: FlipProps,
    _state: unknown,
    before: Map<Element, number> | null
  ) {
    if (!before) {
      return
    }
    const { edge, point, transition } = this.props
    for (const [child, from] of before) {
      // Widths animate from the next frame on, so the box measured here still
      // carries the old size: the delta is the reorder alone.
      const delta = from - child.getBoundingClientRect()[edge]
      if (delta === 0 || !(child instanceof HTMLElement)) {
        continue
      }
      // A docked panel in flight passes over the fill, never under it, so the
      // trip reads the same whichever way it goes. The fill is the ground.
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
  }

  render(): ReactNode {
    return this.props.children
  }
}

export const Group = ({
  children,
  layoutDependency,
  orientation = 'horizontal',
  style,
  transition,
  ...props
}: GroupProps) => {
  const parent = useContext(GroupContext)
  const group = useMemo(() => createPanelGroup(orientation), [orientation])
  const root = useRef<HTMLDivElement>(null)
  const { direction, point } = group.axes

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
        <Flip
          dependency={layoutDependency}
          edge={point === 'x' ? 'left' : 'top'}
          point={point}
          root={root}
          transition={transition}
        >
          {children}
        </Flip>
      </div>
    </GroupContext.Provider>
  )
}
