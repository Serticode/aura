import Dexie, { type EntityTable } from 'dexie'

interface Flag { readonly id: string; readonly enabled: boolean }
interface SavedAffirmation { readonly id: string }

export const localStore = new Dexie('aura') as Dexie & {
  flags: EntityTable<Flag, 'id'>
  affirmations: EntityTable<SavedAffirmation, 'id'>
}
localStore.version(1).stores({ flags: 'id', affirmations: 'id' })

export async function loadFlags(): Promise<readonly Flag[]> {
  await localStore.transaction('rw', localStore.flags, async () => {
    if (await localStore.flags.get('_legacy_migrated')) return
    const ids = ['encouragement', 'quiet', 'shared', 'validation', 'reflection', 'grounding', 'perspective']
    const flags: Flag[] = []
    try {
      for (const id of ids) flags.push({ id: `support.${id}`, enabled: localStorage.getItem(`aura.support.${id}`) === 'true' })
      flags.push({ id: 'sounds', enabled: localStorage.getItem('aura.sounds') === 'true' })
    } catch {
      // Browser storage may be unavailable; IndexedDB remains the preferred store.
    }
    await localStore.flags.bulkPut([...flags, { id: '_legacy_migrated', enabled: true }])
  })
  return localStore.flags.toArray()
}

export async function clearLocalData() {
  // Remove legacy keys so older preferences cannot return after a reset.
  for (const id of ['encouragement', 'quiet', 'shared', 'validation', 'reflection', 'grounding', 'perspective']) {
    localStorage.removeItem(`aura.support.${id}`)
  }
  localStorage.removeItem('aura.sounds')
  await localStore.transaction('rw', localStore.flags, localStore.affirmations, async () => {
    await localStore.flags.clear()
    await localStore.affirmations.clear()
    await localStore.flags.put({ id: '_legacy_migrated', enabled: true })
  })
}
