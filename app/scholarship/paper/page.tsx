"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PaperRunner } from "@/components/paper-runner";
import { buildScholarPaper, SCHOLAR_WRITING_TIPS, type ScholarPaper, type ScholarSubject } from "@/lib/scholarship";

/** One scholarship paper. English adds the written question and the writing tasks. */
export default function ScholarPaperPage() {
  const [paper, setPaper] = useState<ScholarPaper | null>(null);
  const [key, setKey] = useState("");
  const [missing, setMissing] = useState(false);
  const [answer, setAnswer] = useState("");
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const school = p.get("school") ?? "", subject = (p.get("subject") ?? "") as ScholarSubject, n = Number(p.get("n") ?? 1);
    const built = buildScholarPaper(school, subject, n);
    if (!built) setMissing(true);
    else {
      setPaper(built);
      setKey(`sch:${school}:${subject}:${n}`);
    }
  }, []);

  const c = paper?.comprehension;
  const extra = c && (
    <div className="space-y-4">
      <div className="surface space-y-3 p-5">
        <p className="font-mono text-[11px] tracking-[0.12em] text-brand uppercase">Written answer</p>
        <p className="font-semibold">{c.open.q}</p>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} className="writing-box" style={{ minHeight: 140 }} placeholder="Answer in full sentences, using quotations from the passage." />
        <button type="button" onClick={() => setShowPoints(true)} className="btn btn-secondary inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">Show the marking points</button>
        {showPoints && (
          <ul className="grid gap-1 text-body">
            {c.open.points.map((pt) => (
              <li key={pt}>✓ {pt}</li>
            ))}
            <li className="text-label text-muted-foreground">Tick off each point you made. Three good points with quotations would earn full marks.</li>
          </ul>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(["creative", "essay"] as const).map((kind) => (
          <div key={kind} className="surface space-y-2 p-5">
            <p className="font-mono text-[11px] tracking-[0.12em] text-brand uppercase">{kind === "creative" ? "Creative writing" : "Essay writing"} · based on the passage</p>
            <p className="font-semibold">{kind === "creative" ? c.creative : c.essay}</p>
            <ul className="grid gap-1 text-body text-muted-foreground">
              {SCHOLAR_WRITING_TIPS[kind].slice(0, 3).map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
            <Link href={`/11-plus/writing?task=comp-${c.id}-${kind}`} className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">Write it and get a mark</Link>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-8 sm:py-12">
      <Link href="/scholarship" className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">← Scholarship</Link>
      {missing ? (
        <p className="surface p-5 text-body-lg">That paper doesn&apos;t exist for this school.</p>
      ) : (
        paper && <PaperRunner key={key} resultKey={key} title={paper.title} minutes={paper.minutes} questions={paper.questions} passage={c ? { title: c.title, text: c.text, kind: c.kind } : undefined} extra={extra} onAgain={() => (window.location.href = "/scholarship")} />
      )}
    </div>
  );
}
