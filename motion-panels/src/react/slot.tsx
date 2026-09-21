import type { HTMLMotionProps } from 'motion/react'
import { motion, Reorder, useDragControls } from 'motion/react'
import type { ReactNode, RefObject } from 'react'
import { useContext, useMemo } from 'react'

import { timing } from '../core'
import { GripContext, ReorderContext } from './internal'

const INSTANT = { duration: 0 }

export type SlotProps = Omit<HTMLMotionProps<'div'>, 'children' | 'layout'> & {
  children?: ReactNode
  slotRef?: RefObject<HTMLDivElement | null>
  value?: unknown
}

export const Slot = ({
  children,
  onDragEnd,
  onDragStart,
  slotRef,
  value,
  ...props
}: SlotProps) => {
  const controls = useDragControls()
  const reordering = useContext(ReorderContext)
  const grip = useMemo(() => ({ controls, value }), [controls, value])

  if (value === undefined || !reordering) {
    return (
      <motion.div
        ref={slotRef}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <GripContext.Provider value={grip}>
      <Reorder.Item
        ref={slotRef}
        as="div"
        dragControls={controls}
        dragListener={false}
        layout="position"
        onDragEnd={(event, info) => {
          reordering.carry(false)
          onDragEnd?.(event, info)
        }}
        onDragStart={(event, info) => {
          reordering.carry(true)
          onDragStart?.(event, info)
        }}
        transition={{
          layout:
            reordering.carrying && reordering.travel
              ? timing(reordering.transition)
              : INSTANT,
        }}
        value={value}
        {...props}
      >
        {children}
      </Reorder.Item>
    </GripContext.Provider>
  )
}
