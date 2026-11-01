"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RajAvatar } from "@/components/raj-chat";
import { Button, Panel, Spinner, buttonClass, inputClass } from "@/components/ui";
import { api, getPlayerId, getSavedName, saveName } from "@/lib/player";

const MIN = 80;
const MAX = 40_000;

const SAMPLE = `Photosynthesis happens in the chloroplasts of plant cells.
Chlorophyll is the green pigment that absorbs mostly red and blue light.
The light-dependent reactions take place in the thylakoid membranes and produce ATP and NADPH.
Water is split during the light-dependent reactions, releasing oxygen as a by-product.
The Calvin cycle runs in the stroma and fixes carbon dioxide into sugar.
The enzyme RuBisCO catalyses the first step of carbon fixation in the Calvin cycle.
C4 plants such as maize separate carbon fixation and the Calvin cycle into different cells.
CAM plants such as cacti open their stomata at night to reduce water loss.
Glucose made by photosynthesis can be stored as starch.
The overall equation turns six molecules of carbon dioxide and six of water into one glucose and six oxygen.`;

export default function Home() {
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
    <>
      <Hero />

      <section id="start" className="grid scroll-mt-8 gap-10 border-t border-surface-border py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div className="space-y-4">
          <h2 className="text-[32px] leading-[1.15] tracking-tight sm:text-[40px]">Start a duel</h2>
          <p className="text-body-lg text-muted-foreground">
            Paste what you&apos;re studying. We&apos;ll write 10 questions, you send the link to a friend, and you both
            play the same quiz. Highest score wins.
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

        <Panel className="space-y-0">
          <form onSubmit={create} className="space-y-6">
            {fromSet && (
              <p className="rounded-2xl bg-brand-soft px-4 py-3 text-body text-brand">
                Using the material from your study set “{fromSet}”.
              </p>
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
                <button type="button" onClick={() => setNotes(SAMPLE)} className="text-label text-muted-foreground underline underline-offset-4 hover:text-foreground">
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

      <section className="grid gap-4 border-t border-surface-border py-12 sm:grid-cols-3 sm:py-16">
        {[
          { href: "/study", title: "Notes & flashcards", text: "Post your material. AI organizes it into notes and a flashcard deck." },
          { href: "/tutor", title: "Ask Raj", text: "Your AI tutor explains, answers questions and quizzes you on your notes." },
          { href: "/leaderboard", title: "Leaderboard", text: "Every finished duel counts. See who's on top." },
        ].map((f) => (
          <Link key={f.href} href={f.href} className="panel group block p-6 transition hover:bg-surface-selected">
            <p className="text-title-lg font-semibold">{f.title}</p>
            <p className="mt-2 text-body-lg text-muted-foreground">{f.text}</p>
            <p className="mt-6 text-body font-medium group-hover:underline">Open →</p>
          </Link>
        ))}
      </section>
    </>
  );
}

/** Pinterest-style collage of rounded tiles that preview what the app does. */
function Hero() {
  return (
    <section className="flex flex-col items-center py-10 text-center sm:py-16">
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

      <h1 className="display max-w-4xl text-[44px] sm:text-[72px]">Turn your notes into a game you can win</h1>
      <p className="mt-6 max-w-xl text-title text-muted-foreground">
        AI turns what you&apos;re studying into flashcards, notes and a 10-question duel. Challenge a friend, and ask
        Raj, your AI tutor, whenever you&apos;re stuck.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <a href="#start" className={buttonClass({ variant: "brand", size: "lg" })}>
          Start a duel
        </a>
        <Link href="/study" className={buttonClass({ variant: "secondary", size: "lg" })}>
          Make flashcards
        </Link>
      </div>
    </section>
  );
}
