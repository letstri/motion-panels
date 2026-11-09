import type { Axes } from './axes'
import type { PanelGroup } from './group'
import type { PanelController } from './panel'

export interface PinSource {
  extent: Axes['extent']
  // Fires on every frame the box changes size.
  onMove: (listener: () => void) => () => void
  // Pixels the box can still grow by in the drag or fold under way; null at rest.
  slack: () => number | null
  subscribe: (listener: () => void) => () => void
}

const PAUSE = 120

export const pinSource = {
  fill: (group: PanelGroup): PinSource => ({
    extent: group.axes.extent,
    onMove: (listener) => {
      let stops: (() => void)[] = []
      const watch = () => {
        for (const stop of stops) {
          stop()
        }
        stops = [...group.panels.values()].map((panel) =>
          panel.motion.size.on('change', listener)
        )
      }
      watch()
      const unsubscribe = group.subscribe(watch)

      return () => {
        unsubscribe()
        for (const stop of stops) {
          stop()
        }
      }
    },
    slack: () => {
      const room = group.fill.size.get()
      const { box } = group.fill
      if (typeof room !== 'number' || !box) {
        return null
      }

      return Math.max(0, room - box.getBoundingClientRect()[group.axes.extent])
    },
    subscribe: (listener) => group.fill.size.on('change', listener),
  }),
  sized: (panel: PanelController, axes: Axes): PinSource => ({
    extent: axes.extent,
    onMove: (listener) => panel.motion.size.on('change', listener),
    slack: () =>
      panel.reach === null
        ? null
        : Math.max(
            0,
            panel.reach -
              Math.max(panel.motion.content.get(), panel.motion.size.get())
          ),
    subscribe: panel.subscribe,
  }),
}

/**
 * Holds `element` at the size it would reach at the far end of an ancestor
 * panel's drag or fold, measured once when the motion starts and released when
 * it ends, so its subtree lays out twice per motion instead of once per frame.
 * It keeps its start edge and its parent clips the far end while it is held,
 * so the panel's own frame keeps following the pointer and covers or reveals
 * the held content like a viewport. Once the motion pauses it lays out once at
 * the size on screen, and holds again at full reach on the next move.
 */
export const attachPin = (element: HTMLElement, sources: PinSource[]) => {
  const { style } = element
  const held = new Map<
    Axes['extent'],
    { exact: boolean; saved: Record<string, string> }
  >()
  let pause: ReturnType<typeof setTimeout> | undefined
  let clip: { box: HTMLElement; overflow: string } | null = null

  const clipParent = () => {
    const box = element.parentElement
    if (held.size > 0 && !clip && box) {
      clip = { box, overflow: box.style.getPropertyValue('overflow') }
      box.style.setProperty('overflow', 'clip')
    } else if (held.size === 0 && clip) {
      clip.box.style.setProperty('overflow', clip.overflow)
      clip = null
    }
  }

  const hold = (extent: Axes['extent'], slack: number) => {
    const exact = slack === 0
    const size = `${element.getBoundingClientRect()[extent] + slack}px`
    const next = {
      [extent]: size,
      [`max-${extent}`]: size,
      [`min-${extent}`]: size,
    }
    held.set(extent, {
      exact,
      saved: Object.fromEntries(
        Object.keys(next).map((name) => [name, style.getPropertyValue(name)])
      ),
    })
    for (const [name, value] of Object.entries(next)) {
      style.setProperty(name, value)
    }
  }

  const release = (extent: Axes['extent']) => {
    const entry = held.get(extent)
    if (entry) {
      held.delete(extent)
      for (const [name, value] of Object.entries(entry.saved)) {
        style.setProperty(name, value)
      }
    }
  }

  const slackOf = (extent: Axes['extent']) => {
    const slacks = sources
      .filter((source) => source.extent === extent)
      .map((source) => source.slack())
      .filter((slack) => slack !== null)

    return slacks.length === 0 ? null : Math.max(...slacks)
  }

  const rehold = (extent: Axes['extent'], slack: number) => {
    release(extent)
    hold(extent, slack)
  }

  const settle = () => {
    for (const [extent, { exact }] of held) {
      if (!exact) {
        rehold(extent, 0)
      }
    }
  }

  const move = () => {
    for (const [extent, { exact }] of held) {
      const slack = slackOf(extent)
      if (exact && slack !== null && slack > 0) {
        rehold(extent, slack)
      }
    }
    clearTimeout(pause)
    pause = held.size > 0 ? setTimeout(settle, PAUSE) : undefined
  }

  const update = () => {
    for (const extent of ['width', 'height'] as const) {
      const slack = slackOf(extent)
      if (slack === null) {
        release(extent)
      } else if (!held.has(extent)) {
        hold(extent, slack)
      }
    }
    if (held.size === 0) {
      clearTimeout(pause)
    }
    clipParent()
  }

  const stops = sources.flatMap((source) => [
    source.subscribe(update),
    source.onMove(move),
  ])
  update()

  return () => {
    clearTimeout(pause)
    for (const stop of stops) {
      stop()
    }
    release('height')
    release('width')
    clipParent()
  }
}
