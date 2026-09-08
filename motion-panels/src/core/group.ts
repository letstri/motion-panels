import type { MotionValue } from 'motion'
import { motionValue } from 'motion'

import type { Axes, Orientation, Side } from './axes'
import { AXES } from './axes'
import type { PanelController } from './panel'
import { emitter } from './utils'

export interface PanelGroup {
  axes: Axes
  fill: {
    anchor: MotionValue<string>
    size: MotionValue<number | string>
  }
  notify: () => void
  panels: Map<Side, PanelController>
  subscribe: (listener: () => void) => () => void
}

export const createPanelGroup = (
  orientation: Orientation = 'horizontal'
): PanelGroup => {
  const bus = emitter()

  return {
    axes: AXES[orientation],
    fill: {
      anchor: motionValue('flex-start'),
      size: motionValue<number | string>('100%'),
    },
    notify: bus.emit,
    panels: new Map(),
    subscribe: bus.subscribe,
  }
}
