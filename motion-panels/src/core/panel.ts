import type { MotionValue, Transition } from 'motion'
import { animate, motionValue } from 'motion'

import type { Side } from './axes'
import {
  FILL_ATTRIBUTE,
  hasFillAfter,
  isRtl,
  isSeparator,
  lockBody,
} from './dom'
import type { PanelGroup } from './group'
import { timing } from './transition'
import { clamp, emitter } from './utils'

const KEY_STEP = 10
const KEY_STEP_FAST = 50

/** Pixels, or a percentage of the group extent such as `'30%'`. */
export type Size = number | `${number}%`

export interface PanelOptions {
  collapsed?: boolean
  defaultSize?: number
  maxSize?: Size
  minSize?: Size
  onCollapsedChange?: (collapsed: boolean) => void
  onSizeChange?: (size: number) => void
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
  motion: {
    content: MotionValue<number>
    size: MotionValue<number>
  }
  options: PanelOptions
  reset: () => void
  resizeByKey: (event: PanelKeyEvent) => void
  state: PanelState
  subscribe: (listener: () => void) => () => void
  sync: (options: PanelOptions, mounting?: boolean) => void
  target: number
}

const DEV =
  typeof process === 'undefined' || process.env.NODE_ENV !== 'production'

const toPixels = (value: Size | undefined, extent: number) =>
  typeof value === 'string'
    ? (Number(value.slice(0, -1)) / 100) * extent
    : value

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
      `Motion Panels: ${sized.length} sized panels sit on the "${side}" side of the filling panel. A group holds at most one on each side — nest a group instead.`
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

  const session = {
    collapsed: false,
    max: 0,
    min: 0,
    sign: 1,
    start: 0,
    wasCollapsed: false,
  }

  const patch = (next: Partial<PanelState>) => {
    const changes = Object.entries(next) as [keyof PanelState, unknown][]
    if (changes.some(([key, value]) => state[key] !== value)) {
      state = { ...state, ...next }
      notify()
    }
  }

  const extent = () => element?.parentElement?.[axes.client] ?? 0

  const freeSpace = () => {
    let free = extent()
    for (const panel of panels.values()) {
      if (panel !== controller) {
        free -= panel.target
      }
    }

    return free
  }

  const bounds = () => {
    const available = Math.max(0, freeSpace())
    const total = extent()
    const min = Math.min(toPixels(options.minSize, total) ?? 0, available)
    const max = toPixels(options.maxSize, total) ?? available

    return { max: Math.max(min, Math.min(max, available)), min }
  }

  const growSign = () =>
    (state.end ? 1 : -1) * (axes.point === 'x' && isRtl(element) ? -1 : 1)

  const setFolding = (folding: boolean) => {
    if (folding === state.folding) {
      return
    }
    patch({ folding })
    if (folding) {
      fill.anchor.set(state.end ? 'flex-end' : 'flex-start')
      fill.size.jump(freeSpace() - target)
    } else if (![...panels.values()].some((panel) => panel.state.folding)) {
      fill.size.jump('100%')
    }
  }

  const fold = (to: number, from: number, mounting?: boolean) => {
    setFolding(true)
    const closed = size.get() === 0
    if (closed) {
      content.jump(to)
    }
    const start = () => {
      if (!closed && to > 0) {
        animate(content, to, timing())
      }
      const transition =
        from === 0 || to === 0 ? timing(options.transition) : timing()
      animate(size, to, transition)
    }
    if (closed && mounting) {
      queueMicrotask(start)
    } else {
      start()
    }
  }

  const stopSettle = size.on('animationComplete', () => {
    if (size.get() === target) {
      setFolding(false)
    }
  })

  const release = () => {
    unlock?.()
    unlock = undefined
  }

  const stopDragging = () => {
    release()
    patch({ dragging: false })
  }

  const drag: PanelDrag = {
    start: (cursor = axes.cursor) => {
      const collapsed = !!options.collapsed
      Object.assign(session, {
        ...bounds(),
        collapsed,
        sign: growSign(),
        start: size.get(),
        wasCollapsed: collapsed,
      })
      release()
      unlock = lockBody(cursor, drag.cancel)
      setFolding(false)
      patch({ dragging: true })
    },
    move: (offset) => {
      const pixels = session.start + offset[axes.point] * session.sign
      const collapsed = !!options.onCollapsedChange && pixels < session.min / 2
      const next = collapsed
        ? 0
        : Math.round(clamp(pixels, session.min, session.max))
      if (collapsed !== session.collapsed) {
        options.onCollapsedChange?.(collapsed)
      }
      size.jump(next)
      if (!collapsed) {
        content.jump(next)
      }
      session.collapsed = collapsed
    },
    end: () => {
      if (!state.dragging) {
        return
      }
      stopDragging()
      if (!session.collapsed) {
        options.onSizeChange?.(size.get())
      }
      if (size.get() !== target) {
        fold(target, size.get())
      }
    },
    cancel: () => {
      if (!state.dragging) {
        return
      }
      size.jump(session.start)
      content.jump(session.start)
      if (session.collapsed !== session.wasCollapsed) {
        options.onCollapsedChange?.(session.wasCollapsed)
      }
      stopDragging()
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
    const step = (fast ? KEY_STEP_FAST : KEY_STEP) * growSign()
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
    for (const [side, panel] of panels) {
      if (panel === controller) {
        panels.delete(side)
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
    const neighbour = end
      ? element.nextElementSibling
      : element.previousElementSibling
    patch({ bare: !isSeparator(neighbour), end })
  }

  const sync = (next: PanelOptions, mounting?: boolean) => {
    options = next
    place()
    if (size.get() === 0 && !state.dragging) {
      content.jump(next.size)
    }
    const value = next.collapsed ? 0 : next.size
    if (value === target) {
      return
    }
    const from = target
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
      fold(target, from, mounting)
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
    drag,
    motion: { content, size },
    get options() {
      return options
    },
    reset: () => {
      if (options.collapsed) {
        options.onCollapsedChange?.(false)
      }
      options.onSizeChange?.(options.defaultSize ?? initial.size)
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
