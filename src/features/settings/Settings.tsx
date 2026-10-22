import { Accordion } from '@/components/Accordion'
import { DeviceSettings } from '@/features/settings/DeviceSettings'
import { SettingSwitch } from '@/features/settings/SettingSwitch'
import { usePreferences } from '@/data/usePreferences'
import { supportPreferences, useSupportPreferences } from '@/features/settings/useSupportPreferences'

interface SettingsProps {
  readonly dark: boolean
  readonly onToggleTheme: () => void
}

export function Settings({ dark, onToggleTheme }: SettingsProps) {
  const { flags, ready, setFlag, saveStatus } = usePreferences()
  const { chosen, togglePreference } = useSupportPreferences()
  return (
    <section className="w-full px-6 py-6">
      <header className="mb-3 pr-12"><h2 className="font-display text-2xl text-mulberry">Make yourself at home.</h2><p className="mt-2 text-xs text-earth">Your space, your settings.</p></header>
      <div className="divide-y divide-mulberry/10">
        <SettingSwitch label="Dark appearance" description="A softer light for your space." enabled={dark} disabled={!ready} onToggle={onToggleTheme} />
        <SettingSwitch label="Reduce motion" description="Keep things still. Your system preference is always respected." enabled={flags.reducedMotion === true} disabled={!ready} onToggle={() => { void setFlag('reducedMotion', flags.reducedMotion !== true) }} />
        <SettingSwitch label="Platform sounds" description="Unavailable in this pilot." enabled={flags.sounds === true} disabled={true} onToggle={() => {}} />
      </div>
      <p role="status" className="mt-2 text-[11px] leading-relaxed text-earth">{saveStatus}</p>
      <div className="mt-5"><Accordion title="Privacy & device">
        <DeviceSettings />
      </Accordion></div>
      <div className="mt-3"><Accordion title="Preferences for future spaces">
        <p className="mt-2 text-xs leading-relaxed text-earth">These choices record your interest. They don’t change this pilot.</p>
        <div className="mt-3 divide-y divide-mulberry/10">
          {supportPreferences.filter(({ id }) => id !== 'quiet').map((preference) => (
            <SettingSwitch key={preference.id} label={preference.title} description={preference.description} enabled={chosen.includes(preference.id)} disabled={!ready} onToggle={() => togglePreference(preference.id)} />
          ))}
        </div>
      </Accordion></div>
    </section>
  )
}
