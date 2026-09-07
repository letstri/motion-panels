import { Code } from '@/components/docs/code'
import { Section } from '@/components/docs/section'

export const Styling = () => (
  <Section
    id="styling"
    title="Styling"
    lead={
      "Nothing ships styled. A separator is [role='separator'] with aria-orientation, centred on the seam it drags and taking no space in the flow, so give it a width and it straddles the boundary on its own. It carries data-crossing while the pointer hovers a crossing it would drag from, and data-resizing from press to release. A sized panel with no Separator of its own renders one anyway as the drag area on its edge \u2014 that one carries data-motion-panels-edge and should stay invisible."
    }
  >
    <Code
      lang="css"
      code={`
[role='separator'][aria-orientation='vertical'] {
  width: 14px; /* straddles the seam on its own */
}

[role='separator']::after {
  border-radius: 999px;
  background: var(--border);
  content: '';
}

[role='separator']:hover::after,
[role='separator'][data-crossing]::after {
  background: var(--muted-foreground);
}

[role='separator'][data-resizing]::after {
  background: var(--primary);
}

/* the edge grip a panel renders for itself: hit area only */
[role='separator'][data-motion-panels-edge]::after {
  display: none;
}
`}
    />
  </Section>
)
