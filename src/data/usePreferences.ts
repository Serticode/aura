import { useContext } from 'react'
import { PreferencesContext } from '@/data/preferencesContext'

export function usePreferences() {
  // The application root provides the single device-preference session.
  return useContext(PreferencesContext)!
}
