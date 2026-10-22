import { useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

type UpdateState = 'current' | 'waiting' | 'activated' | 'updating' | 'error'

export function useAppUpdate() {
  const [state, setState] = useState<UpdateState>('current')
  const apply = useRef<ReturnType<typeof registerSW> | null>(null)
  const requested = useRef(false)
  useEffect(() => {
    let active = true
    apply.current = registerSW({
      onNeedRefresh: () => { if (active) setState('waiting') },
      onNeedReload: () => { if (active && !requested.current) setState('activated') },
      onRegisterError: () => { if (active) setState('error') },
    })
    let controlled = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
    const controllerChanged = () => {
      if (!active) return
      if (requested.current) window.location.reload()
      else if (controlled) setState('activated')
      controlled = true
    }
    if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('controllerchange', controllerChanged)
    return () => {
      active = false
      if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('controllerchange', controllerChanged)
    }
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

  return { state, update }
}
