"use client";

import { formatPrice, itemById, packWorth, type ItemPack } from "@/lib/catalog";
import { Avatar } from "./avatar";
import { Coin } from "./coin";
import { Spinner } from "./ui";

/** A themed item bundle: the full look on an avatar, what's inside, and what it's worth. */
export function ItemPackCard({ pack, owned, busy, disabled, onBuy }: { pack: ItemPack; owned: string[]; busy: boolean; disabled: boolean; onBuy: () => void }) {
  const items = pack.items.map(itemById).filter((i): i is NonNullable<typeof i> => Boolean(i));
  const look = Object.fromEntries(items.map((i) => [i.slot, i.id]));
  const have = items.filter((i) => owned.includes(i.id)).length;
  const all = have === items.length;
  return (
    <article className="item-pack" aria-label={`${pack.name}, ${formatPrice(pack.pricePence)}`}>
      <div className="item-pack-art">
        <Avatar equipped={look} size={104} title={`${pack.name} look`} />
        <span className="item-pack-save">Worth {packWorth(pack).toLocaleString()} coins</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-[20px] font-bold tracking-[-0.02em]">{pack.name}</h3>
          <p className="text-body text-muted-foreground">{pack.tagline}</p>
        </div>
        <ul className="grid gap-1 text-body">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2">
              <span className="truncate">{i.name}</span>
              <span className={`shrink-0 font-mono text-[10px] tracking-[0.08em] uppercase ${owned.includes(i.id) ? "text-success" : "text-muted-foreground"}`}>
                {owned.includes(i.id) ? "Owned" : i.rarity}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-1.5 font-semibold">
            <Coin size={16} /> +{pack.coins} coins
          </li>
        </ul>
        <button type="button" onClick={onBuy} disabled={disabled || all} className="btn btn-brand mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-[6px] px-4 text-[13px]">
          {busy ? <Spinner /> : null} {all ? "You have it all" : `Get it · ${formatPrice(pack.pricePence)}`}
        </button>
        {have > 0 && !all && <p className="text-label text-muted-foreground">You already own {have} of these; you&apos;ll get the rest plus the coins.</p>}
      </div>
    </article>
  );
}
