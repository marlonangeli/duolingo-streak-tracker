# Duolingo Streak Tracker

Public Duolingo stats API + embeddable SVG cards for GitHub READMEs.

> 🇧🇷 Portuguese: see [`docs/README.pt-BR.md`](./docs/README.pt-BR.md)

---

## Features

- Public profile stats endpoint: `GET /api/stats/:username`
- Dynamic SVG card endpoint: `GET /api/card/:username`
- Card variants and themes for README usage
- Mobile-friendly profile page: `/:username`
- Bun-first setup and CI/CD-ready workflows for Vercel

## Quick Start

```bash
bun install
bun run dev
```

Open: `http://localhost:3000`

## API

### `GET /api/stats/:username`

Returns normalized public profile data (streak, XP, languages, etc).

Example:

```bash
curl "https://duolingo-streak-tracker.vercel.app/api/stats/marlonangeli"
```

### `GET /api/card/:username`

Returns an `image/svg+xml` card you can embed directly in Markdown.

Card icons and brand assets are resolved from public URLs at request time so
the generated SVG stays consistent between local and deployed environments.

Supported query params:

- `theme`: `duo | dark | light | sunset`
- `variant`: `default | compact | minimal | badges`
- `show`: comma-separated metrics (`streak,xp,languages,league,plus`)
- `langLimit`: `1..6`
- `title`: custom title

Example:

```text
https://duolingo-streak-tracker.vercel.app/api/card/marlonangeli?theme=duo&variant=default
```

## Embed in GitHub README

```md
![Duolingo Streak Card](https://duolingo-streak-tracker.vercel.app/api/card/marlonangeli?theme=duo&variant=default)
```

## Notes about League Data

Duolingo currently does not expose a reliable unauthenticated public league/rank endpoint.
The API returns a stable `league` object with `available: false` when league data is not publicly available.

## Scripts

- `bun run dev`
- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `bun run check`

## License

MIT
