import { usePreferences } from '@/data/usePreferences'

export const supportPreferences = [
  { id: 'encouragement', title: 'Encouragement', description: 'Future preference · Encouragement choices do not change Mirror yet.' },
  { id: 'quiet', title: 'Quiet expression', description: 'A space to let feelings out without a reply.' },
  { id: 'shared', title: 'Shared experience', description: 'Future preference · Shared experiences are not available in this pilot.' },
  { id: 'validation', title: 'Feeling heard', description: 'Future preference · Feeling heard does not change Mirror yet.' },
  { id: 'reflection', title: 'Room to reflect', description: 'Future preference · Reflection prompts are not available in this pilot.' },
  { id: 'grounding', title: 'A moment to settle', description: 'Future preference · Grounding invitations are not available in this pilot.' },
  { id: 'perspective', title: 'A fresh perspective', description: 'Future preference · Perspective prompts are not available in this pilot.' },
] as const


type PreferenceId = (typeof supportPreferences)[number]['id']

export function useSupportPreferences() {
  const { flags, ready, setFlag, saveStatus } = usePreferences()
  const chosen = supportPreferences.filter(({ id }) => flags[`support.${id}`] === true).map(({ id }) => id)
  function togglePreference(id: PreferenceId) {
    void setFlag(`support.${id}`, !chosen.includes(id))
  }
  return { chosen, togglePreference, saveStatus, ready }
}
