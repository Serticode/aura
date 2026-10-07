import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Orb } from '@/components/Orb'

const moods = ['Overwhelmed', 'Low', 'Tired', 'Anxious', 'Okay', 'Hopeful'] as const

export function Greeting() {
  const navigate = useNavigate()
  const [mood, setMood] = useState<(typeof moods)[number] | null>(null)

  return (
    <section className="landing-wash flex flex-1 flex-col px-6 pt-16 pb-28">
      <div className="flex flex-col items-center text-center">
        <div className="animate-rise">
          <Orb />
        </div>
        <h1 className="animate-rise mt-8 text-3xl font-medium tracking-tight text-ink" style={{ animationDelay: '90ms' }}>
          How does today feel?
        </h1>
        <p className="animate-rise mt-2 max-w-xs text-base text-earth" style={{ animationDelay: '150ms' }}>
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
                    'rounded-full border px-4 py-2 text-sm transition-colors duration-200 ease-ambient active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
                    selected
                      ? 'border-terracotta bg-terracotta/15 font-medium text-terracotta'
                      : 'border-earth/20 bg-white/60 text-earth hover:border-earth/40',
                  ].join(' ')
                }
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className="mt-10">
          <label htmlFor="weight" className="flex justify-between text-sm text-earth">
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
            className="mt-2 w-full accent-terracotta"
          />
        </div>
      </div>

      <div className="animate-rise mt-auto pt-8" style={{ animationDelay: '300ms' }}>
        <button
          type="button"
          onClick={() => navigate('/boundaries')}
          className="w-full rounded-full bg-terracotta py-3 text-base font-medium text-cream transition-colors duration-200 ease-ambient hover:bg-terracotta/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Continue
        </button>
        <Link
          to="/boundaries"
          className="mt-4 block text-center text-sm text-earth underline-offset-4 hover:underline"
        >
          Skip for now
        </Link>
      </div>
    </section>
  )
}