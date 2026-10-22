import { useEffect, useRef } from 'react'
import { useDeviceSettings } from '@/features/settings/useDeviceSettings'

export function DeviceSettings() {
  const device = useDeviceSettings()
  const dialog = useRef<HTMLDialogElement>(null)
  const clearButton = useRef<HTMLButtonElement>(null)
  const confirming = device.clearState === 'confirming' || device.clearState === 'clearing'
  useEffect(() => {
    if (!confirming) return
    const element = dialog.current!
    const trigger = clearButton.current
    element.showModal()
    return () => { element.close(); trigger?.focus() }
  }, [confirming])

  return (
    <div className="grid items-start gap-4">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-charcoal">What stays here</h4>
          <p className="mt-3 text-sm leading-relaxed text-earth">Mirror writing stays in memory while you write. Release or discard clears the draft. It isn’t sent to a server, saved as history, or read by AI.</p>
          <p className="mt-3 text-sm leading-relaxed text-earth">Saved words keep only the identifier of a curated affirmation. Your preferences and saved words stay in this browser on this device.</p>
          <p className="mt-3 text-sm leading-relaxed text-earth">Gentle words are prototype editorial drafts. Gentle words is Mirror’s default. Quiet release is an optional choice for each expression. Other support choices are saved for future features.</p>
        </div>
        <p role="status" className="pt-2 text-xs leading-relaxed text-earth">{device.saveStatus}</p>
        <div className="pt-2">
          <h4 className="text-sm font-semibold text-charcoal">Clear data on this device</h4>
          <p className="mt-2 text-sm leading-relaxed text-earth">Remove saved words and reset all preferences, including appearance. This cannot be undone.</p>
          <button ref={clearButton} type="button" disabled={!device.ready || device.clearState === 'clearing'} onClick={() => device.setClearState('confirming')}
            className="text-link mt-4 min-h-11 rounded-sm text-sm [--link-accent:var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger">Clear device data</button>
          <p role="status" className="mt-2 text-sm text-earth">
            {device.clearState === 'complete' && 'Saved words removed. Your preferences are reset.'}
            {device.clearState === 'error' && 'Could not finish clearing device data. Try again; your browser may have storage disabled.'}
          </p>
        </div>
      </div>
      <dialog ref={dialog} aria-labelledby="clear-title" aria-describedby="clear-description" onCancel={(event) => {
        event.preventDefault()
        if (device.clearState !== 'clearing') device.setClearState('idle')
      }} className="m-auto w-[min(28rem,90vw)] rounded-3xl border border-mulberry/15 bg-ivory p-8 text-charcoal shadow-xl backdrop:bg-mulberry/25">
        <h2 id="clear-title" className="text-xl font-semibold text-mulberry">Clear your device data?</h2>
        <p id="clear-description" className="mt-3 text-sm leading-relaxed text-earth">Your saved words will be removed. All preferences, including appearance, will reset. You can’t undo this.</p>
        <div className="mt-8 flex flex-wrap justify-end gap-4">
          <button autoFocus type="button" disabled={device.clearState === 'clearing'} onClick={() => device.setClearState('idle')} className="min-h-11 rounded-full bg-mulberry px-6 py-3 text-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose">Keep my data</button>
          <button type="button" disabled={device.clearState === 'clearing'} onClick={() => { void device.clear() }} className="text-link min-h-11 rounded-sm px-2 py-3 [--link-accent:var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger">{device.clearState === 'clearing' ? 'Clearing…' : 'Clear data'}</button>
        </div>
      </dialog>
    </div>
  )
}
