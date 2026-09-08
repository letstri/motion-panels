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
  Object.defineProperty(parent, 'clientWidth', { value: PARENT_SIZE })

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

  it('pages in the same direction as the arrows', () => {
    const onSizeChange = vi.fn()
    const leading = createPanel(createPanelGroup('horizontal'), {
      onSizeChange,
      size: 200,
    })
    leading.attach(mount())
    leading.resizeByKey(key('PageDown'))
    expect(onSizeChange).toHaveBeenLastCalledWith(250)

    const trailing = createPanel(createPanelGroup('horizontal'), {
      onSizeChange,
      size: 200,
    })
    trailing.attach(mount({ fillFirst: true }))
    trailing.resizeByKey(key('PageDown'))
    expect(onSizeChange).toHaveBeenLastCalledWith(150)
  })

  it('resets to the mounted size, or to resetSize when given', () => {
    const onSizeChange = vi.fn()
    const panel = createPanel(createPanelGroup('horizontal'), {
      onSizeChange,
      size: 200,
    })
    panel.attach(mount())

    panel.sync({ onSizeChange, size: 320 })
    panel.reset()
    expect(onSizeChange).toHaveBeenLastCalledWith(200)

    panel.sync({ onSizeChange, resetSize: 90, size: 320 })
    panel.reset()
    expect(onSizeChange).toHaveBeenLastCalledWith(90)
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
    expect(panel.motion.content.get()).toBe(200)

    panel.sync({ ...options, collapsed: false, size: 200 })
    expect(panel.motion.content.get()).toBe(200)
  })

  it('warns when the group cannot place a sized panel', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop)

    createPanel(createPanelGroup('horizontal'), { size: 200 }).attach(mount())
    expect(warn).not.toHaveBeenCalled()

    document.body.innerHTML = ''
    const parent = document.createElement('div')
    const lone = document.createElement('div')
    parent.append(lone)
    document.body.append(parent)
    createPanel(createPanelGroup('horizontal'), { size: 200 }).attach(lone)
    expect(warn.mock.lastCall?.[0]).toContain('needs one filling panel')

    document.body.innerHTML = ''
    const crowd = document.createElement('div')
    const first = document.createElement('div')
    const second = document.createElement('div')
    const fill = document.createElement('div')
    fill.dataset.motionPanelsFill = ''
    crowd.append(first, second, fill)
    document.body.append(crowd)
    const group = createPanelGroup('horizontal')
    createPanel(group, { size: 200 }).attach(first)
    createPanel(group, { size: 200 }).attach(second)
    expect(warn.mock.lastCall?.[0]).toContain('sized panels sit on the "start"')

    warn.mockRestore()
  })

  it('restores the body cursor after two panels drag together', () => {
    const first = createPanel(createPanelGroup('horizontal'), { size: 200 })
    const second = createPanel(createPanelGroup('horizontal'), { size: 200 })
    first.attach(mount())
    second.attach(mount())

    first.drag.start('move')
    second.drag.start('move')
    expect(document.body.style.cursor).toBe('move')

    first.drag.end()
    second.drag.end()
    expect(document.body.style.cursor).toBe('')
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
