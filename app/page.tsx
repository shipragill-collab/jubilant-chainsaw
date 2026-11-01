"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Spinner, inputClass } from "@/components/ui";
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

  useEffect(() => setName(getSavedName()), []);

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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-display-sm font-semibold tracking-tight">Turn your notes into a duel</h1>
        <p className="text-body-lg text-muted-foreground">
          Paste what you&apos;re studying. We&apos;ll write 10 questions, you send the link to a friend, and you both
          play the same quiz. Highest score wins.
        </p>
      </div>

      <Card>
        <form onSubmit={create} className="space-y-5">
          <label className="block space-y-1.5">
            <span className="text-label font-medium">Your name</span>
            <input
              className={`${inputClass} h-9`}
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sam"
              autoComplete="nickname"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="flex items-baseline justify-between">
              <span className="text-label font-medium">Notes</span>
              <button
                type="button"
                onClick={() => setNotes(SAMPLE)}
                className="text-caption text-brand hover:underline"
              >
                Use sample notes
              </button>
            </span>
            <textarea
              className={`${inputClass} min-h-56 resize-y py-2 leading-relaxed`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste lecture notes, a chapter summary, a study guide…"
            />
            <span className={`block text-caption ${len > MAX ? "text-destructive" : "text-muted-foreground"}`}>
              {len < MIN
                ? `${MIN - len} more characters needed`
                : `${len.toLocaleString()} / ${MAX.toLocaleString()} characters`}
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-destructive-soft px-3 py-2 text-label text-destructive">
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
      </Card>

      <ol className="grid gap-3 text-label text-muted-foreground sm:grid-cols-3">
        {["Paste notes and create the duel", "Share the link with a friend", "Both play — compare scores"].map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-micro font-semibold text-brand">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
