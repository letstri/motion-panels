'use client'

import { Group, Handle, Separator } from 'motion-panels/react'
import type { ReactNode } from 'react'
import { useState } from 'react'

import {
  CARD,
  CARD_HEAD,
  Demo,
  FILES,
  Lines,
  Pane,
  Rows,
  SEPARATOR,
  SOURCE,
  SYMBOLS,
  usePaneSize,
} from './shared'

const GRIP =
  'flex flex-none cursor-grab items-center gap-[3px] rounded-sm px-1 py-1.5 outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing'

const DOT = 'size-[3px] rounded-full bg-muted-foreground/60'

const Slab = ({ children, label }: { children: ReactNode; label: string }) => (
  <div className={CARD}>
    <div className={CARD_HEAD}>
      <span className="truncate">{label}</span>
      <Handle className={GRIP}>
        {[0, 1, 2].map((dot) => (
          <span className={DOT} key={dot} />
        ))}
      </Handle>
    </div>
    {children}
  </div>
)

const BODIES: Record<string, ReactNode> = {
  files: (
    <Slab label="Files">
      <Rows active="panel.tsx" items={FILES} />
    </Slab>
  ),
  outline: (
    <Slab label="Outline">
      <Rows active="Separator" items={SYMBOLS} />
    </Slab>
  ),
}

export const ReorderDemo = () => {
  const [order, setOrder] = useState(['files', 'outline'])
  const [files, setFiles] = usePaneSize(180, 120)
  const [outline, setOutline] = usePaneSize(130, 96)
  const sizes: Record<string, [number, (size: number) => void]> = {
    files: [files, setFiles],
    outline: [outline, setOutline],
  }

  const side = (id: string) => {
    const [size, onSizeChange] = sizes[id]

    return (
      <Pane
        key={id}
        maxSize="40%"
        minSize={96}
        onSizeChange={onSizeChange}
        size={size}
        value={id}
      >
        {BODIES[id]}
      </Pane>
    )
  }

  return (
    <Demo
      footer={
        <p className="text-muted-foreground px-3 py-2 font-mono text-[11px]">
          order: [{order.join(', ')}]
        </p>
      }
    >
      <Group onOrderChange={setOrder} order={order}>
        {side(order[0])}
        <Separator className={SEPARATOR} />
        <Pane>
          <Slab label="workspace.tsx">
            <Lines lines={SOURCE} />
          </Slab>
        </Pane>
        <Separator className={SEPARATOR} />
        {side(order[1])}
      </Group>
    </Demo>
  )
}
