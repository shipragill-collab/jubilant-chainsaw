"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Coin, Coins } from "@/components/coin";
import { Gem, Gems } from "@/components/gem";
import { RajCompanion } from "@/components/raj-companion";
import { Badge, Button, Spinner } from "@/components/ui";
import { Unboxing } from "@/components/unboxing";
import {
  COIN_PACKS,
  GEM_PACKS,
  ITEMS,
  RARITIES,
  RARITY_LABEL,
  SEASON_LABEL,
  SLOTS,
  THEME_SKINS,
  currentMonth,
  formatPrice,
  howToGet,
  itemById,
  proSkinFor,
  seasonStatus,
  type Equipped,
  type Rarity,
  type ShopItem,
  type Slot,
} from "@/lib/catalog";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles, useProfile, type ClientProfile } from "@/lib/use-profile";

const FRAME_BG: Record<Slot, string> = { skin: "#f6efe6", hat: "#e8f0fb", eyes: "#eef7d9", neck: "#fbe9e4", theme: "#0e1116" };
const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
type Filter = "all" | Rarity | "festive" | "paid" | "exclusive";

export function RarityBadge({ item }: { item: ShopItem }) {
  return <span className={`rarity rarity-${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>;
}

/** The little line under an item name that says where it comes from. */
function SourceTag({ item }: { item: ShopItem }) {
  const how = howToGet(item);
  if (item.season) {
    const st = seasonStatus(item.season);
    return (
      <span className="rarity rarity-festive">
        {SEASON_LABEL[item.season]} · {st.active ? `on sale until ${DATE.format(new Date(st.endsAt! - 1))}` : st.startsAt ? `back ${DATE.format(new Date(st.startsAt))}` : "off season"}
      </span>
    );
  }
  if (how === "pass") return <span className="rarity rarity-epic">Duel Pass · tier {item.passTier}</span>;
  if (how === "pro-monthly") return <span className="rarity rarity-rare">Pro · {new Date(`${item.proMonth}-01T00:00:00Z`).toLocaleString("en-GB", { month: "long", timeZone: "UTC" })}</span>;
  return null;
}

export default function ShopPage() {
  const { profile, setProfile } = useProfile();
  const [slot, setSlot] = useState<Slot>("skin");
  const [filter, setFilter] = useState<Filter>("all");
  const [tryOn, setTryOn] = useState<ShopItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [unboxing, setUnboxing] = useState<ShopItem | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const bought = q.get("purchased");
    const item = itemById(q.get("item"));
    if (bought === "item" && item?.slot === "theme") setUnboxing(item);
    else if (bought === "item" && item) setMessage({ tone: "ok", text: `${item.name} is yours!` });
    else if (bought === "pro") setMessage({ tone: "ok", text: "Welcome to Pro! Your bonus coins and this month's Pro skin are waiting." });
    else if (bought === "coins") setMessage({ tone: "ok", text: "Coins added. Happy shopping!" });
    else if (bought === "gems") setMessage({ tone: "ok", text: "Gems added. Bling awaits." });
    else if (q.get("checkout") === "cancelled") setMessage({ tone: "error", text: "Checkout cancelled. You haven't been charged." });
    else if (q.get("checkout") === "failed") setMessage({ tone: "error", text: "We couldn't confirm that payment. If you were charged, contact support." });
    if (q.get("tab") === "theme") setSlot("theme");
  }, []);

  const equipped: Equipped = profile?.equipped ?? { skin: "skin-classic" };
  const preview: Equipped = tryOn ? { ...equipped, [tryOn.slot]: tryOn.id } : equipped;
  const pro = profile?.plan === "pro";
  const owned = (id: string) => profile?.owned.includes(id) ?? false;
  const monthly = proSkinFor(currentMonth());

  const items = useMemo(() => {
    // The Skins tab also shows the Mythic app skins, so the rarest skins sit at the top.
    const list = ITEMS.filter((i) => i.slot === slot || (slot === "skin" && i.slot === "theme"));
    const ofFilter = (i: ShopItem) =>
      filter === "all" ||
      (filter === "festive" ? Boolean(i.season) : filter === "paid" ? howToGet(i) === "money" : filter === "exclusive" ? Boolean(i.passTier || i.proMonth) : i.rarity === filter);
    return list.filter(ofFilter);
  }, [slot, filter]);
  // Rarest first: Mythic, Legendary, Epic, Rare, then Common.
  const groups = useMemo(() => {
    const festive = items
      .filter((i) => i.season)
      .sort((a, b) => Number(seasonStatus(b.season!).active) - Number(seasonStatus(a.season!).active));
    const rest = items.filter((i) => !i.season);
    const byRarity = [...RARITIES]
      .reverse()
      .map((r) => ({ key: r as Rarity | "festive", label: RARITY_LABEL[r], items: rest.filter((i) => i.rarity === r) }));
    return [{ key: "festive" as const, label: "Festive", items: festive }, ...byRarity].filter((g) => g.items.length > 0);
  }, [items]);
  const festiveNow = ITEMS.filter((i) => i.season && seasonStatus(i.season).active);
  const skinCount = ITEMS.filter((i) => i.slot === "skin" || i.slot === "theme").length;

  async function act(path: string, body: Record<string, unknown>, done: string) {
    setBusy(String(body.itemId ?? body.slot ?? path));
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

  async function checkout(kind: "coins" | "gems" | "item", ref: string) {
    setBusy(ref);
    setMessage(null);
    try {
      const body = kind === "item" ? { kind, itemId: ref } : { kind, packId: ref };
      const { url } = await api<{ url: string }>("/api/billing/checkout", { body: { playerId: getPlayerId(), ...body } });
      window.location.href = url;
    } catch (err) {
      setMessage({ tone: "error", text: (err as Error).message });
      setBusy(null);
    }
  }

  async function buyMythic(item: ShopItem) {
    if (howToGet(item) === "money") return checkout("item", item.id);
    setBusy(item.id);
    setMessage(null);
    try {
      const next = await api<ClientProfile>("/api/shop/buy", { body: { playerId: getPlayerId(), itemId: item.id } });
      setProfile((p) => (p ? { ...p, ...next } : p));
      setUnboxing(item);
    } catch (err) {
      setMessage({ tone: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  function BuyButton({ item }: { item: ShopItem }) {
    const how = howToGet(item);
    const isOwned = owned(item.id);
    const isOn = equipped[item.slot] === item.id;
    if (isOwned) {
      if (isOn) {
        return item.slot === "skin" ? (
          <Badge tone="success">Wearing</Badge>
        ) : (
          <Button variant="ghost" size="sm" disabled={busy !== null} onClick={() => act("/api/shop/equip", { slot: item.slot, itemId: null }, `${item.name} removed.`)}>
            Take off
          </Button>
        );
      }
      return (
        <Button variant="secondary" size="sm" disabled={busy !== null} onClick={() => act("/api/shop/equip", { slot: item.slot, itemId: item.id }, `Now wearing ${item.name}.`)}>
          Wear
        </Button>
      );
    }
    if (how === "pass") return <Link href="/pass" className="text-label font-medium text-brand underline underline-offset-4">Earn on the Duel Pass</Link>;
    if (how === "pro-monthly") {
      return item.proMonth === currentMonth() && pro ? (
        <Button variant="brand" size="sm" disabled={busy !== null} onClick={() => act("/api/pro/claim-skin", {}, `${item.name} claimed!`)}>
          Claim free
        </Button>
      ) : (
        <Link href="/pricing" className="text-label font-medium text-brand underline underline-offset-4">
          {item.proMonth === currentMonth() ? "Free with Pro" : item.proMonth! < currentMonth() ? "Past Pro skin" : "Coming to Pro"}
        </Link>
      );
    }
    if (item.season && !seasonStatus(item.season).active) return <span className="text-label text-muted-foreground">Returns next {SEASON_LABEL[item.season]}</span>;
    if (item.proOnly && !pro) return <Link href="/pricing" className="text-label font-medium text-brand underline underline-offset-4">Pro only · Upgrade</Link>;
    if (how === "money") {
      return (
        <Button variant="brand" size="sm" disabled={busy !== null} onClick={() => checkout("item", item.id)}>
          {busy === item.id ? <Spinner /> : null} Buy for {formatPrice(item.pricePence!)}
        </Button>
      );
    }
    if (how === "gems") {
      return (
        <Button variant="primary" size="sm" disabled={busy !== null || (profile?.gems ?? 0) < item.gems!} onClick={() => act("/api/shop/buy", { itemId: item.id }, `You bought ${item.name}!`)}>
          {busy === item.id ? <Spinner /> : <Gem size={14} />} Buy for {item.gems}
        </Button>
      );
    }
    return (
      <Button variant="primary" size="sm" disabled={busy !== null || (profile?.coins ?? 0) < item.price} onClick={() => act("/api/shop/buy", { itemId: item.id }, `You bought ${item.name}!`)}>
        {busy === item.id ? <Spinner /> : <Coin size={14} />} Buy for {item.price.toLocaleString()}
      </Button>
    );
  }

  function PriceLabel({ item }: { item: ShopItem }) {
    if (owned(item.id)) return <>Owned</>;
    const how = howToGet(item);
    if (how === "money") return <>{formatPrice(item.pricePence!)}</>;
    if (how === "gems") return <Gems amount={item.gems!} />;
    if (how === "pass" || how === "pro-monthly") return <>Exclusive</>;
    return item.price === 0 ? <>Free</> : <Coins amount={item.price} />;
  }

  return (
    <>
      <section id="wallet" className="bleed grid scroll-mt-6 gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div className="space-y-3">
          <h1 className="text-[32px] leading-[1.15] tracking-tight sm:text-[40px]">Shop</h1>
          <h2 className="text-title-lg font-semibold">Top up</h2>
          <p className="text-body-lg text-muted-foreground">Coins buy skins and accessories. Gems buy bling and gemstone skins.</p>
          {profile && !profile.paymentsLive && <p className="text-body text-muted-foreground">Demo mode: payments aren&apos;t connected yet, so nothing is charged.</p>}
        </div>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {COIN_PACKS.map((pack, i) => (
              <div key={pack.id} className="flex flex-col rounded-[24px] bg-surface p-5">
                <div className="flex -space-x-2">
                  {Array.from({ length: i + 2 }).map((_, k) => <Coin key={k} size={30} />)}
                </div>
                <p className="mt-4 text-title-lg font-semibold tabular-nums">{pack.coins.toLocaleString()} coins</p>
                <p className="text-body text-muted-foreground">{pack.label}</p>
                <Button variant="brand" className="mt-4" disabled={busy !== null} onClick={() => checkout("coins", pack.id)}>
                  {busy === pack.id ? <Spinner /> : null} {formatPrice(pack.pricePence)}
                </Button>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {GEM_PACKS.map((pack, i) => (
              <div key={pack.id} className="flex flex-col rounded-[24px] bg-surface p-5">
                <div className="flex -space-x-1.5">
                  {Array.from({ length: i + 2 }).map((_, k) => <Gem key={k} size={28} />)}
                </div>
                <p className="mt-4 text-title-lg font-semibold tabular-nums">{pack.gems} gems</p>
                <p className="text-body text-muted-foreground">{pack.label}</p>
                <Button variant="primary" className="mt-4" disabled={busy !== null} onClick={() => checkout("gems", pack.id)}>
                  {busy === pack.id ? <Spinner /> : null} {formatPrice(pack.pricePence)}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        {/* Left: your character, wallet and plan */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-3">
            <h2 className="text-title-lg font-semibold">Your collection</h2>
            <p className="text-body-lg text-muted-foreground">
              {skinCount} skins from Common to Mythic, festive specials, bling and accessories. Your look shows in duels and on the leaderboard.
            </p>
          </div>
          <div className="panel grid place-items-center p-8">
            <Avatar equipped={preview} size={180} title="Your avatar" />
            <p className="mt-3 text-body text-muted-foreground">{tryOn ? `Trying on: ${tryOn.name}` : "Your look"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Coins amount={profile?.coins ?? 0} className="text-title-lg font-semibold" />
            <Gems amount={profile?.gems ?? 0} className="text-title-lg font-semibold" />
            <a href="#wallet" className="ml-auto text-body-lg text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Top up
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-body text-muted-foreground">
            <Badge tone={pro ? "brand" : "neutral"}>{pro ? "Pro" : "Free plan"}</Badge>
            {profile?.passActive && <Badge tone="brand">Duel Pass</Badge>}
            {!pro && (
              <Link href="/pricing" className="underline underline-offset-4 hover:text-foreground">
                Pro: a free skin every month for £1.99
              </Link>
            )}
          </div>
          {monthly && (
            <div className="panel flex items-center gap-4 p-4">
              <Avatar equipped={{ ...equipped, skin: monthly.id }} size={64} />
              <div className="min-w-0 flex-1">
                <p className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">This month&apos;s Pro skin</p>
                <p className="text-title-sm font-semibold">{monthly.name}</p>
              </div>
              <BuyButton item={monthly} />
            </div>
          )}
          <p className="text-body text-muted-foreground">Earn coins from duels, gems from the Duel Pass, or top up below.</p>
        </div>

        {/* Right: tabbed catalogue */}
        <div className="min-w-0 space-y-6">
          {slot !== "theme" && slot !== "skin" && (
            <button type="button" onClick={() => setSlot("theme")} className="sk-midnight-folio mf-card flex w-full items-center gap-4 p-4 text-left sm:p-5">
              <span className="mf-art grid size-16 shrink-0 place-items-center rounded-2xl">
                <RajCompanion size={54} feeling="proud" />
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="mf-accent block text-caption font-semibold tracking-[0.18em] uppercase">2 Mythic app skins</span>
                <span className="mf-foil-text block text-title-lg font-extrabold">Midnight Folio &amp; Moonlit Porcelain</span>
                <span className="mf-muted block truncate text-body">Re-skin the whole app, with their own sounds.</span>
              </span>
              <span className="mf-seal relative hidden shrink-0 sm:inline-grid">Mythic</span>
            </button>
          )}

          <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-panel p-1.5 sm:w-fit">
            {SLOTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSlot(s.id);
                  setTryOn(null);
                  setFilter("all");
                }}
                className={`shrink-0 rounded-full px-5 py-2.5 text-body-lg transition ${slot === s.id ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {slot !== "theme" && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter">
              {(["all", ...[...RARITIES].reverse(), "festive", "paid", "exclusive"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`rounded-full border px-3.5 py-1.5 text-label font-medium transition ${
                    filter === f ? "border-foreground bg-foreground text-background" : "border-surface-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : f === "festive" ? "Festive" : f === "paid" ? "Buy with £" : f === "exclusive" ? "Pass & Pro" : RARITY_LABEL[f as Rarity]}
                </button>
              ))}
            </div>
          )}

          {message && (
            <p role="status" className={`rounded-2xl px-4 py-3 text-body ${message.tone === "ok" ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}>
              {message.text}
              {message.tone === "error" && /Pro|Duel Pass/.test(message.text) && (
                <>
                  {" "}
                  <Link href={/Duel Pass/.test(message.text) ? "/pass" : "/pricing"} className="font-medium underline underline-offset-4">
                    See options
                  </Link>
                </>
              )}
            </p>
          )}

          {slot === "theme" ? (
            <div className="grid gap-8">
              {items.map((item) => (
                <MythicCard
                  key={item.id}
                  item={item}
                  owned={owned(item.id)}
                  equipped={equipped.theme === item.id}
                  coins={profile?.coins ?? 0}
                  busy={busy !== null}
                  onBuy={() => buyMythic(item)}
                  onEquip={(on) => act("/api/shop/equip", { slot: "theme", itemId: on ? item.id : null }, on ? `${item.name} is on.` : `${item.name} is off.`)}
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-body-lg text-muted-foreground">Nothing here with that filter.</p>
          ) : (
            <div className="grid gap-12">
              {groups.map((g) => (
                <section key={g.key} aria-labelledby={`rarity-${g.key}`} className="grid gap-5">
                  <div className="flex flex-wrap items-center gap-3 border-b border-surface-border pb-3">
                    <h2 id={`rarity-${g.key}`} className="text-title-lg font-semibold tracking-tight">
                      {g.label}
                    </h2>
                    <span className={`rarity rarity-${g.key}`}>{g.items.length}</span>
                    {g.key === "festive" && festiveNow.length > 0 && (
                      <span className="text-body text-muted-foreground">
                        {SEASON_LABEL[festiveNow[0].season!]} skins are on sale now
                      </span>
                    )}
                  </div>
                  {g.key === "mythic" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {g.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSlot("theme")}
                          className={`sk-${THEME_SKINS[item.id]} mf-card flex items-center gap-4 p-4 text-left`}
                          aria-label={`${item.name}, Mythic app skin. View details`}
                        >
                          <span className="mf-art grid size-20 shrink-0 place-items-center rounded-2xl">
                            <RajCompanion size={66} feeling="proud" />
                          </span>
                          <span className="relative min-w-0 flex-1">
                            <span className="mf-accent block text-caption font-semibold tracking-[0.16em] uppercase">Mythic app skin</span>
                            <span className="mf-foil-text block text-title-lg font-extrabold">{item.name}</span>
                            <span className="mf-muted block text-body">
                              {owned(item.id) ? "Owned" : howToGet(item) === "money" ? formatPrice(item.pricePence!) : `${item.price.toLocaleString()} coins`} · View
                            </span>
                          </span>
                          <span className="mf-seal relative hidden shrink-0 sm:inline-grid" style={{ width: 52, height: 52, fontSize: 8 }}>Mythic</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                      {g.items.map((item) => (
                    <div key={item.id} className="min-w-0">
                      <button
                        onClick={() => setTryOn(tryOn?.id === item.id ? null : item)}
                        className={`block w-full rounded-md p-6 transition hover:brightness-[0.98] ${tryOn?.id === item.id ? "ring-2 ring-foreground" : ""} ${
                          item.rarity === "legendary" ? "legendary-frame" : item.rarity === "epic" ? "epic-frame" : ""
                        }`}
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
                          <PriceLabel item={item} />
                        </span>
                        {item.proOnly && <span aria-label="Pro only" title="Pro only" className="ml-auto size-2.5 shrink-0 rounded-full bg-brand" />}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <RarityBadge item={item} />
                        <SourceTag item={item} />
                      </div>
                      <p className="mt-1.5 text-body text-muted-foreground">{item.description}</p>
                      <div className="mt-3">
                        <BuyButton item={item} />
                      </div>
                    </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      {unboxing && (
        <Unboxing
          item={unboxing}
          onClose={() => setUnboxing(null)}
          onEquip={() => {
            const it = unboxing;
            setUnboxing(null);
            void act("/api/shop/equip", { slot: "theme", itemId: it.id }, `${it.name} is on.`);
          }}
        />
      )}

    </>
  );
}

const MYTHIC_FEATURES: Record<string, string[]> = {
  "theme-midnight-folio": [
    "Obsidian and gold leaf across the app",
    "A gilded Raj with gold-rimmed edges",
    "Drifting gold dust and circling gilt frames",
    "A heartbeat glow on your streak",
    "Coin clinks, bell chimes and an ember swell",
    "Haptic taps on supported phones",
  ],
  "theme-moonlit-porcelain": [
    "Glazed porcelain and cobalt ink across the app",
    "A porcelain Raj rimmed in cobalt",
    "Drifting cobalt petals and silver frames",
    "A blue-and-white scalloped glaze",
    "Soft porcelain tings and a glass-bell chime",
    "Haptic taps on supported phones",
  ],
};

/** A Mythic shop card in its own skin's materials: circling metal border, holographic sweep, foil seal. */
function MythicCard({
  item,
  owned,
  equipped,
  coins,
  busy,
  onBuy,
  onEquip,
}: {
  item: ShopItem;
  owned: boolean;
  equipped: boolean;
  coins: number;
  busy: boolean;
  onBuy: () => void;
  onEquip: (on: boolean) => void;
}) {
  const money = howToGet(item) === "money";
  const short = money ? 0 : Math.max(0, item.price - coins);
  return (
    <article className={`sk-${THEME_SKINS[item.id]} mf-card grid gap-6 p-6 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:p-8`}>
      <div className="mf-art relative grid place-items-center rounded-[20px] py-8">
        <RajCompanion state="idle" feeling="proud" size={150} followPointer label={`Raj wearing ${item.name}`} />
        <span className="mf-seal absolute -top-3 -right-3">Mythic</span>
      </div>
      <div className="relative grid min-w-0 content-start gap-4">
        <div className="grid gap-1">
          <p className="mf-accent text-caption font-semibold tracking-[0.2em] uppercase">Mythic · App skin · {item.id === "theme-midnight-folio" ? "Edition I" : "Edition II"}</p>
          <h2 className="mf-foil-text text-[34px] leading-tight font-extrabold tracking-tight">{item.name}</h2>
        </div>
        <p className="mf-lore text-body-lg leading-relaxed italic">{item.lore}</p>
        <ul className="grid gap-2 text-body sm:grid-cols-2" style={{ color: "var(--sk-text)" }}>
          {(MYTHIC_FEATURES[item.id] ?? []).map((f) => (
            <li key={f} className="flex gap-2.5">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rotate-45" style={{ background: "var(--sk-accent)" }} />
              {f}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {owned ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onEquip(!equipped)}
              className={`${equipped ? "mf-btn-ghost" : "mf-btn"} h-12 rounded-full px-6 text-body-lg font-bold transition active:translate-y-[3px] disabled:opacity-60`}
            >
              {equipped ? "Take it off" : `Equip ${item.name}`}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy || short > 0}
              onClick={onBuy}
              className="mf-btn inline-flex h-12 items-center gap-2 rounded-full px-6 text-body-lg font-bold transition active:translate-y-[3px] disabled:opacity-50"
            >
              {money ? <>Unlock for {formatPrice(item.pricePence!)}</> : <><Coin size={18} /> Unlock for {item.price.toLocaleString()}</>}
            </button>
          )}
          <span className="mf-muted text-body">
            {owned ? (equipped ? "You're wearing it." : "In your collection.") : money ? "Bought at checkout." : short > 0 ? `You need ${short.toLocaleString()} more coins.` : "You can afford it."}
          </span>
        </div>
      </div>
    </article>
  );
}
