import { coarsePointer } from './env'
import type { PanelController } from './panel'

const HIT_MARGIN_FINE = 5
const HIT_MARGIN_COARSE = 12

export type GripState = 'crossed' | 'held' | null

export interface Point {
  clientX: number
  clientY: number
}

const registry = new Map<HTMLElement, PanelController>()
const listeners = new Set<() => void>()

let rects: { element: HTMLElement; rect: DOMRect }[] | null = null
let observing = false
let crossed = new Set<HTMLElement>()
let held = new Set<HTMLElement>()

const invalidate = () => {
  rects = null
}

const observe = () => {
  if (observing || typeof window === 'undefined') {
    return
  }
  observing = true
  addEventListener('resize', invalidate)
  addEventListener('scroll', invalidate, { capture: true, passive: true })
}

const unobserve = () => {
  if (!observing) {
    return
  }
  observing = false
  removeEventListener('resize', invalidate)
  removeEventListener('scroll', invalidate, { capture: true })
}

const measure = () => {
  rects ??= [...registry.keys()].map((element) => ({
    element,
    rect: element.getBoundingClientRect(),
  }))

  return rects
}

const emit = () => {
  // oxlint-disable-next-line unicorn/no-useless-spread -- snapshot: a listener may unsubscribe while notifying
  for (const listener of [...listeners]) {
    listener()
  }
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
    if (key === 'crossed') {
      if (same(elements, crossed)) {
        return
      }
      crossed = new Set(elements)
    } else {
      if (same(elements, held)) {
        return
      }
      held = new Set(elements)
    }
    emit()
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
    observe()

    return () => {
      registry.delete(element)
      crossed.delete(element)
      held.delete(element)
      invalidate()
      if (registry.size === 0) {
        unobserve()
      }
    }
  },
  state(element: HTMLElement | null): GripState {
    if (!element) {
      return null
    }
    if (held.has(element)) {
      return 'held'
    }

    return crossed.has(element) ? 'crossed' : null
  },
  subscribe(listener: () => void) {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  },
}
