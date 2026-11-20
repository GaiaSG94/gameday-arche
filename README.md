# Arche

A daily roguelite-lite for Reddit, built on [Devvit Web](https://developers.reddit.com/).

**One generated run, six rooms, three relics.** Draft a relic, then walk the same
daily seed as everyone else. Every arch costs torch light; reach room six with
the flame still lit. Your score is the light you have left.

## How to play

1. Draft one of the offered relics before rooms 1, 3 and 5.
2. Choose the narrow arch (cheap) or the wide arch (costly, but pays more light
   on the next room). The torch shows what you will have left after the choice.
3. Walk all six rooms before the light runs out. Reaching room six extends your
   streak; replaying the same day never changes it.
4. Check the daily ranking and post your result with one tap in the comments.

One run per day, same seed for everyone, generated from the UTC date. Streaks,
community stats and the daily board live in Redis on the Devvit server. The
server replays your chosen path against the daily seed before recording a
score, so the board reflects the real generated run.

## Stack

- React 19 + Vite + TypeScript (client inside a Reddit post)
- Hono on Devvit (`/api/init`, `/api/finish`, `/api/board`, `/api/comment`),
  Redis persistence
- Shared deterministic generator (`src/shared/game.ts`), tested over a full year
- Locked visual system "Contour": black, white, one flame accent, thick strokes,
  Ubuntu embedded locally (Ubuntu Font Licence, `public/fonts/UFL.txt`), no
  external request

## Development

```bash
npm install
npm run dev
npm test
npm run test:types
npm run lint
npm run build
```

`npm test` runs the node:test suite; `npm run test:types` is the TypeScript
check (there is no `type-check` script). `npm run build` produces the client
and server bundles consumed by `devvit.json`.

### Design captures

`capture/` renders the four screens of the locked design with fixture data and
screenshots them next to the design boards (used by the implementation review
and by the demo video):

```bash
npx vite build --config vite.capture.config.ts   # build the capture page
python -m http.server 8765 --bind 127.0.0.1 --directory capture/dist
node capture/compare.mjs <output-folder>         # planche vs product, side by side
node capture/inspect.mjs                         # layout geometry dump
```

## Submission

Built for the Reddit Game of the Day Hackathon (Best Daily Game track). The app
is kept private during the submission period. The app listing, the public demo
post in a test subreddit and the Devpost entry are created at submission time
by a human; no publication happens from this repository before then.
