export const noop = () => {
  //
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

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
