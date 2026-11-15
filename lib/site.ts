/** Where the site lives. Set APP_URL to your domain (e.g. https://preppass.co.uk). */
export function siteUrl(): string {
  const raw =
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export const SITE = {
  name: "PrepPass",
  tagline: "KS2, 11+, KS3 and GCSE revision that feels like a game",
  description: "11+ practice papers, past papers, flashcards from your notes, quiz duels with friends and Raj, your AI tutor. For KS2, 11+, KS3 and GCSE.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};
