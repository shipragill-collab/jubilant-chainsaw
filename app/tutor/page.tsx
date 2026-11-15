"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RajChat } from "@/components/raj-chat";
import { RajMoodCard } from "@/components/raj-mood-card";
import { Section } from "@/components/ui";
import { api, getPlayerId } from "@/lib/player";
import type { StudySetSummary } from "@/lib/types";

export default function TutorPage() {
  const [sets, setSets] = useState<StudySetSummary[]>([]);
  const [setId, setSetId] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("set");
    api<{ sets: StudySetSummary[] }>(`/api/study?playerId=${getPlayerId()}`)
      .then((r) => {
        setSets(r.sets);
        if (fromUrl && r.sets.some((s) => s.id === fromUrl)) setSetId(fromUrl);
      })
      .catch(() => undefined);
  }, []);

  const current = sets.find((s) => s.id === setId);

  return (
    <Section
      title="Ask Raj"
      intro="Raj is your AI study tutor: clear explanations, answers about your notes, and quizzes until it sticks."
      aside={
        <div className="space-y-4 pt-4">
          <div className="hidden lg:block">
            <RajMoodCard compact href="/study" />
          </div>
          <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase lg:pt-2">Study with</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setSetId(null)} aria-pressed={setId === null} className="chip">
              Anything
            </button>
            {sets.map((s) => (
              <button type="button" key={s.id} onClick={() => setSetId(s.id)} aria-pressed={setId === s.id} className="chip max-w-full">
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>
          {sets.length === 0 && (
            <p className="text-body text-muted-foreground">
              <Link href="/study" className="text-foreground underline underline-offset-4">
                Create a study set
              </Link>{" "}
              and Raj can tutor you on your own material.
            </p>
          )}
        </div>
      }
    >
      <RajChat setId={setId} setTitle={current?.title} />
    </Section>
  );
}
