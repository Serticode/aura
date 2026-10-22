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

  const primary = 'btn-wave inline-flex items-center justify-center min-h-12 rounded-full bg-mulberry px-8 py-3 text-sm font-semibold text-ivory active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose'
  const textAction = 'text-link rounded-sm py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose'

  return (
    <section data-reduced-motion={mirror.reducedMotion} className="mx-auto flex min-h-screen w-full max-w-[100rem] flex-col px-6 pt-28 md:px-12 lg:px-20 pb-36">
      <header className="flex flex-wrap items-center justify-between gap-5 pb-6">
        <div>
          <h1 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-earth">Mirror</h1>
        </div>
        <div className="flex flex-wrap items-center gap-7">
          <button type="button" disabled={stage === 'releasing'} onClick={mirror.toggleSavedView} className={textAction}>{stage === 'saved' ? 'Back to Mirror' : `Saved words (${responses.filter(({ id }) => id !== 'quiet' && savedIds.includes(id)).length})`}</button>
        </div>
      </header>

      {stage === 'writing' && (
        <>
          <div className="animate-rise mx-auto flex w-full max-w-6xl flex-1 flex-col pt-12 lg:pt-16">
            <label htmlFor="mirror-draft" className="font-display text-3xl font-medium leading-tight tracking-tight text-mulberry lg:text-4xl">Leave it here.</label>
            <p id="mirror-privacy" className="sr-only">Your words aren’t saved or sent anywhere.</p>
            <textarea ref={focusTarget} id="mirror-draft" aria-describedby="mirror-privacy" value={draft} onChange={(event) => { mirror.setDraft(event.target.value); mirror.setNotice(null) }}
              placeholder="Whatever’s on your mind…"
              className="mt-6 min-h-72 w-full flex-1 resize-y rounded-xl border border-transparent bg-transparent px-1 py-4 text-xl leading-relaxed text-charcoal placeholder:text-earth/70 focus:outline-2 focus:outline-offset-4 focus:outline-rose/40 lg:min-h-80 lg:text-2xl" />
          </div>
          <div className="mx-auto mt-6 w-full max-w-6xl">
            <details open={selectedMoods.length > 0 || undefined} className="rounded-xl px-1 py-2">
              <summary className="cursor-pointer py-2 text-xs text-earth focus-visible:outline-2 focus-visible:outline-rose">{selectedMoods.length > 0 ? `${selectedMoods.length} selected` : 'Feelings'}</summary>
            <div className="flex flex-wrap items-center justify-between gap-3">

              <button type="button" disabled={selectedMoods.length === 0} onClick={() => mirror.setSelectedMoods([])} className={`${textAction} [--link-accent:var(--color-danger)] disabled:invisible`}>Clear selection</button>
            </div>
            <div role="group" aria-label="Optional feelings" className="mt-3 flex flex-wrap gap-2">
              {moods.map((option) => (
                <button key={option} type="button" aria-pressed={selectedMoods.includes(option)} onClick={() => mirror.toggleMood(option)}
                  className={[
                    'min-h-11 rounded-full border px-4 py-2 text-xs transition-colors active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose',
                    selectedMoods.includes(option) ? 'border-mulberry bg-mulberry text-ivory' : 'border-mulberry/10 bg-white/50 text-charcoal/80 hover:bg-petal/20',
                  ].join(' ')}>{option}</button>
              ))}
            </div>
            </details>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div role="group" aria-label="Response style" className="inline-flex rounded-full border border-mulberry/15 bg-white/40 p-1">
                  {[{ label: 'Gentle words', value: false }, { label: 'Just let me release', value: true }].map(({ label, value }) => (
                    <button key={label} type="button" disabled={!mirror.ready} aria-pressed={quiet === value} onClick={() => mirror.setQuietOverride(value)} className={['min-h-11 rounded-full px-4 py-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-rose', quiet === value ? 'bg-mulberry text-ivory' : 'text-earth hover:bg-petal/20'].join(' ')}>{label}</button>
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
        <div className="animate-rise mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-16 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-earth">{response.id === 'quiet' ? 'Quiet acknowledgment' : 'Prototype · Curated words'}</p>
          <h2 ref={resultTarget} tabIndex={-1} className="mt-6 rounded-lg font-display text-3xl font-medium leading-relaxed text-mulberry outline-none lg:text-4xl">{response.text}</h2>
          {response.id !== 'quiet' && (
            <button type="button" aria-disabled={mirror.savingId !== null} aria-pressed={savedIds.includes(response.id)} onClick={() => { void mirror.toggleSaved(response.id) }} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-2 py-2 text-sm leading-none text-earth hover:text-mulberry focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="block h-5 w-5 shrink-0" fill={savedIds.includes(response.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                <path d="M6 3h12v18l-6-4-6 4V3Z" />
              </svg>
              <span>{mirror.savingId === response.id ? 'Saving…' : savedIds.includes(response.id) ? 'Saved' : 'Save words'}</span>
            </button>
          )}
          <div className="mt-10 flex flex-col items-center gap-3">
            <Link to="/" className={primary}>Done for now</Link>
            <button type="button" onClick={mirror.expressAgain} className={`${textAction} min-h-11`}>Write again</button>
          </div>
        </div>
      )}

      {stage === 'saved' && (
        <div className="mx-auto w-full max-w-6xl flex-1 py-8">
          <h2 ref={resultTarget} tabIndex={-1} className="font-display text-3xl font-medium text-mulberry outline-none">Words to come back to</h2>
          <p className="mt-3 text-sm leading-relaxed text-earth">Saved on this device. Your private writing is never included.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {responses.filter(({ id }) => id !== 'quiet' && savedIds.includes(id)).map((item) => (
              <article key={item.id} className="aura-paper rounded-2xl p-7">
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
      <footer className="mt-10 text-center text-[10px] tracking-wide text-earth">
        <span>Your writing isn’t saved or sent.</span>
      </footer>
      {blocker.state === 'blocked' && <DiscardDialog onStay={() => blocker.reset()} onDiscard={() => { mirror.setDraft(''); blocker.proceed() }} />}
    </section>
  )
}
