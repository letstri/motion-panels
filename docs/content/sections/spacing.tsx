import { ASIDE } from '@/components/docs/prose'
import { Section } from '@/components/docs/section'
import { SpacingDemo } from '@/demos'

export const Spacing = () => (
  <Section
    id="spacing"
    title="Spacing"
    lead="Space the panels however the design wants: padding on each panel, a flex gap on the group, padding on the group, or nothing at all. The room a panel may take is measured from its own box and the filling panel's, never assumed from the group extent, so a gap costs the drag bounds nothing and a fold pins the filling panel at exactly the width it ends with. A separator sits in the flow at zero width, so a flex gap opens on both sides of it: the seam is twice the gap, with the grip in its middle."
  >
    <SpacingDemo />
    <p className={ASIDE}>
      A separator centres on the seam between the two panels, which is the
      middle of a gap but not of uneven padding. When one panel carries the
      whole space, nudge the grip across it with the x or y motion style, as the
      uneven preset does.
    </p>
  </Section>
)
