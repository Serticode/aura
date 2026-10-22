import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Endearment } from '@/components/Endearment'
import { Orb } from '@/components/Orb'
import { moods, type Mood } from '@/app/moods'

interface GreetingProps {
  readonly onContinue: (moods: readonly Mood[]) => void
}

export function Greeting({ onContinue }: GreetingProps) {
  const navigate = useNavigate()
  const [selectedMoods, setSelectedMoods] = useState<readonly Mood[]>([])

  return (
    <section className="mx-auto flex min-h-svh w-full flex-1 flex-col px-6 pt-24 pb-32 md:px-12 lg:px-20">
      <div className="flex flex-1 flex-col items-center justify-center gap-12 py-12 text-center md:gap-16 md:py-16">
        <div className="animate-fade"><Orb /></div>
        <div className="text-center">
        <h1 className="animate-rise w-full font-display text-3xl font-medium leading-tight tracking-tight text-mulberry md:text-5xl lg:text-5xl">
          <Endearment prefix="How does today feel, " suffix="?" />
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-earth">A little room for whatever you’re carrying.</p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 pb-6 md:pb-10">
        <h2 id="greeting-feelings" className="text-sm font-medium text-earth">Choose any feelings that fit</h2>
        <div role="group" aria-labelledby="greeting-feelings" className="flex flex-wrap justify-center gap-x-3 gap-y-2 md:gap-x-2 lg:gap-x-3">
          {moods.map((option) => {
            const selected = selectedMoods.includes(option)
            return (
              <button key={option} type="button" aria-pressed={selected}
                onClick={() => setSelectedMoods((current) => current.includes(option) ? current.filter((mood) => mood !== option) : [...current, option])}
                className={[
                  'min-h-11 rounded-full border px-4 py-2 text-sm transition-colors active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose md:px-4',
                  selected ? 'border-mulberry bg-mulberry text-ivory' : 'border-mulberry/20 bg-white/60 text-charcoal hover:border-mulberry/40 hover:bg-petal/25',
                ].join(' ')}>{option}</button>
            )
          })}
          <button type="button" aria-label="Clear selected feelings" title="Clear selected feelings" disabled={selectedMoods.length === 0} onClick={() => setSelectedMoods([])}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-danger-border bg-clear-surface text-danger-border transition-colors hover:bg-clear-surface active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger disabled:border-earth/10 disabled:bg-earth/5 disabled:text-earth/40 disabled:hover:bg-earth/5">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m16 3 5 5a2 2 0 0 1 0 3L11 21H7l-4-4a2 2 0 0 1 0-3L13 3a2 2 0 0 1 3 0ZM8 9l7 7M11 21h10" /></svg>
          </button>
        </div>
        <div className="flex min-h-12 flex-wrap items-center justify-center gap-6">
          <button type="button" disabled={selectedMoods.length === 0} onClick={() => { onContinue(selectedMoods); navigate('/mirror') }}
            className="btn-wave flex min-h-12 items-center gap-8 rounded-full bg-mulberry px-7 py-3 text-sm font-semibold text-ivory transition-[background-color,color,transform] duration-300 ease-ambient active:scale-[0.98] disabled:scale-[0.98] disabled:cursor-not-allowed disabled:bg-earth/15 disabled:text-earth/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose">Continue <span aria-hidden="true" className={['transition-transform duration-300 ease-ambient', selectedMoods.length > 0 ? 'translate-x-1' : 'translate-x-0'].join(' ')}>→</span></button>
        </div>
      </div>
    </section>
  )
}
