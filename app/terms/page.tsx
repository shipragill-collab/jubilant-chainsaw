import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms", description: "The rules for using Quiz Duel, in plain English." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="11 November 2026" intro="The short version: study hard, play fair, and be kind on the leaderboard.">
      <LegalSection title="Using Quiz Duel">
        <ul>
          <li>Only add material you&apos;re allowed to use, such as your own notes or class handouts for personal study.</li>
          <li>Pick a display name that won&apos;t upset anyone. We may remove names or content that break this rule.</li>
          <li>Don&apos;t try to break, overload or cheat the app.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Raj and AI-made content">
        <p>Raj, the flashcards and the quizzes are made by AI from your material. They&apos;re usually right but can make mistakes, so check anything important against your notes or your teacher.</p>
      </LegalSection>
      <LegalSection title="Purchases">
        <ul>
          <li>Coins, gems, skins and accessories are virtual items for use in Quiz Duel. They have no cash value and can&apos;t be exchanged for money.</li>
          <li>Pro, the Duel Pass and Ultimate are monthly subscriptions that renew automatically until you cancel. You can cancel any time from the Plans page, and you keep access until the end of the month you paid for.</li>
          <li>If something goes wrong with a purchase, {SITE.contactEmail ? <>email <a className="underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></> : "get in touch"} and we&apos;ll sort it out. This doesn&apos;t affect your legal rights as a consumer.</li>
          <li>If you&apos;re under 18, ask a parent or guardian before buying anything.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Changes">
        <p>We may update the app, prices and these terms. If prices for your subscription change, you&apos;ll be told before your next renewal.</p>
      </LegalSection>
    </LegalPage>
  );
}
