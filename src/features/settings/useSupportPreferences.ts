import { usePreferences } from '@/data/usePreferences'

export const supportPreferences = [
  { id: 'encouragement', title: 'Encouragement', description: 'Warm, kind words and gentle reassurance.' },
  { id: 'quiet', title: 'Quiet expression', description: 'A space to let feelings out without a reply.' },
  { id: 'shared', title: 'Shared experience', description: 'To know others feel this way too.' },
  { id: 'validation', title: 'Feeling heard', description: 'Acknowledgment without trying to fix how you feel.' },
  { id: 'reflection', title: 'Room to reflect', description: 'Gentle prompts to help you find your own words.' },
  { id: 'grounding', title: 'A moment to settle', description: 'Simple invitations to pause and notice the present.' },
  { id: 'perspective', title: 'A fresh perspective', description: 'Another way to look at things, when you feel ready.' },
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
