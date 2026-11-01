"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PreviewCard, SetThumbnail } from "@/components/gallery";
import { RajAvatar } from "@/components/raj-chat";
import { Button, Panel, Spinner, buttonClass, inputClass } from "@/components/ui";
import { api, getPlayerId, getSavedName, saveName } from "@/lib/player";
import { SAMPLES } from "@/lib/samples";
import { timeAgo } from "@/lib/time";
import type { StudySetSummary } from "@/lib/types";

const MIN = 80;
const MAX = 40_000;
const DAY = 24 * 3600 * 1000;

export default function Home() {
  const [sets, setSets] = useState<StudySetSummary[] | null>(null);
  useEffect(() => {
    api<{ sets: StudySetSummary[] }>(`/api/study?playerId=${getPlayerId()}`)
      .then((r) => setSets(r.sets))
      .catch(() => setSets([]));
  }, []);

  return (
    <>
      <Hero />
      <CategoryBand sets={sets ?? []} />
      <Gallery sets={sets} />
      <StartDuel />
    </>
  );
}

/** Big collage, a heavy left-aligned headline, and stacked pill buttons. */
function Hero() {
  return (
    <section className="flex flex-col items-center pt-8 pb-16 sm:pt-12 sm:pb-24">
      {/* Laid out on a fixed 640×380 canvas, then scaled down to fit small screens. */}
      <div aria-hidden className="relative mb-10 h-[213px] w-full sm:h-[380px]">
        <div className="absolute top-0 left-1/2 h-[380px] w-[640px] origin-top -translate-x-1/2 scale-[0.56] sm:scale-100">
          {/* Flashcard */}
          <div className="absolute top-7 left-2 flex h-[220px] w-[250px] -rotate-3 flex-col justify-between rounded-[28px] bg-[#d9ef7b] p-5 pr-[76px] text-left text-[#1d2a00]">
            <span className="text-caption font-semibold tracking-wide uppercase opacity-70">Flashcard</span>
            <span className="text-title-lg font-bold leading-tight">What does the Calvin cycle make?</span>
            <span className="text-label opacity-70">Tap to flip</span>
          </div>
          {/* Quiz question */}
          <div className="absolute top-0 left-[196px] z-10 flex h-[296px] w-[250px] flex-col gap-2.5 rounded-[28px] bg-[#e1342f] p-5 text-left text-white shadow-xl">
            <span className="text-caption font-semibold tracking-wide uppercase opacity-80">Question 3 / 10</span>
            <span className="text-title-lg font-bold leading-tight">Where does photosynthesis happen?</span>
            <div className="mt-auto space-y-1.5">
              {["Mitochondria", "Chloroplasts", "Nucleus"].map((o, i) => (
                <div key={o} className={`rounded-full px-3 py-1.5 text-label font-medium ${i === 1 ? "bg-white text-[#e1342f]" : "bg-white/15"}`}>
                  {o}
                </div>
              ))}
            </div>
          </div>
          {/* Scoreboard */}
          <div className="absolute top-12 left-[462px] flex h-[150px] w-[170px] rotate-2 flex-col justify-center rounded-[28px] bg-[#1f2937] p-5 text-left text-white">
            <span className="text-caption opacity-60">You</span>
            <span className="text-[36px] leading-none font-extrabold tabular-nums">1,240</span>
            <span className="mt-2 text-caption opacity-60">Alex · 1,105</span>
          </div>
          {/* Notes */}
          <div className="absolute top-[252px] left-12 h-[120px] w-[210px] rounded-[28px] bg-[#c9d8f0] p-4 text-left text-[#132a4d]">
            <span className="text-caption font-semibold tracking-wide uppercase opacity-70">Notes</span>
            <div className="mt-3 space-y-2">
              <div className="h-2 w-[85%] rounded-full bg-current opacity-25" />
              <div className="h-2 w-[65%] rounded-full bg-current opacity-25" />
              <div className="h-2 w-[75%] rounded-full bg-current opacity-25" />
            </div>
          </div>
          {/* Raj */}
          <div className="absolute top-[284px] left-[330px] z-20 flex w-[290px] items-start gap-2.5 rounded-[28px] bg-[#f6d9c7] p-4 text-left text-[#3b1d0e] shadow-lg">
            <RajAvatar />
            <span className="text-body leading-snug">
              <strong>Raj:</strong> Nice! Now, why do C4 plants split the steps up?
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[860px]">
        <h1 className="display text-[44px] sm:text-[76px]">Turn your notes into a game you can win</h1>
        <p className="mt-6 max-w-2xl text-title text-muted-foreground">
          AI turns what you&apos;re studying into flashcards, notes and a 10-question duel. Challenge a friend, and ask
          Raj, your AI tutor, whenever you&apos;re stuck.
        </p>
      </div>
      <div className="mt-10 flex w-full max-w-sm flex-col items-stretch gap-3">
        <a href="#start" className={buttonClass({ variant: "brand", size: "lg" })}>
          Start a duel for free
        </a>
        <Link href="/study" className={buttonClass({ variant: "secondary", size: "lg" })}>
          I already have study notes
        </Link>
      </div>
    </section>
  );
}

type BandTab = "subjects" | "tools" | "sets";

/** Full-width grey band: a tagline on the left, tabbed category links on the right. */
function CategoryBand({ sets }: { sets: StudySetSummary[] }) {
  const [tab, setTab] = useState<BandTab>("subjects");
  const [open, setOpen] = useState(true);

  const links: { href: string; label: string }[] =
    tab === "subjects"
      ? SAMPLES.map((s) => ({ href: `/study?sample=${s.slug}`, label: s.subject }))
      : tab === "tools"
        ? [
            { href: "/study", label: "Notes & Flashcards" },
            { href: "/tutor", label: "Ask Raj" },
            { href: "/#start", label: "Quiz Duel" },
            { href: "/leaderboard", label: "Leaderboard" },
          ]
        : sets.slice(0, 12).map((s) => ({ href: `/study/${s.id}`, label: s.title }));

  return (
    <section className="bleed grid gap-8 border-y border-surface-border py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <div className="space-y-4">
        <h2 className="text-[30px] leading-[1.2] tracking-tight sm:text-[38px]">A study space for your notes, flashcards + friendly duels</h2>
        <Link href="/tutor" className="inline-block text-body-lg text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Meet Raj, your AI tutor
        </Link>
      </div>

      <div className="min-w-0 space-y-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={open}
            className="mr-2 grid size-11 shrink-0 place-items-center rounded-full bg-surface-selected text-foreground transition hover:bg-surface-hover"
          >
            <svg viewBox="0 0 24 24" className={`size-4 transition ${open ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {(
            [
              ["subjects", "Popular Subjects"],
              ["tools", "Study Tools"],
              ["sets", "Your Sets"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setOpen(true);
              }}
              className={`shrink-0 rounded-full px-5 py-2.5 text-body-lg transition ${
                tab === id ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {open &&
          (links.length ? (
            <div className="flex flex-wrap gap-x-7 gap-y-3 pl-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="text-[24px] leading-[1.35] tracking-tight transition hover:text-brand sm:text-[30px]">
                  {l.label}
                </Link>
              ))}
            </div>
          ) : (
            <p className="pl-1 text-title text-muted-foreground">
              No sets yet.{" "}
              <Link href="/study" className="text-foreground underline underline-offset-4">
                Make your first one
              </Link>
              .
            </p>
          ))}
      </div>
    </section>
  );
}

/** Your recent study sets, topped up with sample sets, as big framed previews. */
function Gallery({ sets }: { sets: StudySetSummary[] | null }) {
  if (sets === null) return <div className="py-16" />;
  const now = Date.now();
  const mine = sets.slice(0, 4).map((s) => ({
    key: s.id,
    href: `/study/${s.id}`,
    title: s.title,
    meta: timeAgo(s.createdAt, now),
    dot: now - s.createdAt < DAY,
    kicker: `${s.cardCount} flashcards`,
    lines: s.preview.map((c) => c.front),
  }));
  const samples = SAMPLES.slice(0, Math.max(0, 4 - mine.length)).map((s) => ({
    key: s.slug,
    href: `/study?sample=${s.slug}`,
    title: s.title,
    meta: `${s.subject} sample`,
    dot: false,
    kicker: s.subject,
    lines: s.material.split("\n").slice(1, 3),
  }));
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h2 className="text-[30px] tracking-tight sm:text-[38px]">{mine.length ? "Your study sets" : "Try a sample set"}</h2>
        <Link href="/study" className="shrink-0 text-body-lg text-muted-foreground underline underline-offset-4 hover:text-foreground">
          See all
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2">
        {[...mine, ...samples].map((t) => (
          <PreviewCard key={t.key} href={t.href} title={t.title} meta={t.meta} dot={t.dot}>
            <SetThumbnail title={t.title} kicker={t.kicker} lines={t.lines} seed={t.key} />
          </PreviewCard>
        ))}
      </div>
    </section>
  );
}

function StartDuel() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromSet, setFromSet] = useState<string | null>(null);

  useEffect(() => {
    setName(getSavedName());
    // "Quiz a friend on this" from a study set pre-fills that set's material.
    const studyId = new URLSearchParams(window.location.search).get("study");
    if (!studyId) return;
    api<{ title: string; material: string }>(`/api/study/${encodeURIComponent(studyId)}`)
      .then((s) => {
        setNotes(s.material);
        setFromSet(s.title);
        document.getElementById("start")?.scrollIntoView();
      })
      .catch(() => undefined);
  }, []);

  const len = notes.trim().length;
  const canSubmit = !busy && name.trim().length > 0 && len >= MIN && len <= MAX;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    saveName(name);
    try {
      const { id } = await api<{ id: string }>("/api/duels", {
        body: { notes, name, playerId: getPlayerId() },
      });
      router.push(`/duel/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <section id="start" className="grid scroll-mt-8 gap-10 border-t border-surface-border py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <div className="space-y-4">
        <h2 className="text-[30px] leading-[1.2] tracking-tight sm:text-[38px]">Start a duel</h2>
        <p className="text-body-lg text-muted-foreground">
          Paste what you&apos;re studying. We&apos;ll write 10 questions, you send the link to a friend, and you both play
          the same quiz. Highest score wins.
        </p>
        <ol className="space-y-3 pt-2">
          {["Paste notes and create the duel", "Share the link with a friend", "Both play, compare scores, rematch"].map((step, n) => (
            <li key={step} className="flex items-center gap-3 text-body-lg">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-label font-semibold">{n + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <Panel>
        <form onSubmit={create} className="space-y-6">
          {fromSet && (
            <p className="rounded-2xl bg-brand-soft px-4 py-3 text-body text-brand">Using the material from your study set “{fromSet}”.</p>
          )}
          <label className="block space-y-2">
            <span className="text-body font-medium">Your name</span>
            <input
              className={`${inputClass} h-12`}
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sam"
              autoComplete="nickname"
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-baseline justify-between">
              <span className="text-body font-medium">Notes</span>
              <button
                type="button"
                onClick={() => setNotes(SAMPLES[0].material)}
                className="text-label text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Use sample notes
              </button>
            </span>
            <textarea
              className={`${inputClass} min-h-60 resize-y py-3 leading-relaxed`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste lecture notes, a chapter summary, a study guide…"
            />
            <span className={`block text-label ${len > MAX ? "text-destructive" : "text-muted-foreground"}`}>
              {len < MIN ? `${MIN - len} more characters needed` : `${len.toLocaleString()} / ${MAX.toLocaleString()} characters`}
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-2xl bg-destructive-soft px-4 py-3 text-body text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" variant="brand" size="lg" disabled={!canSubmit} className="w-full sm:w-auto">
            {busy ? (
              <>
                <Spinner /> Writing 10 questions…
              </>
            ) : (
              "Create duel"
            )}
          </Button>
        </form>
      </Panel>
    </section>
  );
}
