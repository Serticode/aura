import { NavLink, Outlet, useLocation } from 'react-router-dom'

const spaces = [
  { to: '/hearth', label: 'Hearth' },
  { to: '/mirror', label: 'Mirror' },
  { to: '/pulse', label: 'Pulse' },
  { to: '/gathering', label: 'Gathering' },
] as const

const onboardingPaths = ['/', '/boundaries'] as const

export function AppShell() {
  const location = useLocation()
  const inOnboarding = onboardingPaths.some((path) => path === location.pathname)

  return (
    <div className="min-h-screen bg-cream text-ink">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        <Outlet />
      </main>
      {!inOnboarding && (
        <nav
          aria-label="Spaces"
          className="animate-fade fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-md justify-around border-t border-earth/10 bg-cream py-2"
          style={{ animationDelay: '400ms' }}
        >
          {spaces.map((space) => (
            <NavLink
              key={space.to}
              to={space.to}
              end={space.to === '/hearth'}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 text-sm transition-colors duration-200 ease-ambient active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
                  isActive
                    ? 'bg-terracotta/15 font-medium text-terracotta'
                    : 'text-earth hover:bg-earth/5',
                ].join(' ')
              }
            >
              {space.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}