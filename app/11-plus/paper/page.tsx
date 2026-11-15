"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ElevenPackCard } from "@/components/eleven-pack";
import { PaperRunner } from "@/components/paper-runner";
import { Spinner } from "@/components/ui";
import { buildPaper, FREE_PAPERS, SUBJECTS_11, type Paper, type Subject11 } from "@/lib/eleven-plus";
import { api, getPlayerId } from "@/lib/player";

/** One 11+ practice paper. */
export default function PaperPage() {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [error, setError] = useState<{ text: string; locked: boolean } | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const subject = p.get("subject") as Subject11;
    const n = Number(p.get("n") ?? 1);
    if (!SUBJECTS_11.some((s) => s.id === subject)) {
      setError({ text: "That paper doesn't exist.", locked: false });
      return;
    }
    api<{ paper: Paper }>("/api/papers", { body: { playerId: getPlayerId(), subject, paper: n } })
      .then((r) => setPaper(r.paper))
      .catch((err: Error) => {
        // Free papers still work when the server can't be reached.
        if (n <= FREE_PAPERS) setPaper(buildPaper(subject, n));
        else setError({ text: err.message, locked: /11\+ Pack/.test(err.message) });
      });
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-8 sm:py-12">
      <Link href="/11-plus" className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">
        ← 11+ practice
      </Link>
      {error ? (
        <div className="space-y-4">
          <p className="surface p-5 text-body-lg">{error.text}</p>
          {error.locked && <ElevenPackCard />}
        </div>
      ) : paper ? (
        <PaperRunner key={paper.title} resultKey={`11:${paper.subject}:${paper.number}`} title={paper.title} minutes={paper.minutes} questions={paper.questions} onAgain={() => (window.location.href = "/11-plus")} />
      ) : (
        <p className="flex items-center gap-2 text-body text-muted-foreground">
          <Spinner /> Getting your paper ready…
        </p>
      )}
    </div>
  );
}
