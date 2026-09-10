'use client'

import {
  Panel,
  PanelGroup,
  PanelSeparator,
} from '@/registry/motion-panels/motion-panels'

import { Card, Demo, Editor, FILES, Rows, px, usePaneSize } from './shared'

export const ShadcnDemo = () => {
  const [width, setWidth] = usePaneSize(240, 130)

  return (
    <Demo>
      <PanelGroup orientation="horizontal">
        <Panel size={width} minSize="20%" maxSize="55%" onSizeChange={setWidth}>
          <Card label="Files" size={px(width)}>
            <Rows items={FILES} active="panel.tsx" />
          </Card>
        </Panel>
        <PanelSeparator withHandle />
        <Panel>
          <Editor />
        </Panel>
      </PanelGroup>
    </Demo>
  )
}
