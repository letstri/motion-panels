import type { Transition } from 'motion'
import { animate } from 'motion'

import type { Axes } from './axes'
import { FILL_ATTRIBUTE, SEPARATOR_ATTRIBUTE } from './dom'
import { timing } from './transition'

export const reorder = {
  measure: (root: HTMLElement, axes: Axes) =>
    new Map(
      [...root.children].map(
        (child) => [child, child.getBoundingClientRect()[axes.edge]] as const
      )
    ),
  play: (before: Map<Element, number>, axes: Axes, transition?: Transition) => {
    for (const [child, from] of before) {
      if (!(child instanceof HTMLElement) || !child.isConnected) {
        continue
      }
      const delta = from - child.getBoundingClientRect()[axes.edge]
      if (delta === 0) {
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
        { [axes.point]: [delta, 0] },
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
  },
}
