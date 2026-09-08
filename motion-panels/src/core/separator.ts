import { hasFillAfter, SEPARATOR_ATTRIBUTE } from './dom'
import type { Point } from './grips'
import { grips } from './grips'
import type { PanelGroup } from './group'
import type { PanelController } from './panel'
import { noop } from './utils'

const PAN_THRESHOLD = 3

export const attachSeparator = (
  element: HTMLElement,
  group: PanelGroup,
  own?: PanelController
) => {
  const slot = element.closest(`[${SEPARATOR_ATTRIBUTE}]`)
  const findPanel = () =>
    own ?? group.panels.get(hasFillAfter(slot) ? 'start' : 'end')

  let panel: PanelController | undefined
  let unregister = noop
  let unwatch = noop
  let partners: PanelController[] = []
  let pressed: Point | null = null
  let dragging = false
  let dragged = false
  let joint = false
  let cursor = ''

  const resizing = () =>
    grips.state(element) === 'held' || !!panel?.state.dragging

  const each = (act: (target: PanelController) => void) => {
    for (const target of [panel, ...partners]) {
      if (target) {
        act(target)
      }
    }
  }

  const render = () => {
    const hit = grips.state(element)
    element.toggleAttribute('data-resizing', resizing())
    element.toggleAttribute('data-crossing', hit === 'crossed' && !resizing())
    if (joint !== (hit !== null)) {
      joint = !joint
      if (joint) {
        cursor = element.style.getPropertyValue('cursor')
        element.style.cursor = 'move'
      } else {
        element.style.cursor = cursor
      }
    }
    if (panel) {
      const { max, min } = panel.bounds()
      element.setAttribute('aria-valuenow', String(panel.target))
      element.setAttribute('aria-valuetext', `${panel.target} pixels`)
      element.setAttribute('aria-valuemin', String(min))
      if (panel.options.maxSize === undefined) {
        element.removeAttribute('aria-valuemax')
      } else {
        element.setAttribute('aria-valuemax', String(max))
      }
    }
  }

  const bind = () => {
    const next = findPanel()
    if (next !== panel) {
      unregister()
      unwatch()
      panel = next
      unregister = panel ? grips.register(element, panel) : noop
      unwatch = panel ? panel.subscribe(render) : noop
    }
    render()
  }

  const settle = () => {
    partners = []
    pressed = null
    dragging = false
  }

  const listeners = {
    pointerdown: (event: PointerEvent) => {
      dragged = false
      pressed = { clientX: event.clientX, clientY: event.clientY }
      element.setPointerCapture(event.pointerId)
      grips.invalidate()
      grips.mark('held', grips.at(event))
    },
    pointermove: (event: PointerEvent) => {
      if (!pressed) {
        if (!resizing()) {
          grips.mark('crossed', grips.at(event))
        }

        return
      }
      const offset = {
        x: event.clientX - pressed.clientX,
        y: event.clientY - pressed.clientY,
      }
      if (!dragging) {
        if (Math.hypot(offset.x, offset.y) < PAN_THRESHOLD) {
          return
        }
        dragging = true
        dragged = true
        partners = grips.partners(grips.at(pressed), element)
        each((target) =>
          target.drag.start(partners.length > 0 ? 'move' : undefined)
        )
      }
      each((target) => target.drag.move(offset))
    },
    pointerup: (event: PointerEvent) => {
      grips.mark('held', [])
      if (dragging) {
        each((target) => target.drag.end())
        grips.invalidate()
        grips.mark('crossed', grips.at(event))
      }
      settle()
    },
    pointercancel: () => {
      grips.mark('held', [])
      each((target) => target.drag.cancel())
      settle()
    },
    pointerenter: () => grips.invalidate(),
    pointerleave: () => {
      if (!resizing()) {
        grips.mark('crossed', [])
      }
    },
    dblclick: () => {
      if (!dragged) {
        panel?.reset()
      }
    },
    keydown: (event: KeyboardEvent) => panel?.resizeByKey(event),
  }

  const controller = new AbortController()
  for (const [type, listener] of Object.entries(listeners)) {
    element.addEventListener(type, listener as EventListener, {
      signal: controller.signal,
    })
  }
  const unsubscribe = [group.subscribe(bind), grips.subscribe(render)]
  bind()

  return () => {
    controller.abort()
    for (const stop of unsubscribe) {
      stop()
    }
    unregister()
    unwatch()
  }
}
