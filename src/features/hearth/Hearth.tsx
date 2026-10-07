import { Link } from 'react-router-dom'

const spaces = [
  {
    to: '/mirror',
    title: 'Mirror',
    description: 'Your words, held privately on this device.',
  },
  {
    to: '/pulse',
    title: 'Pulse',
    description: 'One quiet question. See how the group is feeling.',
  },
  {
    to: '/gathering',
    title: 'Gathering',
    description: 'A gentle conversation around today\'s prompt.',
  },
] as const

export function Hearth() {
  return (
    <section className="animate-rise flex flex-1 flex-col justify-center px-6 py-16">
      <Link
        to="/"
        className="text-link mb-6 inline-flex w-fit items-center gap-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
      >
        <span aria-hidden="true">←</span> Back to the landing
      </Link>
      <h1 className="font-display text-3xl font-medium tracking-tight text-mulberry">Where would you like to go?</h1>
      <p className="mt-2 text-base text-charcoal/80">All spaces are open to you. Start anywhere.</p>

      <div className="mt-8 flex flex-col gap-3">
        {spaces.map((space, index) => (
          <Link
            key={space.title}
            to={space.to}
            className="animate-rise rounded-2xl border border-earth/15 bg-white/60 p-4 transition-colors duration-200 ease-ambient hover:border-rose/40 hover:bg-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
            style={{ animationDelay: `${100 + index * 90}ms` }}
          >
            <h2 className="text-lg font-semibold text-charcoal">{space.title}</h2>
            <p className="mt-1 text-sm text-charcoal/70">{space.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}