"use client";

import { useEffect, useMemo, useState } from "react";
import { PreviewCard, SetThumbnail } from "@/components/gallery";
import { Section, inputClass } from "@/components/ui";
import { api, getPlayerId } from "@/lib/player";
import { SAMPLES } from "@/lib/samples";
import { timeAgo } from "@/lib/time";
import type { StudySetSummary } from "@/lib/types";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [sets, setSets] = useState<StudySetSummary[]>([]);

  useEffect(() => {
    setQ(new URLSearchParams(window.location.search).get("q") ?? "");
    api<{ sets: StudySetSummary[] }>(`/api/study?playerId=${getPlayerId()}`)
      .then((r) => setSets(r.sets))
      .catch(() => undefined);
  }, []);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const match = (text: string) => words.every((w) => text.toLowerCase().includes(w));
    const mine = sets
      .filter((s) => match(`${s.title} ${s.preview.map((c) => `${c.front} ${c.back}`).join(" ")}`))
      .map((s) => ({
        key: s.id,
        href: `/study/${s.id}`,
        title: s.title,
        meta: timeAgo(s.createdAt),
        kicker: `${s.cardCount} flashcards`,
        lines: s.preview.map((c) => c.front),
      }));
    const samples = SAMPLES.filter((s) => match(`${s.subject} ${s.title} ${s.material}`)).map((s) => ({
      key: s.slug,
      href: `/study?sample=${s.slug}`,
      title: s.title,
      meta: `${s.subject} sample`,
      kicker: s.subject,
      lines: s.material.split("\n").slice(1, 3),
    }));
    return [...mine, ...samples];
  }, [q, sets]);

  return (
    <Section
      title="Search"
      intro="Find your study sets and sample subjects."
      aside={
        <input
          value={q}
          autoFocus
          onChange={(e) => {
            setQ(e.target.value);
            history.replaceState(null, "", `/search?q=${encodeURIComponent(e.target.value)}`);
          }}
          placeholder="Try “photosynthesis” or “History”"
          aria-label="Search"
          className={`${inputClass} mt-4 h-12`}
        />
      }
    >
      {results.length === 0 ? (
        <p className="text-title text-muted-foreground">Nothing matches “{q}”.</p>
      ) : (
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {results.map((r) => (
            <PreviewCard key={r.key} href={r.href} title={r.title} meta={r.meta}>
              <SetThumbnail title={r.title} kicker={r.kicker} lines={r.lines} seed={r.key} />
            </PreviewCard>
          ))}
        </div>
      )}
    </Section>
  );
}
