"use client";

import { useEffect, useRef } from "react";
import { itemById } from "@/lib/catalog";
import { PASS, rewardLabel, tierRewards, type Reward, type Track } from "@/lib/pass";
import { Avatar } from "./avatar";
import { Coin } from "./coin";
import { Gem } from "./gem";

const COL = 128; // px per tier column

function RewardArt({ r, equipped }: { r: Reward; equipped?: Record<string, string> }) {
  if (r.kind === "coins") return <Coin size={34} />;
  if (r.kind === "gems") return <Gem size={34} />;
  const item = itemById(r.itemId);
  return item ? <Avatar equipped={{ ...(equipped ?? {}), skin: equipped?.skin ?? "skin-classic", [item.slot]: item.id }} size={50} /> : null;
}

function Lock() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/**
 * A horizontal, two-track season: free rewards ride above one shared progress
 * rail, pass rewards below it. The rail fills up to your exact XP, and the
 * view scrolls to your current tier.
 */
export function PassPipeline({
  tier,
  progress,
  active,
  claimed,
  busy,
  equipped,
  onClaim,
  onUnlock,
}: {
  tier: number;
  /** 0-1 of the way to the next tier. */
  progress: number;
  active: boolean;
  claimed: Set<string>;
  busy: string | null;
  equipped?: Record<string, string>;
  onClaim: (tier: number, track: Track) => void;
  onUnlock?: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const fill = Math.max(0, Math.min(PASS.tiers * COL, (tier - 0.5 + progress) * COL));

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ left: Math.max(0, (tier - 1.5) * COL - el.clientWidth / 4), behavior: "smooth" });
  }, [tier]);

  const cell = (t: number, track: Track) => {
    const reward = tierRewards(t)[track];
    const key = `${t}:${track}`;
    const reached = tier >= t;
    const locked = track === "premium" && !active;
    const isClaimed = claimed.has(key);
    const big = reward?.kind === "item";
    if (!reward) return <div className="pipe-empty" aria-hidden />;
    return (
      <div
        className={`pipe-cell ${track === "premium" ? "is-premium" : ""} ${big ? "is-big" : ""} ${reached ? "is-reached" : ""} ${locked ? "is-locked" : ""} ${isClaimed ? "is-claimed" : ""}`}
        aria-label={`Tier ${t} ${track === "free" ? "free" : "pass"} reward: ${rewardLabel(reward)}${isClaimed ? ", claimed" : locked ? ", needs the pass" : reached ? ", ready to claim" : ""}`}
      >
        <RewardArt r={reward} equipped={equipped} />
        <span className="line-clamp-2 text-caption leading-tight font-semibold">{rewardLabel(reward)}</span>
        {isClaimed ? (
          <span className="pipe-tag ok">✓ Claimed</span>
        ) : locked ? (
          <span className="pipe-tag">
            <Lock /> Pass
          </span>
        ) : reached ? (
          <button type="button" className="pipe-claim" onClick={() => onClaim(t, track)} disabled={busy !== null}>
            Claim
          </button>
        ) : (
          <span className="pipe-tag">Tier {t}</span>
        )}
      </div>
    );
  };

  return (
    <section className="pipeline" aria-label="Duel Pass tiers">
      <div className="pipe-labels" aria-hidden>
        <span className="pipe-label">Free</span>
        <span className="pipe-label-gap" />
        <span className="pipe-label is-premium">Pass</span>
      </div>
      <div ref={scroller} className="pipe-scroll">
        <ol className="pipe-grid" style={{ width: PASS.tiers * COL, gridTemplateColumns: `repeat(${PASS.tiers}, ${COL}px)` }}>
          <li className="pipe-rail" aria-hidden>
            <span className="pipe-rail-fill" style={{ width: fill }} />
          </li>
          {Array.from({ length: PASS.tiers }, (_, i) => i + 1).map((t) => (
            <li key={t} className="contents">
              <div style={{ gridColumn: t, gridRow: 1 }} className="px-1.5">
                {cell(t, "free")}
              </div>
              <div style={{ gridColumn: t, gridRow: 2 }} className="grid place-items-center">
                <span className={`pipe-node ${tier >= t ? "is-reached" : ""} ${tier === t || (tier === 0 && t === 1) ? "is-current" : ""}`} aria-current={tier === t ? "step" : undefined}>
                  {t}
                </span>
              </div>
              <div style={{ gridColumn: t, gridRow: 3 }} className="px-1.5">
                {cell(t, "premium")}
              </div>
            </li>
          ))}
        </ol>
      </div>
      {onUnlock && (
        <button type="button" className="pipe-unlock" onClick={onUnlock} disabled={busy !== null}>
          <Lock /> Unlock the pass track
        </button>
      )}
    </section>
  );
}
