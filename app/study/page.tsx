"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Spinner, inputClass } from "@/components/ui";
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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-display-sm font-semibold tracking-tight">Study</h1>
        <p className="text-body-lg text-muted-foreground">
          Post your study material and AI will turn it into organized notes and a deck of flashcards. When
          you&apos;re ready, challenge a friend to a quiz on it.
        </p>
      </div>

      <Card>
        <form onSubmit={create} className="space-y-5">
          <label className="block space-y-1.5">
            <span className="text-label font-medium">
              Title <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <input
              className={`${inputClass} h-9`}
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to name it from your material"
            />
          </label>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-label font-medium">Study material</span>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="text-caption text-brand hover:underline"
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
              className={`rounded-lg transition ${dragging ? "ring-2 ring-brand" : ""}`}
            >
              <textarea
                aria-label="Study material"
                className={`${inputClass} min-h-64 resize-y py-2 leading-relaxed`}
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
            <p role="alert" className="rounded-lg bg-destructive-soft px-3 py-2 text-label text-destructive">
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
      </Card>

      <section className="space-y-3">
        <h2 className="text-title-sm font-semibold">Your study sets</h2>
        {sets === null ? (
          <p className="flex items-center gap-2 text-label text-muted-foreground">
            <Spinner /> Loading…
          </p>
        ) : sets.length === 0 ? (
          <p className="text-label text-muted-foreground">Nothing yet. Sets you create in this browser show up here.</p>
        ) : (
          <ul className="surface divide-y divide-surface-border overflow-hidden">
            {sets.map((s) => (
              <li key={s.id}>
                <Link href={`/study/${s.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-hover">
                  <span className="truncate text-body font-medium">{s.title}</span>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {s.cardCount} cards · {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
