"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PaperRunner } from "@/components/paper-runner";
import type { PaperQuestion } from "@/lib/eleven-plus";
import { packBySlug, quizFromPack } from "@/lib/library";

/** A GCSE-style practice paper from a ready-made subject. */
export default function PracticePaperPage() {
  const [paper, setPaper] = useState<{ slug: string; title: string; questions: PaperQuestion[] } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const pack = packBySlug(new URLSearchParams(window.location.search).get("pack"));
    if (!pack) {
      setMissing(true);
      return;
    }
    const questions = quizFromPack(pack, 15).map((q) => ({ topic: pack.title, prompt: q.prompt, options: q.options, answer: q.answerIndex, explain: q.explanation ?? "" }));
    setPaper({ slug: pack.slug, title: `${pack.title} · practice paper`, questions });
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-8 sm:py-12">
      <Link href="/past-papers" className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">
        ← Past papers
      </Link>
      {missing ? <p className="surface p-5 text-body-lg">That paper doesn&apos;t exist.</p> : paper && <PaperRunner key={paper.title} resultKey={`gcse:${paper.slug}`} title={paper.title} minutes={15} questions={paper.questions} onAgain={() => (window.location.href = "/past-papers")} />}
    </div>
  );
}
