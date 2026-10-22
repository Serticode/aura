import { useCallback, useState } from 'react'
import type { Mood } from '@/app/moods'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { Greeting } from '@/features/greeting/Greeting'
import { Mirror } from '@/features/mirror/Mirror'

export function App() {
  const [greetingMoods, setGreetingMoods] = useState<readonly Mood[]>([])
  const clearGreetingMoods = useCallback(() => setGreetingMoods([]), [])

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Greeting onContinue={setGreetingMoods} />} />
        <Route path="boundaries" element={<Navigate to="/settings" replace />} />
        <Route path="settings" element={<Greeting onContinue={setGreetingMoods} />} />
        <Route path="hearth" element={<Navigate to="/mirror" replace />} />
        <Route path="mirror" element={<Mirror initialMoods={greetingMoods} onGreetingConsumed={clearGreetingMoods} />} />
        <Route path="pulse" element={<Navigate to="/mirror" replace />} />
        <Route path="gathering" element={<Navigate to="/mirror" replace />} />
      </Route>
    </Routes>
  )
}