import { Link } from 'react-router-dom'
import { Orb } from '@/components/Orb'

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
    <section className="landing-wash flex flex-1 flex-col items-center px-6 pt-12 pb-24">
      <div className="animate-rise">
        <Orb />
      </div>
      <p className="animate-rise mt-8 text-sm text-earth" style={{ animationDelay: '120ms' }}>
        How does today feel?
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        {spaces.map((space, index) => (
          <Link
            key={space.title}
            to={space.to}
            className="animate-rise rounded-2xl border border-earth/10 bg-white/60 p-4 transition-colors hover:bg-white"
            style={{ animationDelay: `${220 + index * 90}ms` }}
          >
            <h2 className="text-lg font-medium text-ink">{space.title}</h2>
            <p className="mt-1 text-sm text-earth">{space.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}