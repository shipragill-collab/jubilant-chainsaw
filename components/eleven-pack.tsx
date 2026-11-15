"use client";

import { useState } from "react";
import { ELEVEN_PLUS, formatPrice } from "@/lib/catalog";
import { api, getPlayerId } from "@/lib/player";
import { useProfile } from "@/lib/use-profile";
import { Spinner } from "./ui";

/** Buy (or show) the 11+ Pack. Parents usually pay, so the copy talks to them too. */
export function ElevenPackCard({ compact = false }: { compact?: boolean }) {
  const { profile } = useProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = Boolean(profile?.elevenActive);

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api<{ url: string }>("/api/billing/checkout", { body: { playerId: getPlayerId(), kind: "eleven" } });
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (active) {
    return (
      <div className="eleven-pack is-active">
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase">11+ Pack active</p>
        <p className="text-body">Every paper and the weak-spot report are unlocked. Good luck!</p>
      </div>
    );
  }
  return (
    <div className="eleven-pack">
      <p className="font-mono text-[11px] tracking-[0.12em] uppercase">{ELEVEN_PLUS.name}</p>
      <p className="font-display text-[34px] leading-none font-bold tracking-[-0.03em]">
        {formatPrice(ELEVEN_PLUS.pricePence)}
        <span className="text-[15px] font-medium text-muted-foreground"> / month</span>
      </p>
      {!compact && (
        <ul className="grid gap-1.5 text-body">
          {ELEVEN_PLUS.features.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden className="text-brand">✓</span>
              {f}
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={buy} disabled={busy} className="btn btn-brand inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] px-5 text-[13px]">
        {busy ? <Spinner /> : null} Get the 11+ Pack
      </button>
      <p className="text-label text-muted-foreground">
        {profile && !profile.paymentsLive ? "Demo mode: nothing is charged. " : ""}Cancel any time. Under 13? Ask a parent to buy it for you.
      </p>
      {error && <p className="text-body text-destructive">{error}</p>}
    </div>
  );
}
