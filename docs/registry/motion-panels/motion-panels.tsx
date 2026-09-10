'use client'

import { cn } from 'cn'
import type { SeparatorProps } from 'motion-panels/react'
import { Separator } from 'motion-panels/react'

const SEPARATOR =
  "relative flex items-center justify-center outline-hidden after:absolute after:bg-border after:transition-colors after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/50 hover:after:bg-muted-foreground aria-[orientation=horizontal]:h-3 aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:h-px aria-[orientation=vertical]:w-3 aria-[orientation=vertical]:after:inset-y-0 aria-[orientation=vertical]:after:w-px data-crossing:after:bg-muted-foreground data-resizing:after:bg-ring [&[aria-orientation=horizontal]>div]:rotate-90"

const HANDLE =
  'z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border'

const Grip = () => (
  <svg
    aria-hidden="true"
    className="text-muted-foreground size-2.5"
    fill="currentColor"
    viewBox="0 0 10 10"
  >
    <circle cx="4" cy="2" r="0.75" />
    <circle cx="4" cy="5" r="0.75" />
    <circle cx="4" cy="8" r="0.75" />
    <circle cx="7" cy="2" r="0.75" />
    <circle cx="7" cy="5" r="0.75" />
    <circle cx="7" cy="8" r="0.75" />
  </svg>
)

/**
 * The seam between two panels. It sits centred on the boundary and takes no
 * room in the flow, so the line it draws never shifts the layout.
 */
function PanelSeparator({
  className,
  withHandle,
  ...props
}: SeparatorProps & { withHandle?: boolean }) {
  return (
    <Separator
      data-slot="panel-separator"
      className={cn(SEPARATOR, className)}
      {...props}
    >
      {withHandle ? (
        <div className={HANDLE}>
          <Grip />
        </div>
      ) : null}
    </Separator>
  )
}

export { Group as PanelGroup, Panel } from 'motion-panels/react'
export { PanelSeparator }
