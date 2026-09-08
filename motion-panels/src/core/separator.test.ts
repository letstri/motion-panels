import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createPanelGroup } from './group'
import { createPanel } from './panel'
import { attachSeparator } from './separator'

const mount = () => {
  document.body.innerHTML = ''
  const root = document.createElement('div')
  const panel = document.createElement('div')
  const grip = document.createElement('div')
  const fill = document.createElement('div')
  fill.dataset.motionPanelsFill = ''
  panel.append(grip)
  root.append(panel, fill)
  document.body.append(root)
  Object.defineProperty(root, 'clientWidth', { value: 1000 })
  grip.setPointerCapture = vi.fn()

  return { grip, panel }
}

const pointer = (type: string, clientX: number) =>
  new PointerEvent(type, { clientX, clientY: 0, pointerId: 1 })

describe('attachSeparator', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('drags the panel past the pan threshold and reports the size', () => {
    const onSizeChange = vi.fn()
    const group = createPanelGroup('horizontal')
    const controller = createPanel(group, {
      maxSize: 400,
      onSizeChange,
      size: 200,
    })
    const { grip, panel } = mount()
    controller.attach(panel)
    const detach = attachSeparator(grip, group, controller)

    expect(grip.getAttribute('aria-valuenow')).toBe('200')
    expect(grip.getAttribute('aria-valuemax')).toBe('400')

    grip.dispatchEvent(pointer('pointerdown', 0))
    grip.dispatchEvent(pointer('pointermove', 2))
    expect(controller.state.dragging).toBe(false)
    grip.dispatchEvent(pointer('pointermove', 50))
    expect(controller.state.dragging).toBe(true)
    expect(grip.dataset.resizing).toBe('')
    expect(controller.motion.size.get()).toBe(250)
    grip.dispatchEvent(pointer('pointerup', 50))

    expect(onSizeChange).toHaveBeenCalledWith(250)
    expect(grip.dataset.resizing).toBeUndefined()

    grip.dispatchEvent(new MouseEvent('dblclick'))
    expect(onSizeChange).not.toHaveBeenCalledWith(200)

    detach()
    grip.dispatchEvent(pointer('pointerdown', 0))
    grip.dispatchEvent(pointer('pointermove', 50))
    expect(controller.state.dragging).toBe(false)
  })

  it('finds the panel its slot resizes and follows the group', () => {
    const group = createPanelGroup('horizontal')
    const controller = createPanel(group, { size: 200 })
    const { grip, panel } = mount()
    const slot = document.createElement('div')
    slot.dataset.motionPanelsSeparator = ''
    slot.append(grip)
    panel.after(slot)
    attachSeparator(grip, group)
    expect(grip.hasAttribute('aria-valuenow')).toBe(false)

    controller.attach(panel)
    expect(grip.getAttribute('aria-valuenow')).toBe('200')

    grip.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false })
    )
  })
})
