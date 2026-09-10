'use client'

import { Group, Panel, Separator } from 'motion-panels/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import {
  Card,
  Demo,
  Editor,
  FILES,
  Rows,
  SEPARATOR,
  px,
  usePaneSize,
} from './shared'

const SPACINGS = {
  gap: {
    code: `<Group style={{ gap: 6 }}> {/* opens on both sides of the separator: a 12px seam */}
  <Panel size={width}>…</Panel>
  <Separator />
  <Panel pin>…</Panel>
</Group>`,
    group: { gap: 6 },
    panel: undefined,
    separator: undefined,
  },
  uneven: {
    code: `<Group>
  <Panel size={width} style={{ paddingRight: 12 }}>…</Panel>
  <Separator style={{ x: -6 }} />
  <Panel pin>…</Panel>
</Group>`,
    group: undefined,
    panel: { paddingRight: 12 },
    separator: { x: -6 },
  },
} as const

type Spacing = keyof typeof SPACINGS

export const SpacingDemo = () => {
  const [width, setWidth] = usePaneSize(240, 130)
  const [collapsed, setCollapsed] = useState(false)
  const [spacing, setSpacing] = useState<Spacing>('gap')
  const mode = SPACINGS[spacing]

  return (
    <Demo
      controls={
        <>
          <ToggleGroup
            size="sm"
            value={[spacing]}
            onValueChange={([next]) => next && setSpacing(next as Spacing)}
          >
            {Object.keys(SPACINGS).map((name) => (
              <ToggleGroupItem key={name} value={name}>
                {name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
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
      footer={
        <pre className="text-muted-foreground m-0 overflow-x-auto px-3.5 py-3 font-mono text-[13px]">
          {mode.code}
        </pre>
      }
    >
      <Group orientation="horizontal" style={mode.group}>
        <Panel
          size={width}
          minSize="20%"
          maxSize="55%"
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          onSizeChange={setWidth}
          style={mode.panel}
        >
          <Card label="Files" size={px(width, collapsed)}>
            <Rows items={FILES} active="group.tsx" />
          </Card>
        </Panel>
        <Separator
          className={SEPARATOR}
          aria-label="Resize files"
          style={mode.separator}
        />
        <Panel pin>
          <Editor />
        </Panel>
      </Group>
    </Demo>
  )
}
