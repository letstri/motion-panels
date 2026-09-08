'use client'

import { Group } from 'motion-panels/react'

import {
  Card,
  Demo,
  Editor,
  FILES,
  Pane,
  Rows,
  SYMBOLS,
  px,
  usePaneSize,
} from './shared'

export const BothEdgesDemo = () => {
  const [left, setLeft] = usePaneSize(180, 96)
  const [right, setRight] = usePaneSize(180, 96)

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
