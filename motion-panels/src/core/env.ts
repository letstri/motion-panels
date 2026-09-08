const media = (query: string) => {
  let list: MediaQueryList | undefined
  const get = () => {
    list ??= typeof matchMedia === 'function' ? matchMedia(query) : undefined

    return list
  }

  return {
    get: () => get()?.matches ?? false,
    subscribe: (listener: () => void) => {
      get()?.addEventListener('change', listener)

      return () => get()?.removeEventListener('change', listener)
    },
  }
}

export const coarsePointer = media('(pointer: coarse)')
export const reducedMotion = media('(prefers-reduced-motion: reduce)')

const EDGE_SIZE_FINE = 8
const EDGE_SIZE_COARSE = 20

export const edgeSize = () =>
  coarsePointer.get() ? EDGE_SIZE_COARSE : EDGE_SIZE_FINE
