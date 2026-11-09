import type { MotionValue } from 'motion'
import { motionValue } from 'motion'

import type { Axes, Orientation, Side } from './axes'
import { AXES } from './axes'
import type { PanelController } from './panel'
import { emitter } from './utils'

export interface PanelGroup {
  attachFill: (element: HTMLElement) => () => void
  axes: Axes
  fill: {
    anchor: MotionValue<string>
    box: HTMLElement | null
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
  const fill: PanelGroup['fill'] = {
    anchor: motionValue('flex-start'),
    box: null,
    size: motionValue<number | string>('100%'),
  }

  return {
    attachFill: (element) => {
      fill.box = element

      return () => {
        if (fill.box === element) {
          fill.box = null
        }
      }
    },
    axes: AXES[orientation],
    fill,
    notify: bus.emit,
    panels: new Map(),
    subscribe: bus.subscribe,
  }
}
