/** Where the site lives. Set APP_URL to your domain (e.g. https://quizduel.co.uk). */
export function siteUrl(): string {
  const raw =
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export const SITE = {
  name: "Quiz Duel",
  tagline: "Turn your notes into flashcards and quiz duels",
  description: "Paste your notes and get flashcards, study notes and a 10-question quiz to duel a friend on, with Raj, your AI tutor.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};
