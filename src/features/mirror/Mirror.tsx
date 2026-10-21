import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { moods, type Mood } from '@/app/moods'
import { responses } from '@/features/mirror/responses'
import { DiscardDialog } from '@/features/mirror/DiscardDialog'
import { useMirror } from '@/features/mirror/useMirror'

interface MirrorProps {
  readonly initialMoods: readonly Mood[]
  readonly onGreetingConsumed: () => void
}

export function Mirror({ initialMoods, onGreetingConsumed }: MirrorProps) {
  const mirror = useMirror(initialMoods)
  useEffect(onGreetingConsumed, [onGreetingConsumed])
  const { stage, draft, selectedMoods, quiet, response, savedIds, blocker } = mirror
  const focusTarget = useRef<HTMLTextAreaElement>(null)
  const resultTarget = useRef<HTMLHeadingElement>(null)
  const previousStage = useRef(stage)
  const previousBlocker = useRef(blocker.state)
  useEffect(() => {
    if (previousBlocker.current === 'blocked' && blocker.state === 'unblocked') {
      if (stage === 'writing') focusTarget.current?.focus()
      else resultTarget.current?.focus()
    }
    previousBlocker.current = blocker.state
  }, [blocker.state, stage])
  useEffect(() => {
    if (previousStage.current !== stage) {
      if (stage === 'writing') focusTarget.current?.focus()
      if (stage === 'response' || stage === 'saved') resultTarget.current?.focus()
    }
    previousStage.current = stage
  }, [stage])

  const primary = 'btn-wave min-h-12 rounded-full bg-mulberry px-8 py-3 text-base font-semibold text-ivory active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose'
  const textAction = 'text-link rounded-sm py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose'

  return (
    <section data-reduced-motion={mirror.reducedMotion} className="mx-auto flex min-h-screen w-full max-w-[90rem] flex-col px-6 pt-24 md:px-10 pb-36 lg:px-24">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-mulberry/10 pb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-mulberry">Mirror</h1>
          <p className="mt-1 text-sm text-earth">A little room for whatever you’re carrying.</p>
        </div>
        <div className="flex flex-wrap items-center gap-7">
          <button type="button" disabled={stage === 'releasing'} onClick={mirror.toggleSavedView} className={textAction}>{stage === 'saved' ? 'Back to Mirror' : `Saved words (${responses.filter(({ id }) => id !== 'quiet' && savedIds.includes(id)).length})`}</button>
          <Link to="/" className={textAction}>Back to the landing</Link>
        </div>
      </header>

      {stage === 'writing' && (
        <>
          <div className="animate-rise mx-auto flex w-full max-w-4xl flex-1 flex-col pt-12 lg:pt-16">
            <label htmlFor="mirror-draft" className="font-display text-3xl font-medium leading-tight tracking-tight text-mulberry lg:text-4xl">What would you like to put down?</label>
            <p id="mirror-privacy" className="mt-4 text-sm leading-relaxed text-earth">Your words stay in this session. They aren’t saved or sent anywhere.</p>
            <textarea ref={focusTarget} id="mirror-draft" aria-describedby="mirror-privacy" value={draft} onChange={(event) => { mirror.setDraft(event.target.value); mirror.setNotice(null) }}
              placeholder="A word, a thought, a feeling. Start wherever you are…"
              className="mt-7 min-h-64 w-full flex-1 resize-y rounded-xl border border-transparent bg-transparent p-4 text-xl leading-relaxed text-charcoal placeholder:text-earth/55 focus:border-mulberry/20 focus:outline-2 focus:outline-offset-4 focus:outline-rose/40 lg:min-h-72" />
            <p className="mt-2 self-end text-xs tabular-nums text-earth">{Array.from(draft).length} characters · No minimum</p>
          </div>
          <div className="mt-9 border-t border-mulberry/10 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-earth">Which feelings fit? Choose any, or none.</p>
              <button type="button" disabled={selectedMoods.length === 0} onClick={() => mirror.setSelectedMoods([])} className={`${textAction} [--link-accent:var(--color-danger)] disabled:invisible`}>Clear selection</button>
            </div>
            <div role="group" aria-label="Optional feelings" className="mt-3 flex flex-wrap gap-2">
              {moods.map((option) => (
                <button key={option} type="button" aria-pressed={selectedMoods.includes(option)} onClick={() => mirror.toggleMood(option)}
                  className={[
                    'min-h-11 rounded-full border px-5 py-2 text-sm transition-colors active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose',
                    selectedMoods.includes(option) ? 'border-mulberry bg-mulberry text-ivory' : 'border-mulberry/20 text-charcoal/80 hover:bg-petal/20',
                  ].join(' ')}>{option}</button>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-6">
              <div>
                <p id="response-mode" className="mb-2 text-xs text-earth">What would feel right this time?</p>
                <div role="group" aria-labelledby="response-mode" className="inline-flex rounded-full border border-mulberry/15 bg-white/40 p-1">
                  {[{ label: 'Gentle words', value: false }, { label: 'Just let me release', value: true }].map(({ label, value }) => (
                    <button key={label} type="button" disabled={!mirror.ready} aria-pressed={quiet === value} onClick={() => mirror.setQuietOverride(value)} className={['min-h-10 rounded-full px-5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-rose', quiet === value ? 'bg-mulberry text-ivory' : 'text-earth hover:bg-petal/20'].join(' ')}>{label}</button>
                  ))}
                </div>
              </div>
              <button type="button" disabled={!mirror.ready} onClick={mirror.release} className={`${primary} disabled:opacity-50`}>Release <span aria-hidden="true" className="ml-6">↑</span></button>
            </div>
          </div>
        </>
      )}

      {stage === 'releasing' && (
        <div role="status" className="flex flex-1 flex-col items-center justify-center py-28">
          <div aria-hidden="true" className="relative h-24 w-24">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => <span key={i} className="release-petal absolute left-10 top-10 h-4 w-4 rounded-full bg-rose/50" style={{ '--petal-x': `${Math.cos(i * Math.PI * 2 / 7) * 65}px`, '--petal-y': `${Math.sin(i * Math.PI * 2 / 7) * 65}px` } as CSSProperties} />)}
          </div>
          <p className="mt-6 text-sm text-earth">Released.</p>
        </div>
      )}

      {stage === 'response' && (
        <div className="animate-rise mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-earth">{response.id === 'quiet' ? 'Quiet acknowledgment' : 'Prototype · Curated words'}</p>
          <h2 ref={resultTarget} tabIndex={-1} className="mt-7 rounded-lg font-display text-3xl font-medium leading-relaxed text-mulberry outline-none lg:text-4xl">{response.text}</h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <button type="button" onClick={mirror.expressAgain} className={primary}>Express something else</button>
            {response.id !== 'quiet' && <button type="button" aria-disabled={mirror.savingId !== null} aria-pressed={savedIds.includes(response.id)} onClick={() => { void mirror.toggleSaved(response.id) }} className={textAction}>{mirror.savingId === response.id ? 'Saving…' : savedIds.includes(response.id) ? 'Remove saved affirmation' : 'Save affirmation'}</button>}
          </div>
          <button type="button" onClick={mirror.expressAgain} className={`${textAction} mt-4`}>Done for now</button>
        </div>
      )}

      {stage === 'saved' && (
        <div className="mx-auto w-full max-w-4xl flex-1 py-12">
          <h2 ref={resultTarget} tabIndex={-1} className="font-display text-3xl font-medium text-mulberry outline-none">Words to come back to</h2>
          <p className="mt-3 text-sm leading-relaxed text-earth">Saved on this device. Your private writing is never included.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {responses.filter(({ id }) => id !== 'quiet' && savedIds.includes(id)).map((item) => (
              <article key={item.id} className="rounded-2xl border border-mulberry/10 bg-white/40 p-7">
                <p className="font-display text-xl leading-relaxed text-mulberry">{item.text}</p>
                <p className="mt-4 text-xs text-earth">Prototype curated copy</p>
                <button type="button" aria-disabled={mirror.savingId !== null} onClick={() => { void mirror.toggleSaved(item.id) }} aria-label={`Remove affirmation: ${item.text}`} className={`${textAction} mt-3 [--link-accent:var(--color-danger)]`}>Remove</button>
              </article>
            ))}
          </div>
          {!responses.some(({ id }) => id !== 'quiet' && savedIds.includes(id)) && <p className="mt-12 rounded-2xl border border-dashed border-mulberry/20 px-8 py-12 text-center text-earth">Nothing saved yet. After a release, you can keep words you’d like to revisit.</p>}
        </div>
      )}

      {mirror.notice !== null && <p role="status" className="mt-5 text-sm text-earth">{mirror.notice}</p>}
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-earth">
        <span>Private expression. No conversation to keep up with. <Link to="/settings" className={textAction}>Privacy & device settings</Link></span>
        <div>
          <button type="button" role="switch" aria-checked={mirror.motionOverride} disabled={!mirror.ready} onClick={mirror.toggleMotion} className="rounded-md px-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose">Reduce motion: {mirror.motionOverride ? 'On' : 'Off'}{mirror.systemReduced ? ' · System reduction active' : ''}</button>
          <p role="status" className="text-right">{mirror.saveStatus.startsWith('Could not') || mirror.saveStatus.startsWith('Device') ? mirror.saveStatus : ''}</p>
        </div>
      </footer>
      {blocker.state === 'blocked' && <DiscardDialog onStay={() => blocker.reset()} onDiscard={() => { mirror.setDraft(''); blocker.proceed() }} />}
    </section>
  )
}
