import { useEffect, useState } from 'react'
import { usePreferences } from '@/data/usePreferences'

export function useAppearance() {
  const { flags, setFlag } = usePreferences()
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const changed = () => setSystemDark(media.matches)
    media.addEventListener('change', changed)
    return () => media.removeEventListener('change', changed)
  }, [])
  const dark = flags['appearance.dark'] ?? systemDark
  return { dark, toggle: () => { void setFlag('appearance.dark', !dark) } }
}
