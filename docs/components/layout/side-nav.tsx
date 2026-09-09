'use client'

import { useEffect, useState } from 'react'

const GROUPS = [
  {
    items: [
      { id: 'install', navTitle: 'Install' },
      { id: 'quick-start', navTitle: 'Quick start' },
    ],
    title: 'Start',
  },
  {
    items: [
      { id: 'separator', navTitle: 'Separator' },
      { id: 'orientation', navTitle: 'Orientation' },
      { id: 'collapsing', navTitle: 'Collapsing and folds' },
      { id: 'pinning', navTitle: 'Pinning' },
    ],
    title: 'Panels',
  },
  {
    items: [
      { id: 'nesting', navTitle: 'Nesting' },
      { id: 'both-edges', navTitle: 'Both edges' },
      { id: 'spacing', navTitle: 'Spacing' },
    ],
    title: 'Layouts',
  },
  {
    items: [
      { id: 'core', navTitle: 'Core, without React' },
      { id: 'styling', navTitle: 'Styling' },
      { id: 'api', navTitle: 'API' },
    ],
    title: 'Reference',
  },
]

const SECTIONS = GROUPS.flatMap((group) => group.items)

const useActiveSection = () => {
  const [active, setActive] = useState(SECTIONS[0].id)

  useEffect(() => {
    const update = () => {
      const passed = SECTIONS.findLast(({ id }) => {
        const top = document
          .querySelector(`#${id}`)
          ?.getBoundingClientRect().top
        return top !== undefined && top <= 120
      })

      setActive(passed?.id ?? SECTIONS[0].id)
    }

    update()
    addEventListener('scroll', update, { passive: true })
    return () => removeEventListener('scroll', update)
  }, [])

  return active
}

const ITEM =
  'focus-visible:ring-ring/50 relative block py-1 text-[13.5px] whitespace-nowrap no-underline outline-none transition-colors focus-visible:ring-2 min-[900px]:pl-4'

const MARKER =
  "min-[900px]:before:bg-foreground min-[900px]:before:absolute min-[900px]:before:inset-y-0 min-[900px]:before:-left-px min-[900px]:before:w-px min-[900px]:before:content-['']"

export const SideNav = () => {
  const active = useActiveSection()

  return (
    <nav
      aria-label="Sections"
      className="no-scrollbar scroll-fade-x -mx-5 flex gap-x-8 overflow-x-auto border-b px-5 pb-3 min-[900px]:mx-0 min-[900px]:flex-col min-[900px]:gap-8 min-[900px]:overflow-visible min-[900px]:border-b-0 min-[900px]:px-0 min-[900px]:pb-0"
    >
      {GROUPS.map((group) => (
        <div
          className="flex items-center gap-x-6 min-[900px]:block"
          key={group.title}
        >
          <strong className="kicker text-muted-foreground/60 hidden min-[900px]:block">
            {group.title}
          </strong>
          <ul className="flex list-none gap-x-5 p-0 min-[900px]:mt-3 min-[900px]:flex-col min-[900px]:gap-x-0 min-[900px]:border-l">
            {group.items.map((section) => (
              <li className="flex-none" key={section.id}>
                <a
                  aria-current={section.id === active ? 'location' : undefined}
                  className={`${ITEM} ${
                    section.id === active
                      ? `text-foreground font-medium ${MARKER}`
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  href={`#${section.id}`}
                >
                  {section.navTitle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
