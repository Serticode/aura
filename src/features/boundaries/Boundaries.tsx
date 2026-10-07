import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const preferences = [
  {
    id: 'encouragement',
    title: 'Encouragement',
    description: 'Warm, kind words and gentle reassurance.',
  },
  {
    id: 'quiet',
    title: 'Quiet expression',
    description: 'A space to let feelings out without a reply.',
  },
  {
    id: 'shared',
    title: 'Shared experience',
    description: 'To know others feel this way too.',
  },
] as const

type PreferenceId = (typeof preferences)[number]['id']

export function Boundaries() {
  const navigate = useNavigate()
  const [chosen, setChosen] = useState<readonly PreferenceId[]>([])

  function togglePreference(id: PreferenceId) {
    setChosen((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <section className="animate-rise flex flex-1 flex-col justify-center px-6 py-16">
      <Link
        to="/"
        className="text-link mb-6 inline-flex w-fit items-center gap-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
      >
        <span aria-hidden="true">←</span> Back to the landing
      </Link>
      <h1 className="font-display text-3xl font-medium tracking-tight text-mulberry">What kind of support feels right?</h1>
      <p className="mt-2 text-base text-charcoal/80">Choose any that fit. You can change them anytime.</p>

      <div className="mt-8 flex flex-col gap-3">
        {preferences.map((preference, index) => {
          const selected = chosen.includes(preference.id)
          return (
            <button
              key={preference.id}
              type="button"
              aria-pressed={selected}
              onClick={() => togglePreference(preference.id)}
              className={
                [
                  'animate-rise rounded-2xl border p-4 text-left transition-colors duration-200 ease-ambient active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose',
                  selected
                    ? 'border-rose bg-rose/10'
                    : 'border-earth/15 bg-white/60 hover:border-rose/40',
                ].join(' ')
              }
              style={{ animationDelay: `${100 + index * 90}ms` }}
            >
              <span className="block text-lg font-semibold text-charcoal">{preference.title}</span>
              <span className="mt-1 block text-sm text-charcoal/70">{preference.description}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={() => navigate('/hearth')}
          className="btn-wave w-full rounded-full bg-mulberry py-3 text-base font-semibold text-ivory transition-colors duration-200 ease-ambient active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
        >
          Continue
        </button>
        <Link to="/mirror" className="text-link mx-auto mt-4 block w-fit text-center text-sm">
          Skip for now
        </Link>
      </div>
    </section>
  )
}