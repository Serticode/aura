import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { Greeting } from '@/features/greeting/Greeting'
import { Settings } from '@/features/settings/Settings'
import { Mirror } from '@/features/mirror/Mirror'
import { Pulse } from '@/features/pulse/Pulse'
import { Gathering } from '@/features/gathering/Gathering'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Greeting />} />
        <Route path="boundaries" element={<Navigate to="/settings" replace />} />
        <Route path="settings" element={<Settings />} />
        <Route path="hearth" element={<Navigate to="/mirror" replace />} />
        <Route path="mirror" element={<Mirror />} />
        <Route path="pulse" element={<Pulse />} />
        <Route path="gathering" element={<Gathering />} />
      </Route>
    </Routes>
  )
}