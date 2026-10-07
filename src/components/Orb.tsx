export function Orb() {
  return (
    <div aria-hidden="true" className="relative">
      <div className="animate-glow absolute -inset-4 rounded-full bg-terracotta/40 blur-2xl" />
      <div className="animate-breathe relative h-28 w-28 rounded-full bg-gradient-to-br from-terracotta via-dusk-rose to-ochre shadow-lg shadow-terracotta/30" />
    </div>
  )
}