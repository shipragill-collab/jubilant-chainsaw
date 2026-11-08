# Quiz Duel

Paste your notes and get 10 multiple-choice questions. Send the link to a friend, and you both play the same quiz. Highest score wins. There's a rematch button, and a leaderboard across all finished duels.

The design follows two references.

- **A Pinterest-style hero:** a collage of rounded tiles, a huge left-aligned headline, and stacked red and grey pill buttons.
- **A Siteinspire-style gallery:** a red-dot logo, grey nav with a black pill button, and a full-width grey band with a tagline on the left and tabbed category links on the right ("Popular Subjects", "Study Tools", "Your Sets"). Previews sit in grey frames with "Title · 2 months ago" captions, and the "Your study sets" rows have a name and tags on the left with a scrolling row of previews on the right.

It works in light and dark mode and at phone width. To put real photos in the home page collage, as in the reference, drop `1.jpg` to `4.jpg` into `public/hero/` (see the README there). Tiles without a photo keep their illustration. The header search finds your study sets and the sample subjects. The **Popular Subjects** links open ready-made sample material (Biology, Chemistry, History, Physics, Geography, Economics, Psychology, Computer Science), so you can try everything in one click.

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

## Study: AI notes and flashcards

Open **Study** in the top bar to post study material. You can paste text, or upload or drag in a `.txt`, `.md`, `.csv` or `.html` file. The app turns it into:

- **Notes:** a short summary, sections of bullet points, and a key-terms glossary. You can copy them or download them as Markdown.
- **Flashcards:** a deck you click (or press Space) to flip. Mark each card *Know it* or *Still learning*, then review only the cards you're still learning. Shuffle and reset are available. Progress is saved in your browser.
- **Quiz a friend on this:** starts a duel from the same material.

Each study set has its own shareable link. "Your study sets" lists the sets created in your browser, and only the person who created a set can delete it. Generation works like the quizzes: Claude when `ANTHROPIC_API_KEY` is set, otherwise an offline generator. The offline generator reorganizes your own sentences: it follows your headings, pulls "X is …" sentences out as definitions, and makes recall cards from fill-in-the-blank sentences.

## Plans, coins and the shop

- **Free:** 5 AI quizzes or study sets a day, and 25 messages with Raj a day.
- **Pro (£4.99/month):** unlimited AI, 1,000 bonus coins every month, Pro-only items, and a Pro badge on the leaderboard.
- **Coins:** you earn 20 for finishing a duel (plus 30 for a win, or 15 for a tie), or buy coin packs (£0.99, £2.49, £4.99).
- **Shop:** coins buy skins and accessories (hats, eyewear and neckwear) for your avatar. You can try items on before buying. Your avatar appears in the header, on duel scoreboards and on the leaderboard.
- **Leaderboard:** custom rosette badges mark the top three, and every row shows the player's avatar.
- **Payments:** with `STRIPE_SECRET_KEY` set, purchases go through Stripe Checkout. That's Stripe's hosted page, so this app never sees card details. Monthly renewals come in through the webhook at `/api/billing/webhook`, and "Manage subscription" opens Stripe's billing portal.
- **Demo mode:** without Stripe keys, the app runs a clearly labelled demo checkout. It grants purchases for £0.00 and never asks for payment details.
- **Account security:** players are anonymous browser IDs. The real ID is never shown to other players; duel views and the leaderboard use a one-way hash of it instead.

### Midnight Folio, a Mythic app skin

Midnight Folio costs 3,000 coins. It re-skins the whole app in obsidian and gold leaf:

- **Look:** gold-foil buttons, frames with gilt corner brackets, and gold headlines. Raj becomes gilded.
- **Living parts:** drifting gold dust, frames whose gilt border light circles the edge, and a streak flame that pulses like a heartbeat.
- **Sound and touch:** synthesized sounds (a coin clink on presses, a bell chime on correct answers, an ember swell when the streak grows) and vibration on supported phones. A mute button appears in the header while it's on.
- **Unlocking:** buying it plays a 2.8-second unboxing.

The full blueprint, with live demos, is in `design/midnight-folio-blueprint.html`. The skin applies through `html[data-skin="midnight-folio"]` (see `components/skin-provider.tsx`, `components/unboxing.tsx`, `lib/sfx.ts`).

### Streak page

`/streak` has six widgets: streak counter (with best streak), daily goal ring (5 study actions), this week, a 5-week calendar, next milestone (3, 7, 14, 30, 50, 100 days and on), and all-time totals.

## Raj, the AI tutor

Raj is available on the **Ask Raj** page, and as a tab in every study set.

- **On a study set:** Raj has read your material and flashcards, and teaches by doing. Each turn is a short explanation, then a question to try, with tap-to-answer choices.
- **Wrong answers:** the first miss gets a hint and a second try. Only after a second miss does Raj explain the answer.
- **Hints and streaks:** a "Give me a hint" button gives a small nudge, the header shows a streak counter, and Raj's face changes with the conversation (thinking, celebrating, encouraging).
- **On the Ask Raj page:** you can also chat about anything you're studying, without picking a set.
- Replies stream in as they're written. Each conversation is saved in your browser, one per study set.
- **With `ANTHROPIC_API_KEY` set:** Claude powers Raj. Your material is prompt-cached across the turns of a conversation.
- **Without a key:** an offline mode finds the most relevant sentences in your notes, summarizes them, and runs flashcard quizzes with answer checking.
- `/api/tutor` is rate-limited per IP (40 messages per 10 minutes), so a public deployment can't run up your API bill.

### Raj's mood and your streak

Raj reacts to how regularly you study, a bit like Duo in Duolingo:

- **Studied today:** happy. With a 7-day streak or longer, proud: beaming arc eyes and twinkling sparks.
- **Missed yesterday:** eager, with wide eyes and little hops, while your streak is still alive.
- **Away 2–3 days:** worried, with slanted brows and a wobbly mouth.
- **Away 4–13 days:** sad, with heavy eyelids, a frown, a droopy ribbon and faded colour.
- **Away 2 weeks or more:** asleep, with closed eyes and floating "z"s.
- **New player:** curious.

Creating a duel or study set, answering duel questions, joining a duel, practising with Raj and reviewing flashcards all count as studying. Days follow your local time zone. Raj's mood card (on the home page and the Ask Raj page) shows the streak, the last 7 days and one next step, and a small Raj in the header shows today's mood. The rules live in `lib/raj-mood.ts`.

### Question generation

- **With `ANTHROPIC_API_KEY` set:** Claude (`claude-opus-5-5`) writes the quiz using structured outputs, so the response is always valid JSON. Server-side refusal fallback is on (`fallbacks: "default"`).
- **Without a key, or if the API call fails:** an offline generator builds fill-in-the-blank questions from your sentences, using key terms found elsewhere in your notes as distractors. Results are lower quality but need no setup.

The duel page shows which generator was used for that quiz.

### Fair play

- Answer keys never reach a player before that player answers. The full key is revealed only after you finish.
- The server times each question from the moment it's revealed. A late answer counts as a timeout.
- Players are identified by an anonymous ID stored in the browser. There are no accounts.

## Put it online

To deploy for free on Vercel with a Neon Postgres database, follow [DEPLOY.md](DEPLOY.md). It takes about 10 minutes and needs only a Vercel account.

## Storage

With `DATABASE_URL` set, data is stored in Postgres: one row per collection, and every write runs in a transaction that locks those rows, so concurrent serverless instances can't overwrite each other. Without it, data goes to a JSON file at `./data/db.json` (set `DATA_DIR` to change this), which works for a single Node server. To run the Postgres tests, set `TEST_DATABASE_URL` and run `npm test`.

## Project layout

```
app/                     Next.js App Router pages + API routes
  page.tsx               create a duel
  duel/[id]/             join / play / results / rematch
  leaderboard/           leaderboard
  study/                 post material; study/[id] shows notes + flashcards
  api/duels/...          create, view, join, start, answer, rematch
  api/study/...          create/list study sets, view/delete one
  tutor/                 chat with Raj
  search/                search your sets and sample subjects
  api/tutor              Raj's streaming chat endpoint
lib/
  game.ts                rules: scoring, joining, answering, outcome, leaderboard
  generate.ts            Claude question generation + fallback
  offline-generator.ts   no-API question builder
  study.ts               Claude notes + flashcards generation + fallback
  offline-study.ts       no-API notes + flashcards builder
  tutor.ts               Raj: persona, Claude streaming, offline mode, rate limit
components/
  raj-chat.tsx           chat UI (also used inside study sets)
  site-header.tsx, ui.tsx  header and design-system primitives
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
