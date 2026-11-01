# Quiz Duel

Paste your notes and get 10 multiple-choice questions. Send the link to a friend, and you both play the same quiz. Highest score wins. There's a rematch button, and a leaderboard across all finished duels.

The look is borrowed from [Multica](https://github.com/multica-ai/multica)'s design tokens (zinc surfaces, one blue brand hue, compact radii, role-named type scale). It reuses none of Multica's code.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

## How it works

1. **Create:** paste notes (80 to 40,000 characters) and your name. The server builds a 10-question quiz and a duel.
2. **Share:** copy the duel link. Your friend opens it, enters a name, and accepts. Players don't need to be online at the same time.
3. **Play:** each question has a 20-second timer. A correct answer scores 100 points, plus up to 50 for speed. Keys `1`–`4` or `A`–`D` answer, and `Enter` goes to the next question.
4. **Results:** both scoreboards update live (polling). Once you finish, you can review your answers.
5. **Rematch:** either player clicks *Rematch*. This builds a new quiz from the same notes, avoiding the questions you just had. The other player sees *Join rematch*.
6. **Leaderboard:** `/leaderboard` ranks players by wins, then total points, across every finished duel.

### Question generation

- **With `ANTHROPIC_API_KEY` set:** Claude (`claude-opus-5-5`) writes the quiz using structured outputs, so the response is always valid JSON. Server-side refusal fallback is on (`fallbacks: "default"`).
- **Without a key, or if the API call fails:** an offline generator builds fill-in-the-blank questions from your sentences, using key terms found elsewhere in your notes as distractors. Results are lower quality but need no setup.

The duel page shows which generator was used for that quiz.

### Fair play

- Answer keys never reach a player before that player answers. The full key is revealed only after you finish.
- The server times each question from the moment it's revealed. A late answer counts as a timeout.
- Players are identified by an anonymous ID stored in the browser. There are no accounts.

## Storage

Duels are stored in a JSON file at `./data/db.json` (set `DATA_DIR` to change this), with writes serialized inside the server process. This works for a single Node server (`npm run build && npm start`). Serverless hosts with ephemeral disks need a real database: swap out `lib/store.ts`.

## Project layout

```
app/                     Next.js App Router pages + API routes
  page.tsx               create a duel
  duel/[id]/             join / play / results / rematch
  leaderboard/           leaderboard
  api/duels/...          create, view, join, start, answer, rematch
lib/
  game.ts                rules: scoring, joining, answering, outcome, leaderboard
  generate.ts            Claude question generation + fallback
  offline-generator.ts   no-API question builder
  store.ts               JSON-file persistence
tests/                   vitest unit tests
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript check |
