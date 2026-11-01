"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Coin, Coins } from "@/components/coin";
import { Badge, Button, Spinner } from "@/components/ui";
import { COIN_PACKS, ITEMS, SLOTS, formatPrice, type Equipped, type ShopItem, type Slot } from "@/lib/catalog";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles, useProfile, type ClientProfile } from "@/lib/use-profile";

const FRAME_BG: Record<Slot, string> = { skin: "#f6efe6", hat: "#e8f0fb", eyes: "#eef7d9", neck: "#fbe9e4" };

export default function ShopPage() {
  const { profile, setProfile } = useProfile();
  const [slot, setSlot] = useState<Slot>("skin");
  const [tryOn, setTryOn] = useState<ShopItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("purchased") === "pro") setMessage({ tone: "ok", text: "Welcome to Pro! Your bonus coins and Pro gear are unlocked." });
    else if (q.get("purchased") === "coins") setMessage({ tone: "ok", text: "Coins added. Happy shopping!" });
    else if (q.get("checkout") === "cancelled") setMessage({ tone: "error", text: "Checkout cancelled. You haven't been charged." });
    else if (q.get("checkout") === "failed") setMessage({ tone: "error", text: "We couldn't confirm that payment. If you were charged, contact support." });
  }, []);

  const equipped: Equipped = profile?.equipped ?? { skin: "skin-classic" };
  const preview: Equipped = tryOn ? { ...equipped, [tryOn.slot]: tryOn.id } : equipped;
  const items = useMemo(() => ITEMS.filter((i) => i.slot === slot), [slot]);
  const pro = profile?.plan === "pro";

  async function act(path: string, body: Record<string, unknown>, done: string) {
    setBusy(String(body.itemId ?? body.slot));
    setMessage(null);
    try {
      const next = await api<ClientProfile>(path, { body: { playerId: getPlayerId(), ...body } });
      setProfile((p) => (p ? { ...p, ...next } : p));
      setTryOn(null);
      setMessage({ tone: "ok", text: done });
      refreshProfiles();
    } catch (err) {
      setMessage({ tone: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function buyCoins(packId: string) {
    setBusy(packId);
    try {
      const { url } = await api<{ url: string }>("/api/billing/checkout", { body: { playerId: getPlayerId(), kind: "coins", packId } });
      window.location.href = url;
    } catch (err) {
      setMessage({ tone: "error", text: (err as Error).message });
      setBusy(null);
    }
  }

  return (
    <>
      <section className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        {/* Left: your character, wallet and plan */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-3">
            <h1 className="text-[32px] leading-[1.15] tracking-tight sm:text-[40px]">Shop</h1>
            <p className="text-body-lg text-muted-foreground">
              Dress up your duellist with skins and accessories. Your look shows in duels and on the leaderboard.
            </p>
          </div>
          <div className="panel grid place-items-center p-8">
            <Avatar equipped={preview} size={180} title="Your avatar" />
            <p className="mt-3 text-body text-muted-foreground">{tryOn ? `Trying on: ${tryOn.name}` : "Your look"}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Coins amount={profile?.coins ?? 0} className="text-title-lg font-semibold" />
            <a href="#coins" className="text-body-lg text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Get coins
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-body text-muted-foreground">
            <Badge tone={pro ? "brand" : "neutral"}>{pro ? "Pro" : "Free plan"}</Badge>
            {!pro && (
              <Link href="/pricing" className="underline underline-offset-4 hover:text-foreground">
                Go Pro for 1,000 coins a month and exclusive gear
              </Link>
            )}
          </div>
          <p className="text-body text-muted-foreground">You earn coins every time you finish a duel, and extra when you win.</p>
        </div>

        {/* Right: tabbed catalogue */}
        <div className="min-w-0 space-y-6">
          <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-panel p-1.5 sm:w-fit">
            {SLOTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSlot(s.id);
                  setTryOn(null);
                }}
                className={`shrink-0 rounded-full px-5 py-2.5 text-body-lg transition ${
                  slot === s.id ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {message && (
            <p
              role="status"
              className={`rounded-2xl px-4 py-3 text-body ${message.tone === "ok" ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}
            >
              {message.text}
              {message.tone === "error" && /Pro/.test(message.text) && (
                <>
                  {" "}
                  <Link href="/pricing" className="font-medium underline underline-offset-4">
                    See Pro
                  </Link>
                </>
              )}
            </p>
          )}

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const owned = profile?.owned.includes(item.id) ?? item.price === 0;
              const isOn = equipped[item.slot] === item.id;
              const locked = item.proOnly && !pro;
              return (
                <div key={item.id} className="min-w-0">
                  <button
                    onClick={() => setTryOn(tryOn?.id === item.id ? null : item)}
                    className={`block w-full rounded-md p-6 transition hover:brightness-[0.98] ${tryOn?.id === item.id ? "ring-2 ring-foreground" : ""}`}
                    style={{ background: "var(--panel)" }}
                    aria-label={`Try on ${item.name}`}
                  >
                    <div className="grid aspect-[4/3] place-items-center rounded-[3px]" style={{ background: FRAME_BG[item.slot] }}>
                      <Avatar equipped={{ ...equipped, [item.slot]: item.id }} size={112} />
                    </div>
                  </button>
                  <div className="mt-3 flex items-center gap-2 text-body-lg">
                    <span className="truncate">{item.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {owned ? "Owned" : item.price === 0 ? "Free" : <Coins amount={item.price} />}
                    </span>
                    {item.proOnly && <span aria-label="Pro only" title="Pro only" className="ml-auto size-2.5 shrink-0 rounded-full bg-brand" />}
                  </div>
                  <p className="mt-0.5 text-body text-muted-foreground">{item.description}</p>
                  <div className="mt-3">
                    {owned ? (
                      isOn ? (
                        item.slot === "skin" ? (
                          <Badge tone="success">Wearing</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" disabled={busy !== null} onClick={() => act("/api/shop/equip", { slot: item.slot, itemId: null }, `${item.name} removed.`)}>
                            Take off
                          </Button>
                        )
                      ) : (
                        <Button variant="secondary" size="sm" disabled={busy !== null} onClick={() => act("/api/shop/equip", { slot: item.slot, itemId: item.id }, `Now wearing ${item.name}.`)}>
                          Wear
                        </Button>
                      )
                    ) : locked ? (
                      <Link href="/pricing" className="text-label font-medium text-brand underline underline-offset-4">
                        Pro only · Upgrade
                      </Link>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busy !== null || (profile?.coins ?? 0) < item.price}
                        onClick={() => act("/api/shop/buy", { itemId: item.id }, `You bought ${item.name}!`)}
                      >
                        {busy === item.id ? <Spinner /> : <Coin size={14} />} Buy for {item.price.toLocaleString()}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="coins" className="bleed grid scroll-mt-6 gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div className="space-y-3">
          <h2 className="text-[30px] leading-[1.2] tracking-tight sm:text-[38px]">Get coins</h2>
          <p className="text-body-lg text-muted-foreground">Top up your wallet to unlock skins and accessories right away.</p>
          {profile && !profile.paymentsLive && (
            <p className="text-body text-muted-foreground">Demo mode: payments aren&apos;t connected yet, so nothing is charged.</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {COIN_PACKS.map((pack, i) => (
            <div key={pack.id} className="flex flex-col rounded-[24px] bg-surface p-6">
              <div className="flex -space-x-2">
                {Array.from({ length: i + 2 }).map((_, k) => (
                  <Coin key={k} size={30} />
                ))}
              </div>
              <p className="mt-5 text-title-lg font-semibold tabular-nums">{pack.coins.toLocaleString()} coins</p>
              <p className="text-body text-muted-foreground">{pack.label}</p>
              <Button variant="brand" className="mt-6" disabled={busy !== null} onClick={() => buyCoins(pack.id)}>
                {busy === pack.id ? <Spinner /> : null} {formatPrice(pack.pricePence)}
              </Button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
