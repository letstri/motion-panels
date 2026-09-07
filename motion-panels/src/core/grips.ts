import { coarsePointer, emitter } from './env'
import type { PanelController } from './panel'

const HIT_MARGIN_FINE = 5
const HIT_MARGIN_COARSE = 12

export type GripState = 'crossed' | 'held' | null

export interface Point {
  clientX: number
  clientY: number
}

const registry = new Map<HTMLElement, PanelController>()
const bus = emitter()
const marks = { crossed: new Set<HTMLElement>(), held: new Set<HTMLElement>() }

let rects: { element: HTMLElement; rect: DOMRect }[] | null = null
let watching: AbortController | undefined

const invalidate = () => {
  rects = null
}

const measure = () => {
  rects ??= [...registry.keys()].map((element) => ({
    element,
    rect: element.getBoundingClientRect(),
  }))

  return rects
}

const same = (elements: HTMLElement[], current: Set<HTMLElement>) =>
  elements.length === current.size &&
  elements.every((element) => current.has(element))

export const grips = {
  at(point: Point) {
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
      .map(({ element }) => element)

    return hits.length > 1 ? hits : []
  },
  invalidate,
  mark(key: 'crossed' | 'held', elements: HTMLElement[]) {
    if (same(elements, marks[key])) {
      return
    }
    marks[key] = new Set(elements)
    bus.emit()
  },
  partners(elements: HTMLElement[], self: HTMLElement | null) {
    return elements
      .filter((element) => element !== self)
      .map((element) => registry.get(element))
      .filter((controller) => controller !== undefined)
  },
  register(element: HTMLElement, controller: PanelController) {
    registry.set(element, controller)
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
    // Every grip moves when any panel resizes or folds, and that happens
    // without a scroll or a resize, so the cache has to follow the sizes too.
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
