import { Button } from '@/components/ui/button'
import { HeroDemo } from '@/demos'

import { CopyButton } from './docs/copy-button'
import { HEADING, LEAD } from './docs/prose'
import { SHELL } from './layout/shell'

const INSTALL = 'pnpm add motion-panels motion'

export const Hero = () => (
  <header className="border-b">
    <div
      className={`${SHELL} grid items-center gap-10 pt-14 pb-16 min-[1000px]:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] min-[1000px]:gap-14 min-[1000px]:pt-20 min-[1000px]:pb-24`}
    >
      <div>
        <h1
          className={`${HEADING} text-[clamp(32px,4.4vw,46px)] leading-[1.08] font-normal text-balance`}
        >
          Resizable panels, animated with Motion
        </h1>
        <p className={`${LEAD} mt-6 max-w-[46ch] text-[16px]`}>
          Drag a panel by its edge, or add a separator. No styling, no layout
          library. Try it — the panels next to this text are the real thing.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button
            nativeButton={false}
            render={<a href="#quick-start">Quick start</a>}
          />
          <div className="flex h-10 items-center gap-1 border pr-1 pl-3.5">
            <code className="text-muted-foreground font-mono text-[13px]">
              {INSTALL}
            </code>
            <CopyButton text={INSTALL} />
          </div>
        </div>
      </div>
      <HeroDemo />
    </div>
  </header>
)
