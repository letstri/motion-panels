/**
 * Type-level checks, compiled by `check-types` and never bundled: the size a
 * panel reports has to follow the size it was given, through a wrapper too.
 */
import type { ComponentProps } from 'react'

import type { PanelProps, Size } from './index'
import { Panel } from './index'

type Equal<A, B> =
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the identity-signature trick is how a type equality is written
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false

type Expect<T extends true> = T

/** What onSizeChange hands back for the member of `P` sized as `S`. */
type Reports<P, S extends Size> =
  Extract<P, { size: S }> extends {
    onSizeChange?: (size: infer Reported) => void
  }
    ? Reported
    : never

// The wrapper every consumer writes around a component like this one.
const Wrapper = (props: ComponentProps<typeof Panel>) => <Panel {...props} />

type WrapperProps = ComponentProps<typeof Wrapper>

export type Checks = [
  // Through a wrapper, each size still reports its own form.
  Expect<Equal<Reports<WrapperProps, number>, number>>,
  Expect<Equal<Reports<WrapperProps, `${number}%`>, `${number}%`>>,
  // And a filling panel, which carries no size at all, still passes through.
  Expect<Equal<Extract<WrapperProps, { size?: undefined }>['size'], undefined>>,
  // Straight on Panel, both forms and a size held as Size.
  Expect<Equal<Reports<Parameters<typeof Panel<number>>[0], number>, number>>,
  Expect<
    Equal<
      Reports<Parameters<typeof Panel<`${number}%`>>[0], `${number}%`>,
      `${number}%`
    >
  >,
  Expect<Equal<Reports<PanelProps<Size>, Size>, Size>>,
]
