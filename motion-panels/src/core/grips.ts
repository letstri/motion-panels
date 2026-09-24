import type { Axes } from './axes'
import { coarsePointer } from './env'
import type { PanelController } from './panel'
import { emitter } from './utils'

const HIT_MARGIN_FINE = 5
const HIT_MARGIN_COARSE = 12

export type GripState = 'crossed' | 'held' | null

export interface Point {
  clientX: number
  clientY: number
}

const registry = new Map<
  HTMLElement,
  { axis: Axes['axis']; controller: PanelController }
>()
const bus = emitter()
const marks = { crossed: new Set<HTMLElement>(), held: new Set<HTMLElement>() }

let rects:
  | { axis: Axes['axis']; element: HTMLElement; rect: DOMRect }[]
  | null = null
let watching: AbortController | undefined

const invalidate = () => {
  rects = null
}

const measure = () => {
  rects ??= [...registry].map(([element, { axis }]) => ({
    axis,
    element,
    rect: element.getBoundingClientRect(),
  }))

  return rects
}

const sameSet = (elements: HTMLElement[], current: Set<HTMLElement>) =>
  elements.length === current.size &&
  elements.every((element) => current.has(element))

export const grips = {
  // Grips under the point, one per axis with `self` first: parallel grips
  // stacked in one place (panels folded to the same edge) never move together.
  at(point: Point, self?: HTMLElement) {
    if (registry.size < 2) {
      return []
    }
    const margin = coarsePointer.get() ? HIT_MARGIN_COARSE : HIT_MARGIN_FINE
    const hits = measure()
      .filter(
        ({ rect }) =>
          point.clientX >= rect.left - margin &&
          point.clientX <= rect.right + margin &&
          point.clientY >= rect.top - margin &&
          point.clientY <= rect.bottom + margin
      )
      .toSorted(
        (a, b) => Number(b.element === self) - Number(a.element === self)
      )
    const axes = new Map<Axes['axis'], HTMLElement>()
    for (const { axis, element } of hits) {
      if (!axes.has(axis)) {
        axes.set(axis, element)
      }
    }

    return axes.size > 1 ? [...axes.values()] : []
  },
  invalidate,
  mark(key: 'crossed' | 'held', elements: HTMLElement[]) {
    if (sameSet(elements, marks[key])) {
      return
    }
    marks[key] = new Set(elements)
    bus.emit()
  },
  partners(elements: HTMLElement[], self: HTMLElement | null) {
    return elements
      .filter((element) => element !== self)
      .map((element) => registry.get(element)?.controller)
      .filter((controller) => controller !== undefined)
  },
  register(
    element: HTMLElement,
    controller: PanelController,
    axis: Axes['axis']
  ) {
    registry.set(element, { axis, controller })
    invalidate()
    if (!watching && typeof window !== 'undefined') {
      watching = new AbortController()
      const { signal } = watching
      addEventListener('resize', invalidate, { signal })
      addEventListener('scroll', invalidate, {
        capture: true,
        passive: true,
        signal,
      })
    }
    const stop = controller.motion.size.on('change', invalidate)

    return () => {
      stop()
      registry.delete(element)
      marks.crossed.delete(element)
      marks.held.delete(element)
      invalidate()
      if (registry.size === 0) {
        watching?.abort()
        watching = undefined
      }
    }
  },
  state(element: HTMLElement | null): GripState {
    if (!element) {
      return null
    }

    return marks.held.has(element)
      ? 'held'
      : marks.crossed.has(element)
        ? 'crossed'
        : null
  },
  subscribe: bus.subscribe,
}
