/* oxlint-disable jsx-a11y/prefer-tag-over-role -- hr is void: cannot be focused or hold the grip line */
import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import { useRef } from 'react'

import type { PanelController } from '../core'
import { attachSeparator } from '../core'
import { useGroup, useIsomorphicLayoutEffect } from './internal'

export type SeparatorProps = HTMLMotionProps<'div'>

type GripProps = SeparatorProps & { end?: boolean; own?: PanelController }

export const Separator = ({
  'aria-label': ariaLabel = 'Resize panel',
  end,
  own,
  style,
  tabIndex = 0,
  transition,
  ...props
}: GripProps) => {
  const group = useGroup()
  const { axes } = group
  const gripRef = useRef<HTMLDivElement>(null)
  const edge = `inset${axes.axis}${end ? 'End' : 'Start'}` as const

  useIsomorphicLayoutEffect(
    () =>
      gripRef.current
        ? attachSeparator(gripRef.current, group, own)
        : undefined,
    [group, own]
  )

  const grip = (
    <motion.div
      ref={gripRef}
      role="separator"
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-orientation={axes.separator}
      transition={transition}
      style={{
        cursor: axes.cursor,
        flexShrink: 0,
        touchAction: 'none',
        ...style,
      }}
      {...props}
    />
  )

  const slot = {
    display: 'flex',
    flexDirection: axes.direction,
    justifyContent: 'center',
    [axes.extent]: 0,
  } as const

  return own ? (
    <div
      style={{
        ...slot,
        position: 'absolute',
        [edge]: 0,
        [`inset${axes.crossAxis}`]: 0,
      }}
    >
      {grip}
    </div>
  ) : (
    <div data-motion-panels-separator style={{ ...slot, flex: 'none' }}>
      {grip}
    </div>
  )
}
