import type { ComponentProps } from 'react'
import { useContext, useRef } from 'react'

import { attachPin } from '../core'
import { PinContext, useIsomorphicLayoutEffect } from './internal'

export type PinProps = Omit<ComponentProps<'div'>, 'ref'>

export const Pin = (props: PinProps) => {
  const sources = useContext(PinContext)
  const element = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(
    () => (element.current ? attachPin(element.current, sources) : undefined),
    [sources]
  )

  return <div ref={element} {...props} />
}
