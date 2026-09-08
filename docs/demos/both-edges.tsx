'use client'

import type { Size } from 'motion-panels/react'
import { Group } from 'motion-panels/react'
import { useState } from 'react'

import { Card, Demo, Editor, FILES, Pane, Rows, SYMBOLS, px } from './shared'

export const BothEdgesDemo = () => {
  const [left, setLeft] = useState<Size>('25%')
  const [right, setRight] = useState<Size>('25%')

  return (
    <Demo>
      <Group orientation="horizontal">
        <Pane size={left} minSize="14%" maxSize="35%" onSizeChange={setLeft}>
          <Card label="Files" size={px(left)}>
            <Rows items={FILES} active="index.tsx" />
          </Card>
        </Pane>
        <Pane>
          <Editor />
        </Pane>
        <Pane size={right} minSize="14%" maxSize="35%" onSizeChange={setRight}>
          <Card label="Outline" size={px(right)}>
            <Rows items={SYMBOLS} />
          </Card>
        </Pane>
      </Group>
    </Demo>
  )
}
