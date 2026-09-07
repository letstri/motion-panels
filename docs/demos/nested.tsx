'use client'

import { Group, Panel, Separator } from 'motion-panels/react'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import { Toggle } from '@/components/ui/toggle'

import {
  Card,
  Demo,
  Editor,
  FILES,
  FOLDS,
  Lines,
  OUTPUT,
  Pane,
  Rows,
  SEPARATOR,
  SYMBOLS,
  px,
} from './shared'

export const NestedDemo = () => {
  const [sidebar, setSidebar] = useState(200)
  const [terminal, setTerminal] = useState(100)

  return (
    <Demo>
      <Group orientation="horizontal">
        <Pane
          size={sidebar}
          defaultSize={200}
          minSize={140}
          maxSize={360}
          onSizeChange={setSidebar}
        >
          <Card label="Files" size={px(sidebar)}>
            <Rows items={FILES} active="panel.tsx" />
          </Card>
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize files" />
        <Panel>
          <Group orientation="vertical">
            <Pane>
              <Editor />
            </Pane>
            <Separator className={SEPARATOR} aria-label="Resize console" />
            <Pane
              size={terminal}
              defaultSize={100}
              minSize={60}
              maxSize={180}
              onSizeChange={setTerminal}
            >
              <Card label="Console" size={px(terminal)}>
                <Lines lines={OUTPUT} terminal />
              </Card>
            </Pane>
          </Group>
        </Panel>
      </Group>
    </Demo>
  )
}

const NEST_FOLDS = {
  files: FOLDS.flip,
  outline: FOLDS.fade,
  terminal: FOLDS.spring,
} as const satisfies Record<string, Partial<ComponentProps<typeof Panel>>>

export const DeepNestDemo = () => {
  const [files, setFiles] = useState(140)
  const [outline, setOutline] = useState(120)
  const [terminal, setTerminal] = useState(90)
  const [hidden, setHidden] = useState({
    files: false,
    outline: false,
    terminal: false,
  })

  const toggle = (name: keyof typeof NEST_FOLDS) => (pressed: boolean) =>
    setHidden((current) => ({ ...current, [name]: pressed }))

  return (
    <Demo
      tall
      controls={
        <>
          <Toggle
            size="sm"
            variant="outline"
            pressed={hidden.files}
            onPressedChange={toggle('files')}
          >
            files (flip)
          </Toggle>
          <Toggle
            size="sm"
            variant="outline"
            pressed={hidden.outline}
            onPressedChange={toggle('outline')}
          >
            outline (fade)
          </Toggle>
          <Toggle
            size="sm"
            variant="outline"
            pressed={hidden.terminal}
            onPressedChange={toggle('terminal')}
          >
            terminal (spring)
          </Toggle>
        </>
      }
    >
      <Group orientation="horizontal">
        <Pane
          {...NEST_FOLDS.files}
          size={files}
          defaultSize={140}
          minSize={100}
          maxSize={240}
          collapsed={hidden.files}
          onCollapsedChange={toggle('files')}
          onSizeChange={setFiles}
        >
          <Card label="Files" size={px(files, hidden.files)}>
            <Rows items={FILES} active="separator.tsx" />
          </Card>
        </Pane>
        <Separator className={SEPARATOR} aria-label="Resize files" />
        <Panel>
          <Group orientation="vertical">
            <Panel>
              <Group orientation="horizontal">
                <Pane>
                  <Editor />
                </Pane>
                <Separator className={SEPARATOR} aria-label="Resize outline" />
                <Pane
                  {...NEST_FOLDS.outline}
                  size={outline}
                  defaultSize={120}
                  minSize={80}
                  maxSize={220}
                  collapsed={hidden.outline}
                  onCollapsedChange={toggle('outline')}
                  onSizeChange={setOutline}
                >
                  <Card label="Outline" size={px(outline, hidden.outline)}>
                    <Rows items={SYMBOLS} active="Separator" />
                  </Card>
                </Pane>
              </Group>
            </Panel>
            <Separator className={SEPARATOR} aria-label="Resize terminal" />
            <Pane
              {...NEST_FOLDS.terminal}
              size={terminal}
              defaultSize={90}
              minSize={60}
              maxSize={160}
              collapsed={hidden.terminal}
              onCollapsedChange={toggle('terminal')}
              onSizeChange={setTerminal}
            >
              <Card label="Terminal" size={px(terminal, hidden.terminal)}>
                <Lines lines={OUTPUT} terminal />
              </Card>
            </Pane>
          </Group>
        </Panel>
      </Group>
    </Demo>
  )
}
