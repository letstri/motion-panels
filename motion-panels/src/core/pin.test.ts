import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createPanelGroup } from './group'
import { createPanel } from './panel'
import { attachPin, pinSource } from './pin'

const PARENT_SIZE = 1000

const mount = () => {
  const parent = document.createElement('div')
  const panel = document.createElement('div')
  const fill = document.createElement('div')
  fill.dataset.motionPanelsFill = ''
  parent.append(panel, fill)
  document.body.append(parent)
  Object.defineProperty(parent, 'clientWidth', { value: PARENT_SIZE })
  Object.defineProperty(parent, 'clientHeight', { value: PARENT_SIZE })
  fill.style.width = `${PARENT_SIZE - 200}px`
  fill.style.height = `${PARENT_SIZE - 200}px`

  return { fill, panel }
}

describe('attachPin', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('holds an element inside a dragged panel at the size the drag can reach', () => {
    const group = createPanelGroup('horizontal')
    const options = { maxSize: 400, overshoot: false, size: 200 }
    const panel = createPanel(group, options)
    panel.attach(mount().panel)
    const pinned = document.createElement('div')
    pinned.style.width = '50%'
    const viewport = document.createElement('div')
    viewport.append(pinned)
    attachPin(pinned, [pinSource.sized(panel, group.axes)])

    panel.drag.start()
    panel.drag.move({ x: 100, y: 0 })
    expect(pinned.style.width).toBe('200px')
    expect(pinned.style.maxWidth).toBe('200px')
    expect(viewport.style.overflow).toBe('clip')

    panel.drag.end()
    panel.sync({ ...options, size: 300 })
    expect(pinned.style.width).toBe('50%')
    expect(pinned.style.maxWidth).toBe('')
    expect(viewport.style.overflow).toBe('')
  })

  it('holds an element inside the fill while a neighbour drags', () => {
    const group = createPanelGroup('horizontal')
    const panel = createPanel(group, { size: 200 })
    const { fill, panel: element } = mount()
    panel.attach(element)
    group.attachFill(fill)
    const pinned = document.createElement('div')
    attachPin(pinned, [pinSource.fill(group)])

    panel.drag.start()
    expect(pinned.style.width).toBe(`${PARENT_SIZE}px`)

    panel.drag.cancel()
    expect(pinned.style.width).toBe('')
  })

  it('leaves the other axis alone', () => {
    const group = createPanelGroup('vertical')
    const panel = createPanel(group, { size: 200 })
    panel.attach(mount().panel)
    const pinned = document.createElement('div')
    attachPin(pinned, [pinSource.sized(panel, group.axes)])

    panel.drag.start()
    expect(pinned.style.width).toBe('')
    expect(pinned.style.height).toBe(`${PARENT_SIZE - 200 + 22}px`)
  })

  it('lays out at the size on screen once the drag pauses', () => {
    vi.useFakeTimers()
    const group = createPanelGroup('horizontal')
    const panel = createPanel(group, {
      maxSize: 400,
      overshoot: false,
      size: 200,
    })
    panel.attach(mount().panel)
    const pinned = document.createElement('div')
    attachPin(pinned, [pinSource.sized(panel, group.axes)])

    panel.drag.start()
    panel.drag.move({ x: 50, y: 0 })
    expect(pinned.style.width).toBe('200px')

    vi.runAllTimers()
    expect(pinned.style.width).toBe('0px')

    panel.drag.move({ x: 60, y: 0 })
    expect(pinned.style.width).toBe('140px')
    vi.useRealTimers()
  })
})
