import { createContext, useContext, useEffect, useLayoutEffect } from 'react'

import type { PanelGroup } from '../core'

export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export const GroupContext = createContext<PanelGroup | null>(null)

export const useGroup = () => {
  const group = useContext(GroupContext)
  if (!group) {
    throw new Error('Glidepanels: Panel and Separator must be inside a Group')
  }

  return group
}
