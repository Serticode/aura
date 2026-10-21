import { usePreferences } from '@/data/usePreferences'

export function usePlatformSounds() {
  const { flags, ready, setFlag, saveStatus } = usePreferences()
  const enabled = flags.sounds === true
  function toggleSounds() { void setFlag('sounds', !enabled) }
  return { enabled, toggleSounds, ready, saveError: saveStatus.startsWith('Could not') || saveStatus.startsWith('Device') ? saveStatus : null }
}
