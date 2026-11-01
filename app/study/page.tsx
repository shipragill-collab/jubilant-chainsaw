"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FlashcardThumbnail, PreviewCard, SetThumbnail } from "@/components/gallery";
import { Button, Panel, Section, Spinner, inputClass } from "@/components/ui";
import { SAMPLES, sampleBySlug } from "@/lib/samples";
import { timeAgo } from "@/lib/time";
import { api, getPlayerId } from "@/lib/player";
import type { StudySetSummary } from "@/lib/types";

const MIN = 80;
const MAX = 40_000;
const ACCEPT = ".txt,.md,.markdown,.csv,.tsv,.json,.html,.htm,text/*";

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.innerText;
}

export default function StudyPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [material, setMaterial] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sets, setSets] = useState<StudySetSummary[] | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Subject links on the home page open here with ?sample=<subject>.
    const sample = sampleBySlug(new URLSearchParams(window.location.search).get("sample"));
    if (sample) {
      setMaterial(sample.material);
      setTitle(sample.title);
      setFileName(`${sample.subject} sample`);
    }
    api<{ sets: StudySetSummary[] }>(`/api/study?playerId=${getPlayerId()}`)
      .then((r) => setSets(r.sets))
      .catch(() => setSets([]));
  }, []);

  async function loadFile(file: File) {
    setError(null);
    if (file.size > 2_000_000) return setError("That file is too large. Use a text file under 2 MB.");
    if (/\.(pdf|docx?|pptx?|key|pages)$/i.test(file.name)) {
      return setError("PDF and Office files aren't supported yet. Copy the text and paste it here instead.");
    }
    let text = await file.text();
    if (/\.html?$/i.test(file.name) || file.type === "text/html") text = stripHtml(text);
    setMaterial((prev) => (prev.trim() ? `${prev.trim()}\n\n${text.trim()}` : text.trim()));
    setFileName(file.name);
    // Name the set after the file only when it has no heading of its own (the server uses the heading).
    if (!title && !/^\s*#\s+\S/.test(text)) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  }

  const len = material.trim().length;
  const canSubmit = !busy && len >= MIN && len <= MAX;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const { id } = await api<{ id: string }>("/api/study", {
        body: { material, title, playerId: getPlayerId() },
      });
      router.push(`/study/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
    <Section
      title="Study"
      intro="Post your study material and AI turns it into organized notes and a deck of flashcards. Then ask Raj about it, or challenge a friend to a quiz."
    >
      <Panel>
        <form onSubmit={create} className="space-y-6">
          <label className="block space-y-1.5">
            <span className="text-body font-medium">
              Title <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <input
              className={`${inputClass} h-12`}
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to name it from your material"
            />
          </label>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-body font-medium">Study material</span>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="text-label text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Upload a file
              </button>
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void loadFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void loadFile(f);
              }}
              className={`rounded-2xl transition ${dragging ? "ring-2 ring-brand" : ""}`}
            >
              <textarea
                aria-label="Study material"
                className={`${inputClass} min-h-64 resize-y py-3 leading-relaxed`}
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Paste lecture notes, a textbook section or an article. You can also drop a .txt or .md file here."
              />
            </div>
            <span className={`flex justify-between text-caption ${len > MAX ? "text-destructive" : "text-muted-foreground"}`}>
              <span>
                {len < MIN ? `${MIN - len} more characters needed` : `${len.toLocaleString()} / ${MAX.toLocaleString()} characters`}
              </span>
              {fileName && <span className="truncate">Loaded {fileName}</span>}
            </span>
          </div>

          {error && (
            <p role="alert" className="rounded-2xl bg-destructive-soft px-4 py-3 text-body text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" variant="brand" size="lg" disabled={!canSubmit} className="w-full sm:w-auto">
            {busy ? (
              <>
                <Spinner /> Making notes and flashcards…
              </>
            ) : (
              "Create notes & flashcards"
            )}
          </Button>
        </form>
      </Panel>
    </Section>

    <section className="py-10 sm:py-14">
      <h2 className="mb-8 text-[32px] leading-[1.15] tracking-tight sm:text-[40px]">Your study sets</h2>
      {sets === null ? (
        <p className="flex items-center gap-2 text-body text-muted-foreground">
          <Spinner /> Loading…
        </p>
      ) : sets.length === 0 ? (
        <p className="text-body-lg text-muted-foreground">
          Nothing yet. Your first set will show up here. Or try a sample:{" "}
          {SAMPLES.slice(0, 4).map((x, i) => (
            <span key={x.slug}>
              {i > 0 && ", "}
              <Link href={`/study?sample=${x.slug}`} className="text-foreground underline underline-offset-4">
                {x.subject}
              </Link>
            </span>
          ))}
          .
        </p>
      ) : (
        <ul>
          {sets.map((s) => (
            <li
              key={s.id}
              className="grid gap-6 border-t border-surface-border py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16"
            >
              <div className="space-y-3">
                <Link href={`/study/${s.id}`} className="block text-[30px] leading-[1.15] tracking-tight hover:text-brand sm:text-[36px]">
                  {s.title}
                </Link>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-lg text-muted-foreground">
                  <span>{s.cardCount} Flashcards</span>
                  <span>{s.termCount} Key terms</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-lg text-muted-foreground">
                  <span>{s.source === "claude" ? "Written by Claude" : "Auto-generated"}</span>
                  <span>{timeAgo(s.createdAt)}</span>
                </div>
              </div>
              <div className="-mr-4 flex snap-x gap-8 overflow-x-auto pr-4 pb-2 sm:-mr-8 sm:pr-8">
                <PreviewCard href={`/study/${s.id}`} title="Notes" meta={timeAgo(s.createdAt)} dot={Date.now() - s.createdAt < 864e5} className="w-[78%] shrink-0 snap-start sm:w-[420px]">
                  <SetThumbnail title={s.title} kicker="Notes" lines={s.preview.map((c) => c.front)} seed={s.id} />
                </PreviewCard>
                {s.preview.map((c, i) => (
                  <PreviewCard key={i} href={`/study/${s.id}#flashcards`} title={`Flashcard ${i + 1}`} meta={`of ${s.cardCount}`} className="w-[78%] shrink-0 snap-start sm:w-[420px]">
                    <FlashcardThumbnail front={c.front} index={i} seed={s.id} />
                  </PreviewCard>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
    </>
  );
}
