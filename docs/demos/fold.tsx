'use client'

import { Group, Separator } from 'motion-panels/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import {
  Card,
  Demo,
  Editor,
  FOLDS,
  Pane,
  Rows,
  SEPARATOR,
  SYMBOLS,
  px,
} from './shared'

type Fold = keyof typeof FOLDS

const formatProp = (value: object) =>
  JSON.stringify(value)
    .replaceAll(/"(?<key>[^"]+)":/gu, '$<key>: ')
    .replaceAll('"', "'")
    .replaceAll(',', ', ')
    .replace('{', '{ ')
    .replace(/\}$/u, ' }')

export const FoldDemo = () => {
  const [width, setWidth] = useState(260)
  const [collapsed, setCollapsed] = useState(false)
  const [fold, setFold] = useState<Fold>('flip')

  return (
    <Demo
      controls={
        <>
          <ToggleGroup
            size="sm"
            value={[fold]}
            onValueChange={([next]) => next && setFold(next as Fold)}
          >
            {Object.keys(FOLDS).map((name) => (
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
          {`<Panel${Object.entries(FOLDS[fold])
            .map(([prop, value]) => `\n  ${prop}={${formatProp(value)}}`)
            .join('')}\n/>`}
        </pre>
      }
    >
      <Group orientation="horizontal">
        <Pane
          {...FOLDS[fold]}
          size={width}
          minSize={180}
          maxSize={400}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          onSizeChange={setWidth}
          style={{ originX: 1 }}
        >
          <Card label="Navigator" size={px(width, collapsed)}>
            <Rows items={SYMBOLS} active="Panel" />
          </Card>
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize navigator" />
        <Pane>
          <Editor />
        </Pane>
      </Group>
    </Demo>
  )
}
