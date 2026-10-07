import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Orb } from '@/components/Orb'

const moods = ['Overwhelmed', 'Low', 'Tired', 'Anxious', 'Okay', 'Hopeful'] as const

export function Greeting() {
  const navigate = useNavigate()
  const [mood, setMood] = useState<(typeof moods)[number] | null>(null)

  return (
    <section className="landing-wash flex flex-1 flex-col justify-center px-6 py-16">
      <div className="flex flex-col items-center text-center">
        <div className="animate-rise">
          <Orb />
        </div>
        <h1 className="animate-rise mt-12 font-display text-3xl font-medium tracking-tight text-mulberry" style={{ animationDelay: '90ms' }}>
          How does today feel?
        </h1>
        <p className="animate-rise mt-2 max-w-xs text-base text-charcoal/80" style={{ animationDelay: '150ms' }}>
          Name it, rate it on the slider, or simply skip. There is no wrong answer.
        </p>
      </div>

      <div className="animate-rise mt-10" style={{ animationDelay: '220ms' }}>
        <div role="group" aria-label="Choose a mood" className="flex flex-wrap justify-center gap-2.5">
          {moods.map((option) => {
            const selected = mood === option
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => setMood(option)}
                className={
                  [
                    'rounded-full border px-4 py-2 text-sm transition-colors duration-200 ease-ambient active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose',
                    selected
                      ? 'border-rose bg-rose/15 font-medium text-rose-deep'
                      : 'border-earth/20 bg-white/60 text-charcoal/70 hover:border-rose/40',
                  ].join(' ')
                }
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className="mt-10">
          <label htmlFor="weight" className="flex justify-between text-sm text-charcoal/70">
            <span>Gentle</span>
            <span>Heavy</span>
          </label>
          <input
            id="weight"
            type="range"
            min={0}
            max={100}
            defaultValue={50}
            aria-label="How heavy does today feel?"
            className="mt-2 w-full accent-rose"
          />
        </div>
      </div>

      <div className="animate-rise mt-10" style={{ animationDelay: '300ms' }}>
        <button
          type="button"
          onClick={() => navigate('/boundaries')}
          className="w-full rounded-full bg-mulberry py-3 text-base font-semibold text-ivory transition-colors duration-200 ease-ambient hover:bg-rose-deep active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
        >
          Continue
        </button>
        <Link
          to="/boundaries"
          className="text-link mx-auto mt-4 block w-fit text-center text-sm"
        >
          Skip for now
        </Link>
      </div>
    </section>
  )
}