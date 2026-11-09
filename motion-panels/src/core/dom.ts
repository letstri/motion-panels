export const FILL_ATTRIBUTE = 'data-motion-panels-fill'
export const SEPARATOR_ATTRIBUTE = 'data-motion-panels-separator'

export const fillOf = (element: Element | null) =>
  element?.parentElement?.querySelector<HTMLElement>(
    `:scope > [${FILL_ATTRIBUTE}]`
  ) ?? null

export const isRtl = (element: Element | null) =>
  !!element && getComputedStyle(element).direction === 'rtl'

export const isSeparator = (node: Element | null) =>
  node?.hasAttribute(SEPARATOR_ATTRIBUTE) ?? false

export const hasFillAfter = (node: Element | null): boolean => {
  const next = node?.nextElementSibling

  return !!next && (next.hasAttribute(FILL_ATTRIBUTE) || hasFillAfter(next))
}

export const VEIL_ATTRIBUTE = 'data-motion-panels-veil'

let locks = 0
let veil: HTMLElement | null = null

const preventDefault = (event: Event) => event.preventDefault()

// A veil over the page, not cursor and user-select on the body: both are
// inherited, so writing them restyles every element on the page at the start
// and end of each drag, and the content under the pointer keeps its hover.
export const lockBody = (cursor: string, onEscape: () => void) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEscape()
    }
  }
  if (locks === 0) {
    veil = document.createElement('div')
    veil.setAttribute(VEIL_ATTRIBUTE, '')
    Object.assign(veil.style, {
      inset: '0',
      position: 'fixed',
      zIndex: '2147483647',
    })
    document.body.append(veil)
    addEventListener('selectstart', preventDefault, true)
  }
  locks += 1
  if (veil) {
    veil.style.cursor = cursor
  }
  addEventListener('keydown', onKeyDown, true)

  return () => {
    locks -= 1
    if (locks === 0) {
      veil?.remove()
      veil = null
      removeEventListener('selectstart', preventDefault, true)
    }
    removeEventListener('keydown', onKeyDown, true)
  }
}
