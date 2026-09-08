export const FILL_ATTRIBUTE = 'data-motion-panels-fill'
export const SEPARATOR_ATTRIBUTE = 'data-motion-panels-separator'

export const isRtl = (element: Element | null) =>
  !!element && getComputedStyle(element).direction === 'rtl'

export const isSeparator = (node: Element | null) =>
  node?.hasAttribute(SEPARATOR_ATTRIBUTE) ?? false

export const hasFillAfter = (node: Element | null): boolean => {
  const next = node?.nextElementSibling

  return !!next && (next.hasAttribute(FILL_ATTRIBUTE) || hasFillAfter(next))
}

let locks = 0
let saved: Partial<CSSStyleDeclaration> = {}

export const lockBody = (cursor: string, onEscape: () => void) => {
  const { style } = document.body
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEscape()
    }
  }
  if (locks === 0) {
    saved = {
      cursor: style.cursor,
      userSelect: style.userSelect,
      webkitUserSelect: style.webkitUserSelect,
    }
  }
  locks += 1
  Object.assign(style, { cursor, userSelect: 'none', webkitUserSelect: 'none' })
  addEventListener('keydown', onKeyDown, true)

  return () => {
    locks -= 1
    if (locks === 0) {
      Object.assign(style, saved)
    }
    removeEventListener('keydown', onKeyDown, true)
  }
}
