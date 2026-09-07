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

  const card =
    'flex h-full w-full flex-col overflow-hidden rounded-[9px] border border-line bg-surface'
  const head =
    'flex h-8 flex-none items-center justify-between gap-2.5 whitespace-nowrap border-line border-b px-2.5 text-[12px] text-muted'
  const badge =
    'rounded-[5px] bg-sunken px-1.5 py-px font-mono text-[11px] text-text tabular-nums'

  content.className = card
  content.innerHTML = `<div class="${head}"><span>Files</span><span class="${badge}">240px</span></div>`
  fill.innerHTML = `<div class="${card}"><div class="${head}"><span>Editor</span></div></div>`
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
    insetInlineEnd: '-7px',
    position: 'absolute',
    touchAction: 'none',
    width: '14px',
  })

  grip.className =
    "z-10 flex items-center justify-center outline-none after:h-[calc(100%-20px)] after:w-0.5 after:rounded-full after:bg-line-strong after:transition-colors after:duration-150 after:content-[''] hover:after:bg-muted focus-visible:after:bg-muted active:after:bg-accent data-resizing:after:bg-accent"
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

  const label = content.querySelector('span:last-child')
  const stopSize = controller.motion.size.on('change', (value) => {
    const width = Math.max(0, value)
    panel.style.width = `${width}px`
    grip.ariaValueNow = String(controller.target)
    if (label) {
      label.textContent = `${Math.round(width)}px`
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
    <figure className="mt-5 flex flex-col gap-2.5">
      <div className="border-line bg-sunken h-[300px] rounded-[14px] border p-2.5">
        <div ref={stageRef} style={{ height: '100%' }} />
      </div>
    </figure>
  )
}
// #endregion
