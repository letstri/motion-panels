'use client'

import { Group, Panel, Separator } from 'motion-panels/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'

import {
  Card,
  Demo,
  FILES,
  Pane,
  Rows,
  SEPARATOR,
  px,
  usePaneSize,
} from './shared'

const PIN_TEXT =
  'Pinning holds this text at the width the panel ends the fold with, so the line breaks are measured once instead of on every frame. Turn the pin off and watch the words rewrap the whole way through. Real content pays that cost on every frame too: a code editor relaying out, a virtualised table remeasuring its rows.'

export const PinDemo = () => {
  const [width, setWidth] = usePaneSize(240, 130)
  const [collapsed, setCollapsed] = useState(false)
  const [pinned, setPinned] = useState(true)

  return (
    <Demo
      controls={
        <>
          <Toggle
            size="sm"
            variant="outline"
            pressed={pinned}
            onPressedChange={setPinned}
          >
            pin {pinned ? 'on' : 'off'}
          </Toggle>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </Button>
        </>
      }
    >
      <Group orientation="horizontal">
        <Pane
          size={width}
          minSize="20%"
          maxSize="55%"
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          onSizeChange={setWidth}
        >
          <Card label="Sidebar" size={px(width, collapsed)}>
            <Rows items={FILES} active="group.tsx" />
          </Card>
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize sidebar" />
        <Panel pin={pinned}>
          <p className="text-muted-foreground overflow-hidden px-4 py-3 text-[13px] leading-[1.7]">
            {PIN_TEXT}
          </p>
        </Panel>
      </Group>
    </Demo>
  )
}
