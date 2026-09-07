import { LEAD } from '@/components/docs/prose'
import { Reference } from '@/components/docs/reference'
import { Section } from '@/components/docs/section'
import { API } from '@/content/api'

export const Api = () => (
  <Section
    id="api"
    title="API"
    lead="Every component forwards the rest of its props to a motion div."
  >
    {API.map((component) => (
      <div key={component.name} className="mt-10">
        <h3 className="text-foreground font-mono text-[14px] font-medium">
          {component.name}
        </h3>
        {component.note ? (
          <p className={`${LEAD} mt-2`}>{component.note}</p>
        ) : null}
        {component.props.length > 0 ? (
          <Reference head={['Prop', 'Type', 'Does']} rows={component.props} />
        ) : null}
      </div>
    ))}
  </Section>
)
