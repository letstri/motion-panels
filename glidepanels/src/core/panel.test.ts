import { animate, motionValue } from 'motion/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createPanelGroup } from './group'
import type { PanelController } from './panel'
import { createPanel } from './panel'

const MOTION = { animate, motionValue }

const PARENT_SIZE = 1000

const noop = () => {
  // events in tests need no default to prevent
}

const key = (name: string, shiftKey = false) => ({
  key: name,
  preventDefault: noop,
  shiftKey,
})

const mount = (options?: { fillFirst?: boolean }) => {
  document.body.innerHTML = ''
  const parent = document.createElement('div')
  const panel = document.createElement('div')
  const fill = document.createElement('div')
  fill.dataset.glidepanelsFill = ''
  if (options?.fillFirst) {
    parent.append(fill, panel)
  } else {
    parent.append(panel, fill)
  }
  document.body.append(parent)
  Object.defineProperty(parent, 'offsetWidth', { value: PARENT_SIZE })

  return panel
}

describe('createPanel', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('detects the resizable edge from the fill panel', () => {
    const group = createPanelGroup(MOTION, 'horizontal')
    const panel = createPanel(group, { size: 200 })
    panel.attach(mount())
    expect(panel.state.end).toBe(true)

    const other = createPanelGroup(MOTION, 'horizontal')
    const trailing = createPanel(other, { size: 200 })
    trailing.attach(mount({ fillFirst: true }))
    expect(trailing.state.end).toBe(false)
  })

  it('clamps drag to bounds and reports the size once', () => {
    const onSizeChange = vi.fn()
    const group = createPanelGroup(MOTION, 'horizontal')
    const panel = createPanel(group, {
      maxSize: 400,
      minSize: 100,
      onSizeChange,
      size: 200,
    })
    panel.attach(mount())

    panel.drag.start()
    panel.drag.move({ x: 50, y: 0 })
    expect(panel.motion.size.get()).toBe(250)
    panel.drag.move({ x: 5000, y: 0 })
    expect(panel.motion.size.get()).toBe(400)
    panel.drag.move({ x: -5000, y: 0 })
    expect(panel.motion.size.get()).toBe(100)
    panel.drag.end()

    expect(onSizeChange).toHaveBeenCalledTimes(1)
    expect(onSizeChange).toHaveBeenCalledWith(100)
  })

  it('caps the default max at the space the other panels leave', () => {
    const group = createPanelGroup(MOTION, 'horizontal')
    const panel = createPanel(group, { size: 200 })
    panel.attach(mount())
    group.panels.set('end', { target: 300 } as unknown as PanelController)

    expect(panel.bounds()).toEqual({ max: PARENT_SIZE - 300, min: 0 })
  })

  it('collapses past half the minimum and restores on cancel', () => {
    const onCollapsedChange = vi.fn()
    const onSizeChange = vi.fn()
    const group = createPanelGroup(MOTION, 'horizontal')
    const panel = createPanel(group, {
      minSize: 100,
      onCollapsedChange,
      onSizeChange,
      size: 200,
    })
    panel.attach(mount())

    panel.drag.start()
    panel.drag.move({ x: -160, y: 0 })
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    panel.drag.cancel()

    expect(onCollapsedChange).toHaveBeenLastCalledWith(false)
    expect(onSizeChange).not.toHaveBeenCalled()
    expect(panel.motion.size.get()).toBe(200)
  })

  it('moves the keyboard step towards the panel edge', () => {
    const onSizeChange = vi.fn()
    const leading = createPanel(createPanelGroup(MOTION, 'horizontal'), {
      onSizeChange,
      size: 200,
    })
    leading.attach(mount())
    leading.resizeByKey(key('ArrowRight'))
    expect(onSizeChange).toHaveBeenLastCalledWith(210)
    leading.resizeByKey(key('ArrowRight', true))
    expect(onSizeChange).toHaveBeenLastCalledWith(250)

    const trailing = createPanel(createPanelGroup(MOTION, 'horizontal'), {
      onSizeChange,
      size: 200,
    })
    trailing.attach(mount({ fillFirst: true }))
    trailing.resizeByKey(key('ArrowRight'))
    expect(onSizeChange).toHaveBeenLastCalledWith(190)
  })

  it('expands a collapsed panel from the keyboard', () => {
    const onCollapsedChange = vi.fn()
    const onSizeChange = vi.fn()
    const panel = createPanel(createPanelGroup(MOTION, 'horizontal'), {
      collapsed: true,
      minSize: 120,
      onCollapsedChange,
      onSizeChange,
      size: 200,
    })
    panel.attach(mount())

    panel.resizeByKey(key('ArrowRight'))

    expect(onCollapsedChange).toHaveBeenCalledWith(false)
    expect(onSizeChange).toHaveBeenCalledWith(120)
  })
})
