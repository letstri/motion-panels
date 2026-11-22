'use client'

import { Group, Separator } from 'motion-panels/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { Demo, Editor, Pane, SEPARATOR, SYMBOLS, usePaneSize } from './shared'

// The pane's padding, the card's border and padding and a row's own padding add up to this around a 24px icon.
const RAIL = 52

export const RailDemo = () => {
  const [width, setWidth] = usePaneSize(220, 140)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Demo
      controls={
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </Button>
      }
    >
      <Group orientation="horizontal">
        <Pane
          size={width}
          minSize="22%"
          maxSize="52%"
          collapsed={collapsed}
          collapsedSize={RAIL}
          onCollapsedChange={setCollapsed}
          onSizeChange={setWidth}
        >
          <nav
            data-collapsed={collapsed || undefined}
            className="group bg-card flex h-full w-full flex-col gap-1 overflow-hidden border p-1.5"
          >
            {SYMBOLS.map((symbol) => (
              <div
                key={symbol}
                data-active={symbol === 'Panel' || undefined}
                className="text-muted-foreground data-active:bg-muted data-active:text-foreground flex h-8 flex-none items-center gap-2.5 overflow-hidden px-1 text-[12px] whitespace-nowrap"
              >
                <span className="grid size-6 flex-none place-items-center border font-mono text-[11px]">
                  {symbol.charAt(0)}
                </span>
                <span className="transition-opacity duration-200 group-data-collapsed:opacity-0">
                  {symbol}
                </span>
              </div>
            ))}
          </nav>
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize sidebar" />
        <Pane>
          <Editor />
        </Pane>
      </Group>
    </Demo>
  )
}
