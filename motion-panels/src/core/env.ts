export const noop = () => {
  //
}

export const emitter = () => {
  const listeners = new Set<() => void>()

  return {
    clear: () => listeners.clear(),
    emit: () => {
      // oxlint-disable-next-line unicorn/no-useless-spread -- snapshot: a listener may unsubscribe while notifying
      for (const listener of [...listeners]) {
        listener()
      }
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}

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

export const EDGE_SIZE_FINE = 8
export const EDGE_SIZE_COARSE = 20

export const edgeSize = () =>
  coarsePointer.get() ? EDGE_SIZE_COARSE : EDGE_SIZE_FINE

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)
