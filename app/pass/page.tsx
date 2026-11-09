"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PassPipeline } from "@/components/pass-pipeline";
import { Badge, Button, Spinner } from "@/components/ui";
import { formatPrice } from "@/lib/catalog";
import { PASS, rewardLabel, seasonOf, tierFor, tierRewards, type Track } from "@/lib/pass";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles, useProfile, type ClientProfile } from "@/lib/use-profile";

/** The Duel Pass: a 30-tier monthly season with a free and a pass track. */
export default function PassPage() {
  const { profile, setProfile } = useProfile();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const season = seasonOf();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("purchased") === "pass") setMessage({ tone: "ok", text: "Welcome to the Duel Pass! Every tier is unlocked for claiming as you reach it." });
  }, []);

  const xp = profile?.pass.xp ?? 0;
  const tier = tierFor(xp);
  const into = xp - tier * PASS.xpPerTier;
  const active = Boolean(profile?.passActive);
  const claimed = new Set(profile?.pass.claimed ?? []);
  const daysLeft = Math.max(0, Math.ceil((season.endsAt - Date.now()) / 864e5));

  const claimable: { tier: number; track: Track }[] = [];
  for (let t = 1; t <= tier; t++) {
    const r = tierRewards(t);
    if (r.free && !claimed.has(`${t}:free`)) claimable.push({ tier: t, track: "free" });
    if (active && !claimed.has(`${t}:premium`)) claimable.push({ tier: t, track: "premium" });
  }

  async function claim(list: { tier: number; track: Track }[]) {
    setBusy(list.length > 1 ? "all" : `${list[0].tier}:${list[0].track}`);
    setMessage(null);
    try {
      let next: ClientProfile | null = null;
      for (const c of list) next = await api<ClientProfile>("/api/pass/claim", { body: { playerId: getPlayerId(), ...c } });
      if (next) setProfile((p) => (p ? { ...p, ...next } : p));
      setMessage({ tone: "ok", text: list.length > 1 ? `Claimed ${list.length} rewards.` : `Claimed: ${rewardLabel(tierRewards(list[0].tier)[list[0].track]!)}` });
      refreshProfiles();
    } catch (err) {
      setMessage({ tone: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function subscribe() {
    setBusy("subscribe");
    try {
      const { url } = await api<{ url: string }>("/api/billing/checkout", { body: { playerId: getPlayerId(), kind: "pass" } });
      window.location.href = url;
    } catch (err) {
      setMessage({ tone: "error", text: (err as Error).message });
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8 py-10 sm:py-14">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div className="space-y-3">
          <p className="text-label font-semibold tracking-wide text-muted-foreground uppercase">Season · {season.name}</p>
          <h1 className="text-[32px] leading-[1.15] tracking-tight sm:text-[40px]">{PASS.name}</h1>
          <p className="text-body-lg text-muted-foreground">
            Earn XP by studying ({PASS.xp.activity} per action) and playing duels ({PASS.xp.duel}, plus {PASS.xp.win} for a win). Every tier has a reward; the pass unlocks all of them.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {active ? <Badge tone="brand">Pass active</Badge> : <Badge>Free track</Badge>}
            <span className="text-body text-muted-foreground">{daysLeft} days left this season</span>
          </div>
        </div>

        <div className="surface mf-gilt grid gap-5 p-6 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-label text-muted-foreground">Your tier</p>
              <p className="display text-[56px] leading-none tabular-nums">{tier}<span className="text-title text-muted-foreground"> / {PASS.tiers}</span></p>
            </div>
            <div className="min-w-0 flex-1 basis-48">
              <div className="flex justify-between text-label text-muted-foreground">
                <span>{xp.toLocaleString()} XP</span>
                <span>{tier < PASS.tiers ? `${PASS.xpPerTier - into} XP to tier ${tier + 1}` : "Season complete!"}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={PASS.xpPerTier} aria-valuenow={tier < PASS.tiers ? into : PASS.xpPerTier}>
                <div className="h-full rounded-full bg-brand transition-[width] duration-700" style={{ width: `${tier < PASS.tiers ? (into / PASS.xpPerTier) * 100 : 100}%` }} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!active && (
              <Button variant="brand" size="lg" onClick={subscribe} disabled={busy !== null}>
                {busy === "subscribe" ? <Spinner /> : null} Get the pass · {formatPrice(PASS.pricePence)}/month
              </Button>
            )}
            {claimable.length > 0 && (
              <Button variant={active ? "brand" : "secondary"} size="lg" onClick={() => claim(claimable)} disabled={busy !== null}>
                {busy === "all" ? <Spinner /> : null} Claim all ({claimable.length})
              </Button>
            )}
            {profile && !profile.paymentsLive && !active && <span className="self-center text-body text-muted-foreground">Demo mode: nothing is charged.</span>}
          </div>
          {message && (
            <p role="status" className={`rounded-2xl px-4 py-3 text-body ${message.tone === "ok" ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>

      {/* The pipeline: free track on top, pass track below, one progress rail between them */}
      <PassPipeline
        tier={tier}
        progress={tier < PASS.tiers ? into / PASS.xpPerTier : 0}
        active={active}
        claimed={claimed}
        busy={busy}
        equipped={profile?.equipped as Record<string, string> | undefined}
        onClaim={(t, track) => claim([{ tier: t, track }])}
        onUnlock={active ? undefined : subscribe}
      />
      <p className="text-body text-muted-foreground">
        Top track: free for everyone. Bottom track: Duel Pass. Pass rewards you&apos;ve reached stay claimable until the season ends.{" "}
        <Link href="/pricing" className="underline underline-offset-4">Compare plans</Link>
      </p>
    </div>
  );
}
