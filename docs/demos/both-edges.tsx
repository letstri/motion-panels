'use client'

import { Group } from 'motion-panels/react'
import { useState } from 'react'

import { Card, Demo, Editor, FILES, Pane, Rows, SYMBOLS, px } from './shared'

export const BothEdgesDemo = () => {
  const [left, setLeft] = useState(180)
  const [right, setRight] = useState(180)

  return (
    <Demo>
      <Group orientation="horizontal">
        <Pane size={left} minSize={120} maxSize={300} onSizeChange={setLeft}>
          <Card label="Files" size={px(left)}>
            <Rows items={FILES} active="index.tsx" />
          </Card>
        </Pane>
        <Pane>
          <Editor />
        </Pane>
        <Pane size={right} minSize={120} maxSize={300} onSizeChange={setRight}>
          <Card label="Outline" size={px(right)}>
            <Rows items={SYMBOLS} />
          </Card>
        </Pane>
      </Group>
    </Demo>
  )
}
