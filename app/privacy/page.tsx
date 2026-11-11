import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", description: "What Quiz Duel stores, why, and how to delete it." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="11 November 2026" intro="Quiz Duel keeps as little about you as it can. There are no accounts, no ads and no tracking cookies.">
      <LegalSection title="What we store">
        <ul>
          <li><strong>A random player ID</strong>, kept in your browser, so the app recognises you. It isn&apos;t linked to your name, email or phone.</li>
          <li><strong>The display name you choose</strong> for duels. It appears on the leaderboard, so don&apos;t use your full name.</li>
          <li><strong>Study material you add</strong>, plus the notes, flashcards and quizzes made from it.</li>
          <li><strong>Duel results</strong> (answers, scores, wins) for the leaderboard, and <strong>your shop items, coins and streak</strong>.</li>
          <li><strong>Your chats with Raj</strong> stay in your browser. They&apos;re sent to our server only to get Raj&apos;s reply and aren&apos;t kept there.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Who else is involved">
        <ul>
          <li><strong>Anthropic</strong> (the company behind Claude) processes your study material and Raj messages to write replies, flashcards and quizzes. Anthropic doesn&apos;t use this data to train its models.</li>
          <li><strong>Stripe</strong> handles payments. We never see or store your card details.</li>
          <li><strong>Vercel</strong> hosts the site and <strong>Neon</strong> hosts the database.</li>
          <li><strong>Google Fonts</strong> serves the typefaces, so Google can see that your browser loaded them.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Children">
        <p>Quiz Duel is made for students. If you&apos;re under 13, please ask a parent or guardian before using it, and before buying anything.</p>
      </LegalSection>
      <LegalSection title="Deleting your data">
        <p>You can delete any study set you made from its page. Clearing your browser&apos;s site data removes your player ID and Raj chats from your device.</p>
        <p>To have everything linked to your player ID removed from our server, {SITE.contactEmail ? <>email <a className="underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></> : "contact the person who shared Quiz Duel with you"} with the ID shown in your browser&apos;s site data, and we&apos;ll delete it.</p>
      </LegalSection>
    </LegalPage>
  );
}
