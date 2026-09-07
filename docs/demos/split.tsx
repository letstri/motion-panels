'use client'

import { Group, Separator } from 'motion-panels/react'
import { useState } from 'react'

import { Card, Demo, Editor, FILES, Pane, Rows, SEPARATOR, px } from './shared'

const Split = ({ separator }: { separator?: boolean }) => {
  const [width, setWidth] = useState(240)

  return (
    <Demo>
      <Group orientation="horizontal">
        <Pane
          size={width}
          defaultSize={240}
          minSize={160}
          maxSize={420}
          onSizeChange={setWidth}
        >
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
