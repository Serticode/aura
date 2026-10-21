import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'
import { loadFlags, localStore } from '@/data/localStore'

export function usePreferences() {
  const [flags, setFlags] = useState<Readonly<Record<string, boolean>>>({})
  const [ready, setReady] = useState(false)
  const [saveStatus, setSaveStatus] = useState('Loading your preferences…')
  useEffect(() => {
    let active = true
    let unsubscribe = () => {}
    function unavailable() {
      if (active) {
        setSaveStatus('Device storage is unavailable. Changes apply only while this page is open.')
        setReady(true)
      }
    }
    loadFlags().then(() => {
      if (!active) return
      const subscription = liveQuery(() => localStore.flags.toArray()).subscribe({
        next: (rows) => {
          setFlags(Object.fromEntries(rows.map(({ id, enabled }) => [id, enabled])))
          setSaveStatus('Changes are saved on this device.')
          setReady(true)
        },
        error: unavailable,
      })
      unsubscribe = () => subscription.unsubscribe()
    }).catch(unavailable)
    return () => { active = false; unsubscribe() }
  }, [])

  async function setFlag(id: string, enabled: boolean) {
    setFlags((current) => ({ ...current, [id]: enabled }))
    try {
      await localStore.flags.put({ id, enabled })
      setSaveStatus('Changes are saved on this device.')
    } catch {
      setSaveStatus('Could not save this change. It applies only while this page is open.')
    }
  }

  return { flags, ready, setFlag, saveStatus }
}
