const noop = () => {
  // media queries are unavailable outside the browser
}

const createMediaStore = (query: string) => {
  let list: MediaQueryList | null = null
  const resolve = () => {
    if (!list && typeof matchMedia === 'function') {
      list = matchMedia(query)
    }

    return list
  }

  return {
    get: () => resolve()?.matches ?? false,
    subscribe: (listener: () => void) => {
      const media = resolve()
      if (!media) {
        return noop
      }
      media.addEventListener('change', listener)

      return () => media.removeEventListener('change', listener)
    },
  }
}

export const coarsePointer = createMediaStore('(pointer: coarse)')

export const reducedMotion = createMediaStore(
  '(prefers-reduced-motion: reduce)'
)

export const EDGE_SIZE_FINE = 8
export const EDGE_SIZE_COARSE = 20

export const edgeSize = () =>
  coarsePointer.get() ? EDGE_SIZE_COARSE : EDGE_SIZE_FINE

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const isRtl = (element: Element | null) =>
  !!element && getComputedStyle(element).direction === 'rtl'

export const FILL_ATTRIBUTE = 'data-glidepanels-fill'
export const SEPARATOR_ATTRIBUTE = 'data-glidepanels-separator'

export const hasFillAfter = (node: Element | null) => {
  for (
    let sibling = node?.nextElementSibling ?? null;
    sibling;
    sibling = sibling.nextElementSibling
  ) {
    if (sibling.hasAttribute(FILL_ATTRIBUTE)) {
      return true
    }
  }

  return false
}

export const isSeparator = (node: Element | null) =>
  node?.hasAttribute(SEPARATOR_ATTRIBUTE) ?? false
