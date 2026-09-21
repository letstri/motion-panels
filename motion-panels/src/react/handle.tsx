import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { useContext } from 'react'

import { GripContext, ReorderContext, useGroup } from './internal'

export type HandleProps = HTMLMotionProps<'button'>

export const Handle = ({
  'aria-label': ariaLabel,
  onKeyDown,
  onPointerDown,
  style,
  type = 'button',
  ...props
}: HandleProps) => {
  const { axes } = useGroup()
  const grip = useContext(GripContext)
  const reordering = useContext(ReorderContext)

  if (!grip || !reordering) {
    return null
  }

  const { onOrderChange, order } = reordering
  const named =
    typeof grip.value === 'string' || typeof grip.value === 'number'
      ? `Move ${grip.value}`
      : 'Move panel'

  const moveByKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    const step =
      event.key === axes.grow ? 1 : event.key === axes.shrink ? -1 : 0
    const rtl =
      axes.point === 'x' &&
      getComputedStyle(event.currentTarget).direction === 'rtl'
    const from = order.indexOf(grip.value)
    const to = from + step * (rtl ? -1 : 1)
    if (step === 0 || from === -1 || to < 0 || to >= order.length) {
      return
    }
    event.preventDefault()
    const next = [...order]
    ;[next[from], next[to]] = [next[to], next[from]]
    onOrderChange(next)
  }

  return (
    <motion.button
      aria-label={ariaLabel ?? named}
      onKeyDown={moveByKey}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event)
        grip.controls.start(event)
      }}
      type={type}
      style={{ cursor: 'grab', touchAction: 'none', ...style }}
      {...props}
    />
  )
}
