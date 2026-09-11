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
const OVERSHOOT = 22

export type Size = number | `${number}%`

export interface PanelOptions<S extends Size = Size> {
  collapsed?: boolean
  defaultSize?: S
  maxSize?: Size
  minSize?: Size
  onCollapsedChange?: (collapsed: boolean) => void
  // oxlint-disable-next-line typescript/method-signature-style -- bivariant on purpose: a controller of one form must still register in the group
  onSizeChange?(size: S): void
  size: S
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

export interface PanelController<S extends Size = Size> {
  attach: (element: HTMLElement) => () => void
  bounds: () => { max: number; min: number }
  destroy: () => void
  drag: PanelDrag
  motion: {
    content: MotionValue<number>
    size: MotionValue<number>
  }
  options: PanelOptions<S>
  reset: () => void
  resizeByKey: (event: PanelKeyEvent) => void
  state: PanelState
  subscribe: (listener: () => void) => () => void
  // oxlint-disable-next-line typescript/method-signature-style -- bivariant on purpose, see onSizeChange
  sync(options: PanelOptions<S>, mounting?: boolean): void
  target: number
}

const DEV =
  typeof process === 'undefined' || process.env.NODE_ENV !== 'production'

const overshoot = (excess: number) => {
  const distance = Math.abs(excess)

  return (Math.sign(excess) * OVERSHOOT * distance) / (distance + OVERSHOOT)
}

const toPixels = (value: Size, extent: number) =>
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

export const createPanel = <S extends Size>(
  group: PanelGroup,
  initial: PanelOptions<S>
): PanelController<S> => {
  const { axes, fill, panels } = group
  const { clear, emit: notify, subscribe } = emitter()

  let element: HTMLElement | null = null
  let options: PanelOptions<S> = initial

  const extent = () => element?.parentElement?.[axes.client] ?? 0
  const measure = () => {
    const pixels = toPixels(options.size, extent())

    return typeof options.size === 'string' ? Math.round(pixels) : pixels
  }
  const report = (value: number) => {
    if (typeof options.size !== 'string') {
      return value as S
    }
    const total = extent()

    return `${total > 0 ? Math.round((value / total) * 10_000) / 100 : 0}%` as S
  }

  const size = motionValue(initial.collapsed ? 0 : measure())
  const content = motionValue(measure())

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

  const available = () => {
    const filler = [...(element?.parentElement?.children ?? [])].find((node) =>
      node.hasAttribute(FILL_ATTRIBUTE)
    ) as HTMLElement | undefined
    let room = filler
      ? // oxlint-disable-next-line unicorn/prefer-number-coercion -- a computed width carries its unit: Number('649px') is NaN
        Number.parseFloat(getComputedStyle(filler)[axes.extent])
      : 0
    for (const panel of panels.values()) {
      room +=
        panel.motion.size.get() - (panel === controller ? 0 : panel.target)
    }

    return Math.max(0, room)
  }

  const bounds = () => {
    const room = available()
    const total = extent()
    const min = Math.min(
      options.minSize === undefined ? 0 : toPixels(options.minSize, total),
      room
    )
    const max =
      options.maxSize === undefined ? room : toPixels(options.maxSize, total)

    return { max: Math.max(min, Math.min(max, room)), min }
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
      fill.size.jump(available() - target)
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
      const clamped = clamp(pixels, session.min, session.max)
      const next = collapsed
        ? 0
        : Math.max(0, Math.round(clamped + overshoot(pixels - clamped)))
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
        options.onSizeChange?.(
          report(Math.round(clamp(size.get(), session.min, session.max)))
        )
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
    options.onSizeChange?.(report(value))
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

  const refit = () => {
    if (typeof options.size !== 'string' || state.dragging || state.folding) {
      return
    }
    const value = options.collapsed ? 0 : measure()
    content.jump(measure())
    if (value === target) {
      return
    }
    target = value
    size.jump(target)
    notify()
    group.notify()
  }

  const sync = (next: PanelOptions<S>, mounting?: boolean) => {
    options = next
    place()
    const measured = measure()
    if (size.get() === 0 && !state.dragging) {
      content.jump(measured)
    }
    const value = next.collapsed ? 0 : measured
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

  const controller: PanelController<S> = {
    attach: (node) => {
      element = node
      place()
      refit()
      const parent = node.parentElement
      const watch = parent ? new ResizeObserver(refit) : undefined
      if (parent) {
        watch?.observe(parent)
      }

      return () => {
        watch?.disconnect()
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
