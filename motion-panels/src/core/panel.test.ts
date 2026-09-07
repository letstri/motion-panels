import { beforeEach, describe, expect, it, vi } from 'vitest'

import { noop } from './env'
import { createPanelGroup } from './group'
import type { PanelController } from './panel'
import { createPanel } from './panel'

const PARENT_SIZE = 1000

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
  fill.dataset.motionPanelsFill = ''
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
    const group = createPanelGroup('horizontal')
    const panel = createPanel(group, { size: 200 })
    panel.attach(mount())
    expect(panel.state.end).toBe(true)

    const other = createPanelGroup('horizontal')
    const trailing = createPanel(other, { size: 200 })
    trailing.attach(mount({ fillFirst: true }))
    expect(trailing.state.end).toBe(false)
  })

  it('follows the panel across the fill when the order changes', () => {
    const group = createPanelGroup('horizontal')
    const panel = createPanel(group, { size: 200 })
    const element = mount()
    panel.attach(element)
    expect(panel.state.end).toBe(true)
    expect(group.panels.get('start')).toBe(panel)

    // the same node, moved past the fill panel the way React moves a reordered
    // child: no remount, so only a later sync can notice
    element.parentElement?.append(element)
    panel.sync({ size: 200 })
    expect(panel.state.end).toBe(false)
    expect(group.panels.get('end')).toBe(panel)
    expect(group.panels.get('start')).toBeUndefined()
  })

  it('clamps drag to bounds and reports the size once', () => {
    const onSizeChange = vi.fn()
    const group = createPanelGroup('horizontal')
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

  it('keeps the dragged size once the host syncs it back', () => {
    const options = { onSizeChange: vi.fn(), size: 200 }
    const group = createPanelGroup('horizontal')
    const panel = createPanel(group, options)
    panel.attach(mount())

    panel.drag.start()
    panel.drag.move({ x: 100, y: 0 })
    panel.drag.end()
    // The host re-renders later; until then the panel folds back to 200.
    expect(panel.motion.size.isAnimating()).toBe(true)

    panel.sync({ ...options, size: 300 })

    expect(panel.motion.size.isAnimating()).toBe(false)
    expect(panel.motion.size.get()).toBe(300)
    expect(panel.state.folding).toBe(false)
  })

  it('caps the default max at the space the other panels leave', () => {
    const group = createPanelGroup('horizontal')
    const panel = createPanel(group, { size: 200 })
    panel.attach(mount())
    group.panels.set('end', { target: 300 } as unknown as PanelController)

    expect(panel.bounds()).toEqual({ max: PARENT_SIZE - 300, min: 0 })
  })

  it('collapses past half the minimum and restores on cancel', () => {
    const onCollapsedChange = vi.fn()
    const onSizeChange = vi.fn()
    const group = createPanelGroup('horizontal')
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
    const leading = createPanel(createPanelGroup('horizontal'), {
      onSizeChange,
      size: 200,
    })
    leading.attach(mount())
    leading.resizeByKey(key('ArrowRight'))
    expect(onSizeChange).toHaveBeenLastCalledWith(210)
    leading.resizeByKey(key('ArrowRight', true))
    expect(onSizeChange).toHaveBeenLastCalledWith(250)

    const trailing = createPanel(createPanelGroup('horizontal'), {
      onSizeChange,
      size: 200,
    })
    trailing.attach(mount({ fillFirst: true }))
    trailing.resizeByKey(key('ArrowRight'))
    expect(onSizeChange).toHaveBeenLastCalledWith(190)
  })

  it('unfolds to a size that changed while it was collapsed', () => {
    const options = {
      collapsed: true,
      onCollapsedChange: noop,
      onSizeChange: noop,
      size: 280,
    }
    const panel = createPanel(createPanelGroup('horizontal'), options)
    panel.attach(mount())

    panel.sync({ ...options, size: 200 })
    // the folded panel renders its content before the unfold reaches it
    expect(panel.motion.content.get()).toBe(200)

    panel.sync({ ...options, collapsed: false, size: 200 })
    expect(panel.motion.content.get()).toBe(200)
  })

  it('expands a collapsed panel from the keyboard', () => {
    const onCollapsedChange = vi.fn()
    const onSizeChange = vi.fn()
    const panel = createPanel(createPanelGroup('horizontal'), {
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
