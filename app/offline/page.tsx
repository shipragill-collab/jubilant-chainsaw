import type { Metadata } from "next";
import Link from "next/link";
import { RajCompanion } from "@/components/raj-companion";
import { buttonClass } from "@/components/ui";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="mx-auto grid max-w-lg justify-items-center gap-5 py-20 text-center">
      <RajCompanion state="idle" feeling="sleepy" size={120} />
      <h1 className="text-[34px] leading-tight tracking-tight">You&apos;re offline</h1>
      <p className="text-body-lg text-muted-foreground">
        No internet right now. Raj still works from your saved notes, and your flashcards are here when you need them.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/tutor" className={buttonClass({ variant: "brand", size: "lg" })}>Practise with Raj</Link>
        <Link href="/study" className={buttonClass({ variant: "secondary", size: "lg" })}>Your study sets</Link>
      </div>
    </div>
  );
}
