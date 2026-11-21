"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PaperRunner } from "@/components/paper-runner";
import { buildGcsePaper, GCSE_FREE } from "@/lib/gcse";
import type { PaperQuestion } from "@/lib/eleven-plus";
import { useProfile } from "@/lib/use-profile";

/** A GCSE practice paper: /past-papers/practice?subject=physics&n=7 */
export default function GcsePaperPage() {
  const { profile } = useProfile();
  const [paper, setPaper] = useState<{ key: string; n: number; title: string; minutes: number; questions: PaperQuestion[] } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const subject = p.get("subject") ?? "", n = Number(p.get("n") ?? 1);
    const built = buildGcsePaper(subject, n);
    if (!built) setMissing(true);
    else setPaper({ ...built, n, key: `gcse:${subject}:${n}` });
  }, []);

  const locked = paper && paper.n > GCSE_FREE && profile !== null && profile.plan !== "pro";
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-8 sm:py-12">
      <Link href="/past-papers#gcse" className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">← Past papers</Link>
      {missing ? (
        <p className="surface p-5 text-body-lg">That paper doesn&apos;t exist.</p>
      ) : locked ? (
        <div className="surface space-y-3 p-5">
          <p className="text-body-lg">Papers 1–{GCSE_FREE} are free in every subject. Pro unlocks all 50.</p>
          <Link href="/pricing" className="btn btn-brand inline-flex h-11 items-center rounded-[6px] px-5 text-[12px]">See Pro</Link>
        </div>
      ) : (
        paper && <PaperRunner key={paper.key} resultKey={paper.key} title={paper.title} minutes={paper.minutes} questions={paper.questions} onAgain={() => (window.location.href = "/past-papers#gcse")} />
      )}
    </div>
  );
}
