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

type Reports<P> =
  NonNullable<Extract<P, { onSizeChange?: unknown }>['onSizeChange']> extends (
    size: infer S
  ) => void
    ? S
    : never

// The wrapper every consumer writes around a component like this one.
const Wrapper = (props: ComponentProps<typeof Panel>) => <Panel {...props} />

type WrapperProps = ComponentProps<typeof Wrapper>

export type Checks = [
  // A wrapper hands its consumers pixels, not the widest size a panel accepts.
  Expect<Equal<Reports<WrapperProps>, number>>,
  // And still forwards a filling panel, which carries no size at all.
  Expect<Equal<Extract<WrapperProps, { size?: undefined }>['size'], undefined>>,
  // Straight on Panel, each form reports itself.
  Expect<Equal<Reports<Parameters<typeof Panel<number>>[0]>, number>>,
  Expect<
    Equal<Reports<Parameters<typeof Panel<`${number}%`>>[0]>, `${number}%`>
  >,
  Expect<Equal<Reports<Extract<PanelProps<Size>, { size: Size }>>, Size>>,
]
