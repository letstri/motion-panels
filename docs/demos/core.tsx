'use client'

import { cn } from 'cn'
import {
  attachSeparator,
  createPanel,
  createPanelGroup,
  FILL_ATTRIBUTE,
} from 'motion-panels'
import { useEffect, useRef } from 'react'

import { badgeVariants } from '@/components/ui/badge'

import { CARD, CARD_HEAD, SEPARATOR, SIZE_BADGE } from './shared'

const mountSplit = (root: HTMLElement) => {
  const group = createPanelGroup('horizontal')

  const panel = document.createElement('div')
  const content = document.createElement('div')
  const grip = document.createElement('div')
  const fill = document.createElement('div')

  const badge = cn(badgeVariants({ variant: 'secondary' }), SIZE_BADGE)

  content.innerHTML = `<div class="${CARD}"><div class="${CARD_HEAD}"><span>Files</span><span class="${badge}">240px</span></div></div>`
  fill.innerHTML = `<div class="${CARD}"><div class="${CARD_HEAD}"><span>Editor</span></div></div>`
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
    position: 'relative',
    width: '240px',
  })
  Object.assign(content.style, {
    flexShrink: '0',
    height: '100%',
    padding: '3px',
  })
  Object.assign(fill.style, { flex: '1', minWidth: '0', padding: '3px' })
  Object.assign(grip.style, {
    insetBlock: '0',
    insetInlineEnd: '-7px',
    position: 'absolute',
    touchAction: 'none',
  })

  grip.className = SEPARATOR
  grip.role = 'separator'
  grip.tabIndex = 0
  grip.ariaLabel = 'Resize files'
  grip.ariaOrientation = group.axes.separator

  panel.append(content, grip)
  root.append(panel, fill)

  let size = 240
  const base = {
    maxSize: 420,
    minSize: 160,
    onSizeChange: (next: number) => {
      size = next
      controller.sync({ ...base, size })
    },
  }
  const controller = createPanel(group, { ...base, size })
  const detach = controller.attach(panel)
  const detachGrip = attachSeparator(grip, group, controller)

  const label = content.querySelector('span:last-child')
  const stopSize = controller.motion.size.on('change', (value) => {
    const width = Math.max(0, value)
    panel.style.width = `${width}px`
    if (label) {
      label.textContent = `${Math.round(width)}px`
    }
  })
  const stopContent = controller.motion.content.on('change', (value) => {
    content.style.width = `${value}px`
  })

  content.style.width = `${size}px`

  return () => {
    detachGrip()
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
    <figure className="bg-well mt-6 h-[300px] border p-2.5">
      <div ref={stageRef} style={{ height: '100%' }} />
    </figure>
  )
}
