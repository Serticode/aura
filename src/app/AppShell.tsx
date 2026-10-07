import { NavLink, Outlet } from 'react-router-dom'

const spaces = [
  { to: '/', label: 'Hearth' },
  { to: '/mirror', label: 'Mirror' },
  { to: '/pulse', label: 'Pulse' },
  { to: '/gathering', label: 'Gathering' },
] as const

export function AppShell() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <Outlet />
      </main>
      <nav
        aria-label="Spaces"
        className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-md justify-around border-t border-earth/10 bg-cream py-2"
      >
        {spaces.map((space) => (
          <NavLink
            key={space.to}
            to={space.to}
            end={space.to === '/'}
            className={({ isActive }) =>
              isActive
                ? 'rounded-full bg-terracotta/15 px-4 py-2 text-sm font-medium text-terracotta'
                : 'rounded-full px-4 py-2 text-sm text-earth hover:bg-earth/5'
            }
          >
            {space.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}