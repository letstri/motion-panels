import type { MotionValue, Transition } from 'motion'
import { animate, motionValue } from 'motion'

import type { Side } from './axes'
import { FILL_ATTRIBUTE, hasFillAfter, isRtl, isSeparator } from './dom'
import { clamp, emitter, reducedMotion } from './env'
import type { PanelGroup } from './group'

export const TRANSITION: Transition = {
  duration: 0.25,
  ease: [0.32, 0.72, 0, 1],
}

const INSTANT: Transition = { duration: 0 }

export const timing = (transition?: Transition): Transition =>
  reducedMotion.get() ? INSTANT : (transition ?? TRANSITION)

const KEY_STEP = 10
const KEY_STEP_FAST = 50

export interface PanelOptions {
  collapsed?: boolean
  maxSize?: number
  minSize?: number
  onCollapsedChange?: (collapsed: boolean) => void
  onSizeChange?: (size: number) => void
  resetSize?: number
  size: number
  transition?: Transition
}

export interface PanelState {
  bare: boolean
  dragging: boolean
  end: boolean | undefined
  folding: boolean
}

export interface PanelKeyEvent {
  key: string
  preventDefault: () => void
  shiftKey: boolean
}

export interface PanelDrag {
  cancel: () => void
  end: () => void
  move: (offset: { x: number; y: number }) => void
  start: (cursor?: string) => void
}

export interface PanelController {
  attach: (element: HTMLElement) => () => void
  bounds: () => { max: number; min: number }
  destroy: () => void
  drag: PanelDrag
  group: PanelGroup
  motion: {
    content: MotionValue<number>
    size: MotionValue<number>
  }
  options: PanelOptions
  reset: () => void
  resizeByKey: (event: PanelKeyEvent) => void
  state: PanelState
  subscribe: (listener: () => void) => () => void
  sync: (options: PanelOptions) => void
  target: number
}

const lockBody = (cursor: string, onEscape: () => void) => {
  const { style } = document.body
  const previous = {
    cursor: style.cursor,
    userSelect: style.userSelect,
    webkitUserSelect: style.webkitUserSelect,
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEscape()
    }
  }
  Object.assign(style, { cursor, userSelect: 'none', webkitUserSelect: 'none' })
  addEventListener('keydown', onKeyDown, true)

  return () => {
    Object.assign(style, previous)
    removeEventListener('keydown', onKeyDown, true)
  }
}

const DEV =
  typeof process === 'undefined' || process.env.NODE_ENV !== 'production'

/** Counts the sized panels either side of the fill: every direct child of the
 * group that is neither the filling panel nor a separator. */
const warnPlacement = (element: HTMLElement, side: Side) => {
  if (!DEV) {
    return
  }
  const siblings = [...(element.parentElement?.children ?? [])]
  const fill = siblings.findIndex((node) => node.hasAttribute(FILL_ATTRIBUTE))
  if (fill === -1) {
    console.warn(
      'Motion Panels: a group needs one filling panel (a Panel with no size) so sized panels can tell which edge they resize.'
    )

    return
  }
  const half =
    side === 'start' ? siblings.slice(0, fill) : siblings.slice(fill + 1)
  const sized = half.filter((node) => !isSeparator(node))
  if (sized.length > 1) {
    console.warn(
      `Motion Panels: ${sized.length} sized panels sit on the "${side}" side of the filling panel. A group holds at most one on each side \u2014 nest a group instead.`
    )
  }
}

export const createPanel = (
  group: PanelGroup,
  initial: PanelOptions
): PanelController => {
  const { axes, fill, panels } = group
  const { clear, emit: notify, subscribe } = emitter()
  const size = motionValue(initial.collapsed ? 0 : initial.size)
  const content = motionValue(initial.size)
  const drag = {
    collapsed: false,
    max: 0,
    min: 0,
    pixels: 0,
    sign: 1,
    start: 0,
    wasCollapsed: false,
  }

  let element: HTMLElement | null = null
  let options = initial
  let target = size.get()
  let state: PanelState = {
    bare: false,
    dragging: false,
    end: undefined,
    folding: false,
  }
  let unlock: (() => void) | undefined

  const patch = (next: Partial<PanelState>) => {
    const changes = Object.entries(next) as [keyof PanelState, unknown][]
    if (changes.every(([key, value]) => state[key] === value)) {
      return
    }
    state = { ...state, ...next }
    notify()
  }

  const spare = () => {
    let free = element?.parentElement?.[axes.offset] ?? 0
    for (const panel of panels.values()) {
      if (panel !== controller) {
        free -= panel.target
      }
    }

    return free
  }

  const sign = () =>
    (state.end ? 1 : -1) * (axes.point === 'x' && isRtl(element) ? -1 : 1)

  const applyFill = () => {
    if (state.folding) {
      fill.anchor.set(state.end ? 'flex-end' : 'flex-start')
      fill.size.jump(spare() - target)
    } else if (![...panels.values()].some((panel) => panel.state.folding)) {
      fill.size.jump('100%')
    }
  }

  const setFolding = (folding: boolean) => {
    if (folding === state.folding) {
      return
    }
    patch({ folding })
    applyFill()
  }

  const fold = (to: number) => {
    const from = size.get()
    if (from === 0) {
      content.jump(to)
    } else if (to > 0) {
      animate(content, to, timing())
    }
    animate(
      size,
      to,
      from === 0 || to === 0 ? timing(options.transition) : timing()
    )
  }

  const stopSettle = size.on('animationComplete', () => {
    if (size.get() === target) {
      setFolding(false)
    }
  })

  const bounds = () => {
    const available = Math.max(0, spare())
    const min = Math.min(options.minSize ?? 0, available)

    return {
      max: Math.max(min, Math.min(options.maxSize ?? available, available)),
      min,
    }
  }

  const release = () => {
    unlock?.()
    unlock = undefined
  }

  const finish = () => {
    release()
    patch({ dragging: false })
  }

  const panelDrag: PanelDrag = {
    cancel: () => {
      if (!state.dragging) {
        return
      }
      size.jump(drag.start)
      content.jump(drag.start)
      if (drag.collapsed !== drag.wasCollapsed) {
        options.onCollapsedChange?.(drag.wasCollapsed)
      }
      finish()
    },
    end: () => {
      if (!state.dragging) {
        return
      }
      finish()
      if (!drag.collapsed) {
        options.onSizeChange?.(drag.pixels)
      }
      if (size.get() !== target) {
        setFolding(true)
        fold(target)
      }
    },
    move: (offset) => {
      const pixels = drag.start + offset[axes.point] * drag.sign
      const collapsed = !!options.onCollapsedChange && pixels < drag.min / 2
      const next = collapsed ? 0 : Math.round(clamp(pixels, drag.min, drag.max))
      if (collapsed !== drag.collapsed) {
        options.onCollapsedChange?.(collapsed)
      }
      size.jump(next)
      if (!collapsed) {
        content.jump(next)
      }
      drag.collapsed = collapsed
      drag.pixels = next
    },
    start: (cursor = axes.cursor) => {
      const collapsed = !!options.collapsed
      const start = size.get()
      Object.assign(drag, {
        ...bounds(),
        collapsed,
        pixels: start,
        sign: sign(),
        start,
        wasCollapsed: collapsed,
      })
      release()
      unlock = lockBody(cursor, panelDrag.cancel)
      setFolding(false)
      patch({ dragging: true })
    },
  }

  const resizeByKey = (event: PanelKeyEvent) => {
    if (event.key === 'Enter') {
      if (options.onCollapsedChange) {
        event.preventDefault()
        options.onCollapsedChange(!options.collapsed)
      }

      return
    }
    const { max, min } = bounds()
    const fast =
      event.shiftKey || event.key === 'PageUp' || event.key === 'PageDown'
    const step = (fast ? KEY_STEP_FAST : KEY_STEP) * sign()
    const moves: Record<string, number> = {
      End: max,
      Home: min,
      PageDown: target + step,
      PageUp: target - step,
      [axes.grow]: target + step,
      [axes.shrink]: target - step,
    }
    const next = moves[event.key]
    if (next === undefined) {
      return
    }
    event.preventDefault()
    const value = clamp(next, min, max)
    if (options.collapsed && value > 0) {
      options.onCollapsedChange?.(false)
    }
    options.onSizeChange?.(value)
  }

  const unplace = () => {
    for (const [key, panel] of panels) {
      if (panel === controller) {
        panels.delete(key)
      }
    }
  }

  const place = () => {
    if (!element) {
      return
    }
    const end = hasFillAfter(element)
    const side: Side = end ? 'start' : 'end'
    if (panels.get(side) !== controller) {
      warnPlacement(element, side)
      unplace()
      panels.set(side, controller)
      group.notify()
    }
    const seam = end
      ? element.nextElementSibling
      : element.previousElementSibling
    patch({ bare: !isSeparator(seam), end })
  }

  const sync = (next: PanelOptions) => {
    options = next
    place()
    if (size.get() === 0 && !state.dragging) {
      content.jump(next.size)
    }
    const value = next.collapsed ? 0 : next.size
    if (value === target) {
      return
    }
    target = value
    notify()
    group.notify()
    if (state.dragging) {
      return
    }
    if (size.get() === target) {
      setFolding(false)
      size.jump(target)
      content.jump(target)
    } else {
      setFolding(true)
      fold(target)
    }
  }

  const controller: PanelController = {
    attach: (node) => {
      element = node
      place()

      return () => {
        release()
        unplace()
        element = null
        group.notify()
      }
    },
    bounds,
    destroy: () => {
      release()
      stopSettle()
      clear()
    },
    drag: panelDrag,
    group,
    motion: { content, size },
    get options() {
      return options
    },
    reset: () => {
      if (options.collapsed) {
        options.onCollapsedChange?.(false)
      }
      options.onSizeChange?.(options.resetSize ?? initial.size)
    },
    resizeByKey,
    get state() {
      return state
    },
    subscribe,
    sync,
    get target() {
      return target
    },
  }

  return controller
}
