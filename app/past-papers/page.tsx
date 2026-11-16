"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FREE_PAPERS, SUBJECTS_11 } from "@/lib/eleven-plus";
import { LIBRARY } from "@/lib/library";
import { admissionsLink, schoolById, type School } from "@/lib/schools";
import { loadTargets, usesTargets, useLevel } from "@/lib/tracks";

/** Official GCSE past paper finders. Papers stay on the exam boards' own sites. */
const BOARDS = [
  { name: "AQA", href: "https://www.aqa.org.uk/find-past-papers-and-mark-schemes", note: "Past papers and mark schemes for AQA GCSEs." },
  { name: "Pearson Edexcel", href: "https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html", note: "Edexcel GCSE past papers and mark schemes." },
  { name: "OCR", href: "https://www.ocr.org.uk/qualifications/past-paper-finder/", note: "OCR's past paper finder." },
];

/** Past papers: real ones from their official sources, plus practice papers in the same style. */
export default function PastPapersPage() {
  const [targets, setTargets] = useState<School[]>([]);
  const level = useLevel();
  const showSchools = level !== undefined && usesTargets(level);
  useEffect(() => setTargets(loadTargets().map(schoolById).filter((s): s is School => Boolean(s))), []);

  return (
    <div className="space-y-12 py-10 sm:py-14">
      <header className="max-w-3xl space-y-3">
        <p className="font-mono text-[12px] tracking-[0.14em] text-muted-foreground uppercase">11+ and GCSE</p>
        <h1 className="display text-[42px] leading-[1.02] sm:text-[58px]">Past papers</h1>
        <p className="text-body-lg text-muted-foreground">
          Real past papers belong to the exam boards and schools that wrote them, so we link you straight to the official copies. Then practise with our own papers in the same style, timed and marked for you.
        </p>
      </header>

      <section aria-labelledby="eleven" className="space-y-4">
        <h2 id="eleven" className="text-[28px] leading-tight">11+</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface space-y-3 p-5">
            <h3 className="font-mono text-[12px] tracking-[0.12em] text-muted-foreground uppercase">Practice papers (ours)</h3>
            <p className="text-body">Timed papers in the 11+ style, with every answer explained. Paper {FREE_PAPERS} in each subject is free.</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {SUBJECTS_11.map((s) => (
                <li key={s.id}>
                  <Link href={`/11-plus/paper?subject=${s.id}&n=1`} className="result-row w-full">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">Paper 1 · {s.minutes} min</span>
                    </span>
                    <span aria-hidden>›</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/11-plus" className="inline-block text-body underline underline-offset-4">All 11+ papers →</Link>
          </div>
          <div className="surface space-y-3 p-5">
            <h3 className="font-mono text-[12px] tracking-[0.12em] text-muted-foreground uppercase">Official papers</h3>
            <p className="text-body">
              Grammar school tests (such as GL Assessment&apos;s) aren&apos;t published, but many areas share free familiarisation papers. Many independent schools put sample or past entrance papers on their admissions pages.
            </p>
            {!showSchools ? (
              <p className="text-body text-muted-foreground">Search for a school&apos;s name plus &quot;11+ sample papers&quot; to find the papers it shares.</p>
            ) : targets.length ? (
              <ul className="grid gap-2">
                {targets.map((s) => (
                  <li key={s.id}>
                    <a href={admissionsLink(s)} target="_blank" rel="noopener noreferrer" className="result-row w-full">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{s.name}</span>
                        <span className="text-label text-muted-foreground">Look for sample papers on their admissions page</span>
                      </span>
                      <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body text-muted-foreground">
                <Link href="/goals#schools" className="text-foreground underline underline-offset-4">Pick your target schools</Link> and we&apos;ll link to where each one shares its papers.
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="gcse" className="space-y-4">
        <h2 id="gcse" className="text-[28px] leading-tight">GCSE</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="surface space-y-3 p-5">
            <h3 className="font-mono text-[12px] tracking-[0.12em] text-muted-foreground uppercase">Official past papers</h3>
            <p className="text-body">Find your exam board on your course spec or ask your teacher. Each board publishes past papers and mark schemes for free.</p>
            <ul className="grid gap-2">
              {BOARDS.map((b) => (
                <li key={b.name}>
                  <a href={b.href} target="_blank" rel="noopener noreferrer" className="result-row w-full">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{b.name}</span>
                      <span className="text-label text-muted-foreground">{b.note}</span>
                    </span>
                    <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-label text-muted-foreground">Tip: do the paper timed, then mark it with the mark scheme. Bring anything you got wrong to Raj.</p>
          </div>
          <div className="surface space-y-3 p-5">
            <h3 className="font-mono text-[12px] tracking-[0.12em] text-muted-foreground uppercase">Practice papers (ours)</h3>
            <p className="text-body">Quick 15-question papers on core GCSE topics, marked instantly.</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {LIBRARY.map((p) => (
                <li key={p.slug}>
                  <Link href={`/past-papers/practice?pack=${p.slug}`} className="result-row w-full">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.title}</span>
                      <span className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">15 questions · 15 min</span>
                    </span>
                    <span aria-hidden>›</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-label text-muted-foreground">
              Want a paper on your own notes? <Link href="/study" className="underline underline-offset-4">Make a study set</Link>, then use Mock exam (Pro).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
