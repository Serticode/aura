import { useEffect, useRef, useState } from 'react'
import { liveQuery } from 'dexie'
import { useBeforeUnload, useBlocker } from 'react-router-dom'
import type { Mood } from '@/app/moods'
import { usePreferences } from '@/data/usePreferences'
import { localStore } from '@/data/localStore'
import { responses, selectResponse, type ResponseId } from '@/features/mirror/responses'

type Stage = 'writing' | 'releasing' | 'response' | 'saved'

export function useMirror(initialMoods: readonly Mood[]) {
  const { flags, ready } = usePreferences()
  const [draft, setDraft] = useState('')
  const [selectedMoods, setSelectedMoods] = useState<readonly Mood[]>(initialMoods)
  const [quietOverride, setQuietOverride] = useState(false)
  const quiet = quietOverride
  const [stage, setStage] = useState<Stage>('writing')
  const [response, setResponse] = useState<(typeof responses)[number]>(responses[2])
  const [savedReturnStage, setSavedReturnStage] = useState<Stage>('writing')
  const [savingId, setSavingId] = useState<ResponseId | null>(null)
  const saving = useRef(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<readonly string[]>([])
  const [systemReduced, setSystemReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const reducedMotion = systemReduced || flags['reducedMotion'] === true
  const blocker = useBlocker(({ currentLocation, nextLocation }) => draft.length > 0 && currentLocation.pathname !== nextLocation.pathname)

  useBeforeUnload((event) => {
    if (draft.length > 0) { event.preventDefault(); event.returnValue = '' }
  })
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setSystemReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  useEffect(() => {
    let active = true
    const subscription = liveQuery(() => localStore.affirmations.toArray()).subscribe({
      next: (rows) => { if (active) setSavedIds(rows.map(({ id }) => id)) },
      error: () => { if (active) setNotice('Saved words are unavailable because device storage could not be opened.') },
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    if (stage !== 'releasing') return
    const timer = window.setTimeout(() => setStage('response'), reducedMotion ? 0 : 500)
    return () => window.clearTimeout(timer)
  }, [stage, reducedMotion])

  useEffect(() => {
    const finishWhenHidden = () => {
      if (document.hidden && stage === 'releasing') setStage('response')
    }
    document.addEventListener('visibilitychange', finishWhenHidden)
    return () => document.removeEventListener('visibilitychange', finishWhenHidden)
  }, [stage])

  function toggleMood(mood: Mood) {
    setSelectedMoods((current) => current.includes(mood) ? current.filter((item) => item !== mood) : [...current, mood])
    setNotice(null)
  }
  function release() {
    if (stage !== 'writing') return
    if (draft.trim() === '' && selectedMoods.length === 0 && !quiet) {
      setNotice('Choose a feeling, write a little, or release quietly. There is room for you here.')
      return
    }
    setResponse(selectResponse(selectedMoods, quiet))
    setDraft('')
    setNotice(null)
    setStage(reducedMotion ? 'response' : 'releasing')
  }
  function expressAgain() {
    setDraft('')
    setSelectedMoods([])
    setQuietOverride(false)
    setResponse(responses[2])
    setStage('writing')
    setNotice(null)
  }
  function toggleSavedView() {
    setNotice(null)
    if (stage === 'saved') setStage(savedReturnStage)
    else { setSavedReturnStage(stage); setStage('saved') }
  }
  async function toggleSaved(id: ResponseId) {
    if (saving.current) return
    saving.current = true
    setSavingId(id)
    try {
      const saved = savedIds.includes(id)
      if (saved) await localStore.affirmations.delete(id)
      else await localStore.affirmations.put({ id })
      setNotice(saved ? 'Removed from your saved words.' : 'Saved on this device.')
    } catch {
      setNotice('Could not update saved words. Your browser may have device storage disabled.')
    } finally {
      saving.current = false
      setSavingId(null)
    }
  }

  return {
    draft, setDraft, selectedMoods, setSelectedMoods, toggleMood, quiet, setQuietOverride,
    stage, response, notice, setNotice, toggleSavedView, savingId,
    release, expressAgain, savedIds, toggleSaved, blocker, ready, reducedMotion,
  }
}
