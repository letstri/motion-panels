import { beforeEach, describe, expect, it } from 'vitest'

import { grips } from './grips'
import { createPanelGroup } from './group'
import { createPanel } from './panel'

const rect = (left: number, top: number) =>
  ({ bottom: top + 10, left, right: left + 10, top }) as DOMRect

const grip = (position: () => DOMRect) => {
  const element = document.createElement('div')
  element.getBoundingClientRect = position

  return element
}

describe('grips', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('re-measures after a panel resize moves the grips', () => {
    const group = createPanelGroup('horizontal')
    const moving = createPanel(group, { size: 200 })
    const still = createPanel(group, { size: 200 })
    let left = 0
    const unregister = [
      grips.register(
        grip(() => rect(left, 0)),
        moving
      ),
      grips.register(
        grip(() => rect(0, 0)),
        still
      ),
    ]

    expect(grips.at({ clientX: 5, clientY: 5 })).toHaveLength(2)

    left = 500
    moving.motion.size.jump(300)

    expect(grips.at({ clientX: 5, clientY: 5 })).toHaveLength(0)

    for (const stop of unregister) {
      stop()
    }
  })
})
