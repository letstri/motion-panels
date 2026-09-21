import type { DragControls, Transition } from 'motion/react'
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

export interface Reordering {
  carry: (carrying: boolean) => void
  carrying: boolean
  transition?: Transition
  travel: boolean
  // oxlint-disable-next-line typescript/method-signature-style -- bivariant on purpose: a group of one value form still hands its order over
  onOrderChange(order: unknown[]): void
  order: unknown[]
}

export const ReorderContext = createContext<Reordering | null>(null)

export interface Grip {
  controls: DragControls
  value: unknown
}

export const GripContext = createContext<Grip | null>(null)
