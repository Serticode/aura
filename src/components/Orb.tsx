export function Orb() {
  return (
    <div aria-hidden="true" className="relative h-32 w-32">
      <div className="animate-glow absolute -inset-4 rounded-full bg-terracotta/40 blur-2xl" />
      <div className="animate-orbit pointer-events-none absolute inset-0">
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta shadow-[0_0_8px_2px_rgba(201,111,74,0.55)]" />
      </div>
      <div className="animate-blob relative h-full w-full overflow-hidden ring-2 ring-dusk-rose/25">
        <div className="animate-drift absolute -inset-1/2 bg-[length:200%_200%] bg-[radial-gradient(circle_at_30%_30%,var(--color-ochre),var(--color-terracotta)_45%,var(--color-dusk-rose))] blur-[1px]" />
      </div>
    </div>
  )
}