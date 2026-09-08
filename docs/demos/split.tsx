'use client'

import { Group, Separator } from 'motion-panels/react'

import {
  Card,
  Demo,
  Editor,
  FILES,
  Pane,
  Rows,
  SEPARATOR,
  px,
  usePaneSize,
} from './shared'

const Split = ({ separator }: { separator?: boolean }) => {
  const [width, setWidth] = usePaneSize(240, 130)

  return (
    <Demo>
      <Group orientation="horizontal">
        <Pane size={width} minSize="20%" maxSize="55%" onSizeChange={setWidth}>
          <Card label="Files" size={px(width)}>
            <Rows items={FILES} active="panel.tsx" />
          </Card>
        </Pane>
        {separator ? (
          <Separator className={SEPARATOR} aria-label="Resize files" />
        ) : null}
        <Pane>
          <Editor />
        </Pane>
      </Group>
    </Demo>
  )
}

export const HorizontalDemo = () => <Split />

export const SeparatorDemo = () => <Split separator />
