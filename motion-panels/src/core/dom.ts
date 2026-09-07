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
