import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { Hearth } from '@/features/hearth/Hearth'
import { Mirror } from '@/features/mirror/Mirror'
import { Pulse } from '@/features/pulse/Pulse'
import { Gathering } from '@/features/gathering/Gathering'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Hearth />} />
        <Route path="mirror" element={<Mirror />} />
        <Route path="pulse" element={<Pulse />} />
        <Route path="gathering" element={<Gathering />} />
      </Route>
    </Routes>
  )
}