'use client'

import { createPanel, createPanelGroup, FILL_ATTRIBUTE } from 'glidepanels'
import { animate, motionValue } from 'motion'
import { useEffect, useRef } from 'react'

// #region core
export const mountSplit = (root: HTMLElement) => {
  const group = createPanelGroup({ animate, motionValue }, 'horizontal')

  const panel = document.createElement('div')
  const content = document.createElement('div')
  const grip = document.createElement('div')
  const fill = document.createElement('div')

  content.className = 'card'
  content.innerHTML =
    '<div class="card-head"><span>Files</span><span class="badge">240px</span></div>'
  fill.innerHTML =
    '<div class="card"><div class="card-head"><span>Editor</span></div></div>'
  fill.setAttribute(FILL_ATTRIBUTE, '')

  Object.assign(root.style, {
    display: 'flex',
    flexDirection: group.axes.direction,
    height: '100%',
    overflow: 'clip',
    width: '100%',
  })
  Object.assign(panel.style, {
    display: 'flex',
    flexShrink: '0',
    padding: '3px',
    position: 'relative',
    width: '240px',
  })
  Object.assign(content.style, { flexShrink: '0', height: '100%' })
  Object.assign(fill.style, { flex: '1', minWidth: '0', padding: '3px' })
  Object.assign(grip.style, {
    insetBlock: '0',
    insetInlineEnd: '0',
    position: 'absolute',
    touchAction: 'none',
  })

  grip.role = 'separator'
  grip.tabIndex = 0
  grip.ariaLabel = 'Resize files'
  grip.ariaOrientation = group.axes.separator

  panel.append(content, grip)
  root.append(panel, fill)

  let size = 240
  const base = {
    defaultSize: 240,
    maxSize: 420,
    minSize: 160,
    onSizeChange: (next: number) => {
      size = next
      controller.sync({ ...base, size })
    },
  }
  const controller = createPanel(group, { ...base, size })
  const detach = controller.attach(panel)

  const badge = content.querySelector('.badge')
  const stopSize = controller.motion.size.on('change', (value) => {
    const width = Math.max(0, value)
    panel.style.width = `${width}px`
    grip.ariaValueNow = String(controller.target)
    if (badge) {
      badge.textContent = `${Math.round(width)}px`
    }
  })
  const stopContent = controller.motion.content.on('change', (value) => {
    content.style.width = `${value}px`
  })

  content.style.width = `${size}px`
  grip.ariaValueNow = String(size)

  const onPointerDown = (event: PointerEvent) => {
    const origin = { x: event.clientX, y: event.clientY }
    grip.setPointerCapture(event.pointerId)
    controller.drag.start()

    const onMove = (move: PointerEvent) => {
      controller.drag.move({
        x: move.clientX - origin.x,
        y: move.clientY - origin.y,
      })
    }
    const onUp = () => {
      controller.drag.end()
      grip.removeEventListener('pointermove', onMove)
      grip.removeEventListener('pointerup', onUp)
    }

    grip.addEventListener('pointermove', onMove)
    grip.addEventListener('pointerup', onUp)
  }
  const onKeyDown = (event: KeyboardEvent) => controller.resizeByKey(event)
  const onDoubleClick = () => controller.reset()

  grip.addEventListener('pointerdown', onPointerDown)
  grip.addEventListener('keydown', onKeyDown)
  grip.addEventListener('dblclick', onDoubleClick)

  return () => {
    grip.removeEventListener('pointerdown', onPointerDown)
    grip.removeEventListener('keydown', onKeyDown)
    grip.removeEventListener('dblclick', onDoubleClick)
    stopContent()
    stopSize()
    detach()
    controller.destroy()
    root.replaceChildren()
  }
}

export const CoreDemo = () => {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = stageRef.current

    return root ? mountSplit(root) : undefined
  }, [])

  return (
    <figure className="demo">
      <div className="stage">
        <div ref={stageRef} style={{ height: '100%' }} />
      </div>
    </figure>
  )
}
// #endregion
