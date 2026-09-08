import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
} from 'react'

import type { PanelGroup } from '../core'

export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export const useStore = <T>(
  subscribe: (listener: () => void) => () => void,
  get: () => T
) => useSyncExternalStore(subscribe, get, get)

export const GroupContext = createContext<PanelGroup | null>(null)

export const useGroup = () => {
  const group = useContext(GroupContext)
  if (!group) {
    throw new Error('Motion Panels: Panel and Separator must be inside a Group')
  }

  return group
}
