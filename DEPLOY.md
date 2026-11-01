# Put Quiz Duel online (free)

This puts the app on Vercel (website hosting) with a Neon Postgres database (where duels, study sets and coins are saved). Both have free plans, and you only need a Vercel account: Vercel creates the Neon database for you.

## 1. Import the project

1. Go to https://vercel.com/signup and choose **Continue with GitHub**.
2. Click **Add New… → Project** and import `shipragill-collab/jubilant-chainsaw`. If it isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to that repository.
3. Vercel detects Next.js automatically. Before deploying, open **Environment Variables** and add:
   - `ANTHROPIC_API_KEY`: your Claude API key from https://console.anthropic.com (optional; without it the app uses its offline generator and offline Raj).
4. Click **Deploy**.

## 2. Add the free database

1. In the project, open the **Storage** tab, then **Create Database** (or **Connect Database**), and pick **Neon** (serverless Postgres) on the free plan.
2. Connect it to the project for all environments. This adds `DATABASE_URL` to the project automatically.
3. Open **Deployments**, click **⋯** on the latest deployment, then **Redeploy**, so the site picks up the database.

The app creates its table the first time it runs, so there's nothing else to set up.

## 3. Share it

Your site is at the address Vercel shows, for example `https://jubilant-chainsaw.vercel.app`. To pick a nicer name, go to **Settings → Domains** and edit the `.vercel.app` address (for example `quiz-duel-sam.vercel.app`). Send that link to your friends.

Every time new code is pushed to the repository's main branch (currently `claude/quiz-duel-app-4n2tac`), Vercel redeploys automatically.

## Good to know

- **Payments stay in demo mode** (nothing is charged) until you add `STRIPE_SECRET_KEY`. Vercel's free Hobby plan is for non-commercial use, so before taking real money, move to Vercel Pro and connect Stripe (see `.env.example`).
- **Claude usage is billed by Anthropic** to whoever owns the API key. The Free plan's daily limits and the per-visitor message limit keep this in check.
- **Player progress lives in the browser.** Players are identified by their browser, so coins and Pro don't follow someone to another device, or survive clearing browser data.
- **Free plan limits:** Neon's free plan gives 0.5 GB of storage, plenty for a group of friends. Vercel's free plan cuts requests off after 60 seconds; if Claude is slower than that, the app falls back to its offline generator.
