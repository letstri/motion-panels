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
    const moving = createPanel(createPanelGroup('horizontal'), { size: 200 })
    const still = createPanel(createPanelGroup('vertical'), { size: 200 })
    let left = 0
    const unregister = [
      grips.register(
        grip(() => rect(left, 0)),
        moving,
        'Inline'
      ),
      grips.register(
        grip(() => rect(0, 0)),
        still,
        'Block'
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

  it('never joins parallel grips stacked in one place', () => {
    const group = createPanelGroup('vertical')
    const [top, bottom, side] = [
      grip(() => rect(0, 0)),
      grip(() => rect(0, 0)),
      grip(() => rect(0, 0)),
    ]
    const unregister = [
      grips.register(top, createPanel(group, { size: 200 }), 'Block'),
      grips.register(
        bottom,
        createPanel(createPanelGroup('vertical'), { size: 0 }),
        'Block'
      ),
    ]

    expect(grips.at({ clientX: 5, clientY: 5 }, bottom)).toHaveLength(0)

    unregister.push(
      grips.register(
        side,
        createPanel(createPanelGroup('horizontal'), { size: 200 }),
        'Inline'
      )
    )

    expect(grips.at({ clientX: 5, clientY: 5 }, bottom)).toEqual([bottom, side])

    for (const stop of unregister) {
      stop()
    }
  })
})
