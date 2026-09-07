import type { MotionValue } from 'motion'

import type { Axes, Orientation, Side } from './axes'
import { AXES } from './axes'
import type { MotionApi } from './motion'
import type { PanelController } from './panel'

export interface PanelGroup {
  axes: Axes
  fill: {
    anchor: MotionValue<string>
    size: MotionValue<number | string>
  }
  motion: MotionApi
  notify: () => void
  panels: Map<Side, PanelController>
  subscribe: (listener: () => void) => () => void
}

export const createPanelGroup = (
  motion: MotionApi,
  orientation: Orientation = 'horizontal'
): PanelGroup => {
  const listeners = new Set<() => void>()

  return {
    axes: AXES[orientation],
    fill: {
      anchor: motion.motionValue('flex-start'),
      size: motion.motionValue<number | string>('100%'),
    },
    motion,
    notify: () => {
      // oxlint-disable-next-line unicorn/no-useless-spread -- snapshot: a listener may unsubscribe while notifying
      for (const listener of [...listeners]) {
        listener()
      }
    },
    panels: new Map<Side, PanelController>(),
    subscribe: (listener: () => void) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}
