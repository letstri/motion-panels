'use client'

import { Group, Separator } from 'motion-panels/react'
import { useState } from 'react'

import {
  Card,
  Demo,
  Editor,
  Lines,
  OUTPUT,
  Pane,
  SEPARATOR,
  px,
} from './shared'

export const VerticalDemo = () => {
  const [height, setHeight] = useState(120)

  return (
    <Demo>
      <Group orientation="vertical">
        <Pane>
          <Editor />
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize output" />
        <Pane
          size={height}
          defaultSize={120}
          minSize={80}
          maxSize={220}
          onSizeChange={setHeight}
        >
          <Card label="Output" size={px(height)}>
            <Lines lines={OUTPUT} terminal />
          </Card>
        </Pane>
      </Group>
    </Demo>
  )
}
