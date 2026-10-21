import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'

type UpdateState = 'current' | 'waiting' | 'activated' | 'updating' | 'error'

export function AppUpdate() {
  const [state, setState] = useState<UpdateState>('current')
  const apply = useRef<ReturnType<typeof registerSW> | null>(null)
  const requested = useRef(false)
  const location = useLocation()
  useEffect(() => {
    let active = true
    apply.current = registerSW({
      onNeedRefresh: () => { if (active) setState('waiting') },
      onNeedReload: () => {
        if (!active) return
        if (requested.current) window.location.reload()
        else setState('activated')
      },
      onRegisterError: () => { if (active) setState('error') },
    })
    return () => { active = false }
  }, [])

  async function update() {
    if (state === 'activated') { window.location.reload(); return }
    requested.current = true
    setState('updating')
    try {
      await apply.current!(true)
    } catch {
      requested.current = false
      setState('error')
    }
  }

  if (state === 'current') return null
  return (
    <aside aria-label="App update" className="fixed inset-x-4 top-20 z-20 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-mulberry/15 bg-ivory px-5 py-4 shadow-sm">
      <p role="status" className="text-sm text-charcoal">{state === 'error' ? 'Offline setup or update failed. Reload when you’re finished writing to try again.' : 'A new version of Aura is ready.'}</p>
      {state !== 'error' && (location.pathname === '/settings'
        ? <button type="button" disabled={state === 'updating'} onClick={() => { void update() }} className="min-h-11 rounded-full bg-mulberry px-5 py-2 text-sm text-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose">{state === 'updating' ? 'Updating…' : 'Update Aura'}</button>
        : <Link to="/settings" className="text-link min-h-11 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose">Update in Settings</Link>)}
    </aside>
  )
}
