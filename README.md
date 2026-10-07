# Aura

A quiet space to express how today feels — with gentle words and the choice to connect.

Aura is an emotional support app for adults navigating difficult moods. It combines private expression (Mirror), a low-effort collective check-in (Pulse), and supportive prompted conversation (Gathering).

## Stack

- Vite + React + TypeScript (strict)
- Tailwind CSS v4
- vite-plugin-pwa (offline shell)
- Supabase, GraphQL, or a managed backend for community features (added in a later phase)

## Development

```bash
npm install
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Type-check and production build |
| `npm run lint` | OXLint |
| `npm run preview` | Preview the production build |

## Spaces

- **Mirror** — private, local-only expression with curated acknowledgment
- **Pulse** — one daily poll with honest aggregate results
- **Gathering** — daily prompted conversation, bounded and moderated

See the [Aura product documentation](https://github.com/Serticode/aura) for the full specification.