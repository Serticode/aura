import { useState } from 'react'
import { clearLocalData } from '@/data/localStore'
import { usePreferences } from '@/data/usePreferences'

type ClearState = 'idle' | 'confirming' | 'clearing' | 'complete' | 'error'

export function useDeviceSettings() {
  const preferences = usePreferences()
  const [clearState, setClearState] = useState<ClearState>('idle')
  async function clear() {
    setClearState('clearing')
    try {
      await clearLocalData()
      setClearState('complete')
    } catch {
      setClearState('error')
    }
  }
  return { ...preferences, clearState, setClearState, clear }
}
