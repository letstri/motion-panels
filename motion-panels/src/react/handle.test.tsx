import type { ReactElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Group } from './group'
import { Handle } from './handle'
import { Panel } from './panel'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const roots: (() => void)[] = []

const mount = (ui: ReactElement) => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  act(() => root.render(ui))
  roots.push(() => {
    act(() => root.unmount())
    container.remove()
  })

  return container
}

/** The demo layout: two movable panels flanking the filling one. */
const Layout = ({
  onOrderChange,
  order,
  rtl,
}: {
  onOrderChange?: (order: string[]) => void
  order?: string[]
  rtl?: boolean
}) => {
  const side = (value: string) => (
    <Panel key={value} size={100} value={value}>
      <Handle style={rtl ? { direction: 'rtl' } : undefined}>{value}</Handle>
    </Panel>
  )

  return (
    <Group onOrderChange={onOrderChange} order={order}>
      {side(order?.[0] ?? 'files')}
      <Panel />
      {side(order?.[1] ?? 'outline')}
    </Group>
  )
}

const handles = (container: Element) => [
  ...container.querySelectorAll('button'),
]

const press = (button: Element, key: string) => {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
  })
  act(() => {
    button.dispatchEvent(event)
  })

  return event
}

afterEach(() => {
  for (const cleanup of roots.splice(0)) {
    cleanup()
  }
  vi.restoreAllMocks()
})

describe('Handle', () => {
  it('renders nothing without a group order', () => {
    expect(handles(mount(<Layout />))).toHaveLength(0)
  })

  it('labels itself with the panel value', () => {
    const container = mount(
      <Layout onOrderChange={vi.fn()} order={['files', 'outline']} />
    )

    expect(handles(container)[0]?.getAttribute('aria-label')).toBe('Move files')
  })

  it('carries a panel past its neighbour along the group axis', () => {
    const onOrderChange = vi.fn()
    const container = mount(
      <Layout onOrderChange={onOrderChange} order={['files', 'outline']} />
    )
    const event = press(handles(container)[0] as Element, 'ArrowRight')

    expect(onOrderChange).toHaveBeenCalledWith(['outline', 'files'])
    expect(event.defaultPrevented).toBe(true)
  })

  it('turns the keys round in an RTL row', () => {
    const onOrderChange = vi.fn()
    const container = mount(
      <Layout onOrderChange={onOrderChange} order={['files', 'outline']} rtl />
    )
    press(handles(container)[1] as Element, 'ArrowRight')

    expect(onOrderChange).toHaveBeenCalledWith(['outline', 'files'])
  })

  it('stays put at the end of the order and off the axis', () => {
    const onOrderChange = vi.fn()
    const container = mount(
      <Layout onOrderChange={onOrderChange} order={['files', 'outline']} />
    )
    const [first, last] = handles(container)
    const edge = press(last as Element, 'ArrowRight')
    const across = press(first as Element, 'ArrowDown')

    expect(onOrderChange).not.toHaveBeenCalled()
    expect(edge.defaultPrevented).toBe(false)
    expect(across.defaultPrevented).toBe(false)
  })
})
