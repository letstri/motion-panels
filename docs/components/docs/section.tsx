import type { ReactNode } from 'react'

import { HEADING, LEAD } from './prose'

export const Section = ({
  children,
  id,
  lead,
  title,
}: {
  children: ReactNode
  id: string
  lead: string
  title: string
}) => (
  <section
    className="scroll-mt-20 border-t pt-14 [counter-increment:section] first:border-t-0 first:pt-0"
    id={id}
  >
    <span className="kicker text-muted-foreground/60 before:content-[counter(section,decimal-leading-zero)]" />
    <h2
      className={`${HEADING} mt-3 text-[26px] leading-[1.15] font-normal text-balance min-[900px]:text-[30px]`}
    >
      {title}
    </h2>
    <p className={`${LEAD} mt-4`}>{lead}</p>
    {children}
  </section>
)

export const Subheading = ({ children }: { children: ReactNode }) => (
  <h3 className={`${HEADING} mt-12 text-[19px] font-normal`}>{children}</h3>
)
