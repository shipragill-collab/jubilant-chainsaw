"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Coin } from "@/components/coin";
import { Gem } from "@/components/gem";
import { Badge, Button, Spinner } from "@/components/ui";
import { formatPrice, itemById } from "@/lib/catalog";
import { PASS, rewardLabel, seasonOf, tierFor, tierRewards, type Reward, type Track } from "@/lib/pass";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles, useProfile, type ClientProfile } from "@/lib/use-profile";

function RewardArt({ r, equipped }: { r: Reward; equipped?: Record<string, string> }) {
  if (r.kind === "coins") return <Coin size={34} />;
  if (r.kind === "gems") return <Gem size={34} />;
  const item = itemById(r.itemId);
  return item ? <Avatar equipped={{ ...(equipped ?? {}), skin: equipped?.skin ?? "skin-classic", [item.slot]: item.id }} size={48} /> : null;
}

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

      {/* The tier track: free rewards on top, pass rewards below */}
      <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-8 sm:px-8">
        <ol className="flex gap-3" aria-label="Pass tiers">
          {Array.from({ length: PASS.tiers }, (_, i) => i + 1).map((t) => {
            const r = tierRewards(t);
            const reached = tier >= t;
            const cell = (track: Track) => {
              const reward = r[track];
              const key = `${t}:${track}`;
              const isClaimed = claimed.has(key);
              const locked = track === "premium" && !active;
              const big = reward?.kind === "item";
              return (
                <div
                  className={`grid h-[132px] place-items-center gap-1 rounded-2xl border-[1.5px] p-2 text-center ${
                    reward ? (big ? "border-amber-400/70 bg-amber-50/60 dark:bg-amber-500/10" : "border-surface-border bg-surface") : "border-dashed border-surface-border"
                  } ${!reached || locked ? "opacity-60" : ""}`}
                >
                  {reward ? (
                    <>
                      <RewardArt r={reward} equipped={profile?.equipped as Record<string, string> | undefined} />
                      <span className="line-clamp-2 text-caption font-semibold">{rewardLabel(reward)}</span>
                      {isClaimed ? (
                        <span className="text-caption text-success">Claimed</span>
                      ) : reached && !locked ? (
                        <button
                          type="button"
                          onClick={() => claim([{ tier: t, track }])}
                          disabled={busy !== null}
                          className="rounded-full bg-brand px-2.5 py-0.5 text-caption font-semibold text-brand-foreground"
                        >
                          Claim
                        </button>
                      ) : (
                        <span className="text-caption text-muted-foreground">{locked ? "Pass" : `Tier ${t}`}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-caption text-faint-foreground">—</span>
                  )}
                </div>
              );
            };
            return (
              <li key={t} className="grid w-[112px] shrink-0 gap-2">
                <span className={`text-center text-label font-bold tabular-nums ${reached ? "text-foreground" : "text-muted-foreground"}`}>{t}</span>
                {cell("free")}
                {cell("premium")}
              </li>
            );
          })}
        </ol>
      </div>
      <p className="text-body text-muted-foreground">
        Top row: free track for everyone. Bottom row: Duel Pass track. Pass rewards you&apos;ve reached stay claimable until the season ends.{" "}
        <Link href="/pricing" className="underline underline-offset-4">Compare plans</Link>
      </p>
    </div>
  );
}
