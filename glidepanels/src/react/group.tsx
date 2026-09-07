import { animate, motionValue } from 'motion/react'
import type { ComponentProps } from 'react'
import { useContext, useMemo } from 'react'

import type { Orientation } from '../core'
import { createPanelGroup } from '../core'
import { GroupContext } from './internal'

const MOTION = { animate, motionValue }

export type GroupProps = ComponentProps<'div'> & {
  orientation?: Orientation
}

export const Group = ({
  orientation = 'horizontal',
  style,
  ...props
}: GroupProps) => {
  const parent = useContext(GroupContext)
  const group = useMemo(
    () => createPanelGroup(MOTION, orientation),
    [orientation]
  )

  return (
    <GroupContext.Provider value={group}>
      <div
        style={{
          display: 'flex',
          flexDirection: group.axes.direction,
          height: '100%',
          overflow: parent ? undefined : 'clip',
          width: '100%',
          ...style,
        }}
        {...props}
      />
    </GroupContext.Provider>
  )
}
