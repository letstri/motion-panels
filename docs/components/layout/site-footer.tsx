import { SHELL } from './shell'

export const SiteFooter = () => (
  <footer className="border-t">
    <div
      className={`${SHELL} text-muted-foreground flex flex-wrap items-center justify-between gap-3 py-10`}
    >
      <span className="kicker">MIT © Valerii Strilets</span>
      <a
        className="kicker hover:text-foreground no-underline transition-colors"
        href="https://github.com/letstri/motion-panels"
        rel="noreferrer"
        target="_blank"
      >
        github.com/letstri/motion-panels
      </a>
    </div>
  </footer>
)
