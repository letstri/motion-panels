import { Hero } from '@/components/hero'
import { SHELL } from '@/components/layout/shell'
import { SideNav } from '@/components/layout/side-nav'
import { Api } from '@/content/sections/api'
import { BothEdges } from '@/content/sections/both-edges'
import { Collapsing } from '@/content/sections/collapsing'
import { Core } from '@/content/sections/core'
import { Install } from '@/content/sections/install'
import { Nesting } from '@/content/sections/nesting'
import { Orientation } from '@/content/sections/orientation'
import { Pinning } from '@/content/sections/pinning'
import { QuickStart } from '@/content/sections/quick-start'
import { SeparatorSection } from '@/content/sections/separator'
import { Spacing } from '@/content/sections/spacing'
import { Styling } from '@/content/sections/styling'

const DocsPage = () => (
  <>
    <Hero />
    <div
      className={`${SHELL} grid grid-cols-[minmax(0,1fr)] gap-10 pt-12 pb-24 min-[900px]:grid-cols-[190px_minmax(0,1fr)] min-[900px]:gap-16 min-[900px]:pt-16 min-[900px]:pb-32`}
    >
      <div className="self-start min-[900px]:sticky min-[900px]:top-24">
        <SideNav />
      </div>
      <main className="flex max-w-[900px] min-w-0 flex-col gap-14 [counter-reset:section]">
        <Install />
        <QuickStart />
        <SeparatorSection />
        <Orientation />
        <Collapsing />
        <Pinning />
        <Nesting />
        <BothEdges />
        <Spacing />
        <Core />
        <Styling />
        <Api />
      </main>
    </div>
  </>
)

export default DocsPage
