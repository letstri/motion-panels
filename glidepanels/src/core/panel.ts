import type { MotionValue, Transition } from 'motion'

import type { Side } from './axes'
import { clamp, hasFillAfter, isRtl, isSeparator, reducedMotion } from './env'
import type { PanelGroup } from './group'

export const TRANSITION: Transition = {
  duration: 0.25,
  ease: [0.32, 0.72, 0, 1],
}

const KEY_STEP = 10
const KEY_STEP_FAST = 50

export interface PanelOptions {
  collapsed?: boolean
  defaultSize?: number
  maxSize?: number
  minSize?: number
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

const lockBody = (cursor: string) => {
  const { style } = document.body
  const previous = {
    cursor: style.cursor,
    userSelect: style.userSelect,
    webkitUserSelect: style.webkitUserSelect,
  }
  style.cursor = cursor
  style.userSelect = 'none'
  style.webkitUserSelect = 'none'

  return () => {
    style.cursor = previous.cursor
    style.userSelect = previous.userSelect
    style.webkitUserSelect = previous.webkitUserSelect
  }
}

export const createPanel = (
  group: PanelGroup,
  initial: PanelOptions
): PanelController => {
  const { axes, fill, panels } = group
  const { animate, motionValue } = group.motion
  const listeners = new Set<() => void>()
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
  let target = initial.collapsed ? 0 : initial.size
  let state: PanelState = {
    bare: false,
    dragging: false,
    end: undefined,
    folding: false,
  }
  let unlock: (() => void) | undefined

  const notify = () => {
    // oxlint-disable-next-line unicorn/no-useless-spread -- snapshot: a listener may unsubscribe while notifying
    for (const listener of [...listeners]) {
      listener()
    }
  }

  const patch = (next: Partial<PanelState>) => {
    const merged = { ...state, ...next }
    if (
      merged.bare === state.bare &&
      merged.dragging === state.dragging &&
      merged.end === state.end &&
      merged.folding === state.folding
    ) {
      return
    }
    state = merged
    notify()
  }

  const transition = () =>
    reducedMotion.get() ? { duration: 0 } : (options.transition ?? TRANSITION)

  const spread = () => (reducedMotion.get() ? { duration: 0 } : TRANSITION)

  const applyFill = () => {
    if (!state.folding) {
      if (![...panels.values()].some((panel) => panel.state.folding)) {
        fill.size.jump('100%')
      }

      return
    }
    const side: Side = state.end ? 'start' : 'end'
    let free = (element?.parentElement?.[axes.offset] ?? 0) - target
    for (const [key, panel] of panels) {
      if (key !== side) {
        free -= panel.target
      }
    }
    fill.anchor.set(state.end ? 'flex-end' : 'flex-start')
    fill.size.jump(free)
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
      animate(content, to, spread())
    }
    animate(size, to, from === 0 || to === 0 ? transition() : spread())
  }

  const settle = () => {
    if (size.get() === target) {
      setFolding(false)
    }
  }

  const stopSettle = size.on('animationComplete', settle)

  const bounds = () => {
    const total = element?.parentElement?.[axes.offset] ?? 0
    let available = total
    for (const panel of panels.values()) {
      if (panel !== controller) {
        available -= panel.target
      }
    }
    available = Math.max(0, available)
    const min = Math.min(options.minSize ?? 0, available)

    return {
      max: Math.max(min, Math.min(options.maxSize ?? available, available)),
      min,
    }
  }

  const release = () => {
    unlock?.()
    unlock = undefined
    removeEventListener('keydown', onKeyDown, true)
  }

  const finish = () => {
    release()
    patch({ dragging: false })
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      controller.drag.cancel()
    }
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
      const limits = bounds()
      drag.collapsed = options.collapsed === true
      drag.wasCollapsed = drag.collapsed
      drag.max = limits.max
      drag.min = limits.min
      drag.pixels = size.get()
      drag.start = size.get()
      drag.sign =
        (state.end ? 1 : -1) * (axes.point === 'x' && isRtl(element) ? -1 : 1)
      unlock?.()
      unlock = lockBody(cursor)
      addEventListener('keydown', onKeyDown, true)
      setFolding(false)
      patch({ dragging: true })
    },
  }

  const resizeByKey = (event: PanelKeyEvent) => {
    if (event.key === 'Enter') {
      if (!options.onCollapsedChange) {
        return
      }
      event.preventDefault()
      options.onCollapsedChange(!options.collapsed)

      return
    }
    const { max, min } = bounds()
    const fast =
      event.shiftKey || event.key === 'PageUp' || event.key === 'PageDown'
    const flip =
      (state.end ? 1 : -1) * (axes.point === 'x' && isRtl(element) ? -1 : 1)
    const step = (fast ? KEY_STEP_FAST : KEY_STEP) * flip
    const moves: Record<string, number> = {
      End: max,
      Home: min,
      PageDown: target + KEY_STEP_FAST,
      PageUp: target - KEY_STEP_FAST,
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

  const attach = (node: HTMLElement) => {
    element = node
    const beforeFill = hasFillAfter(node)
    const side: Side = beforeFill ? 'start' : 'end'
    patch({
      bare: !isSeparator(
        beforeFill ? node.nextElementSibling : node.previousElementSibling
      ),
      end: beforeFill,
    })
    panels.set(side, controller)
    group.notify()

    return () => {
      release()
      if (panels.get(side) === controller) {
        panels.delete(side)
      }
      element = null
      group.notify()
    }
  }

  const sync = (next: PanelOptions) => {
    options = next
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
    setFolding(size.get() !== target)
    if (size.get() !== target) {
      fold(target)
    }
  }

  const controller: PanelController = {
    attach,
    bounds,
    destroy: () => {
      release()
      stopSettle()
      listeners.clear()
    },
    drag: panelDrag,
    group,
    motion: { content, size },
    get options() {
      return options
    },
    reset: () => {
      if (options.defaultSize !== undefined) {
        if (options.collapsed) {
          options.onCollapsedChange?.(false)
        }
        options.onSizeChange?.(options.defaultSize)
      }
    },
    resizeByKey,
    get state() {
      return state
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    sync,
    get target() {
      return target
    },
  }

  return controller
}
