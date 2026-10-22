import { usePreferences } from '@/data/usePreferences'

export const supportPreferences = [
  { id: 'encouragement', title: 'Encouragement', description: 'Receive a little encouragement when things feel difficult.' },
  { id: 'quiet', title: 'Quiet expression', description: 'A space to let feelings out without a reply.' },
  { id: 'shared', title: 'Shared experience', description: 'Hear from others who recognise what you’re going through.' },
  { id: 'validation', title: 'Feeling heard', description: 'Have your feelings acknowledged without advice.' },
  { id: 'reflection', title: 'Room to reflect', description: 'Make room to understand what you’re feeling.' },
  { id: 'grounding', title: 'A moment to settle', description: 'Take a gentle pause and reconnect with the present.' },
  { id: 'perspective', title: 'A fresh perspective', description: 'Explore another way to look at what’s on your mind.' },
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
