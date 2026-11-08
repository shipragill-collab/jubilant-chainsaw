"use client";

import { formatPrice } from "@/lib/catalog";
import { Coin } from "./coin";
import { Gem } from "./gem";
import { Spinner } from "./ui";

/** A little pile of coins or gems; bigger packs get bigger piles. */
function Hoard({ kind, tier }: { kind: "coins" | "gems"; tier: number }) {
  const Icon = kind === "coins" ? Coin : Gem;
  const layouts = [
    [[0, 8, 30]],
    [[0, 14, 30], [22, 6, 34]],
    [[0, 26, 36], [30, 16, 42], [62, 26, 36], [16, 0, 40], [46, 0, 38]],
  ][tier] as number[][];
  const w = tier === 2 ? 110 : tier === 1 ? 60 : 34;
  const h = tier === 2 ? 70 : 50;
  return (
    <span aria-hidden className="relative block shrink-0" style={{ width: w, height: h }}>
      {layouts.map(([x, y, size], i) => (
        <span key={i} className="absolute drop-shadow-[0_6px_8px_rgba(0,0,0,0.18)]" style={{ left: x, top: y }}>
          <Icon size={size} />
        </span>
      ))}
    </span>
  );
}

export function PackCard({
  kind,
  name,
  amount,
  pricePence,
  bonus,
  badge,
  tier,
  hero = false,
  busy,
  disabled,
  onBuy,
}: {
  kind: "coins" | "gems";
  name: string;
  amount: number;
  pricePence: number;
  bonus: number;
  badge?: "Best value" | "Most popular";
  tier: number;
  hero?: boolean;
  busy: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  return (
    <article className={`pack pack-${kind} h-full ${hero ? "pack-hero min-h-[260px] sm:row-span-2" : "min-h-[180px]"}`} aria-label={`${amount} ${kind}, ${formatPrice(pricePence)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          {badge ? <span className={`pack-ribbon ${badge === "Most popular" ? "soft" : ""}`}>{badge === "Best value" ? "★ " : ""}{badge}</span> : <span className="pack-sub text-caption font-semibold tracking-[0.12em] uppercase">{name}</span>}
          {badge && <p className="pack-sub text-caption font-semibold tracking-[0.12em] uppercase">{name}</p>}
        </div>
        <Hoard kind={kind} tier={tier} />
      </div>
      <div className={hero ? "mt-6 mb-6" : "mt-3 mb-4"}>
        <p className={`font-display leading-none font-extrabold tracking-[-0.04em] tabular-nums ${hero ? "text-[56px]" : "text-[34px]"}`}>{amount.toLocaleString()}</p>
        <p className="pack-sub mt-1 text-body font-semibold">
          {kind === "coins" ? "coins" : "gems"}
          {bonus > 0 && <span className="ml-2 rounded-full bg-[color-mix(in_oklab,var(--pack-ink)_10%,transparent)] px-2 py-0.5 text-caption font-bold">+{bonus}% extra</span>}
        </p>
        {hero && (
          <p className="pack-sub mt-3 max-w-[30ch] text-body">
            {kind === "coins" ? "Enough for a Mythic app skin, with plenty left over for accessories." : "Covers the Diamond skin and a Jewelled Crown, with gems to spare."}
          </p>
        )}
      </div>
      <button type="button" className="pack-btn btn" disabled={disabled} onClick={onBuy}>
        <span className="tabular-nums">{busy ? <Spinner /> : formatPrice(pricePence)}</span>
        <span className="pack-btn-arrow" aria-hidden>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </button>
    </article>
  );
}

/** Extra you get versus the smallest pack, as a whole percentage. */
export function bonusPercent(amount: number, pricePence: number, baseAmount: number, basePence: number) {
  return Math.max(0, Math.round(((amount / pricePence) / (baseAmount / basePence) - 1) * 100));
}
