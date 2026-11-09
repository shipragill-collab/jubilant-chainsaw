"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Avatar } from "@/components/avatar";
import { Button, Spinner } from "@/components/ui";
import { PLANS, currentMonth, formatPrice, proSkinFor } from "@/lib/catalog";
import { BUNDLE, PASS } from "@/lib/pass";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles, useProfile, type ClientProfile } from "@/lib/use-profile";

function Tick() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="var(--plan-accent)" />
      <path d="m6 10.5 2.6 2.5L14 7.5" fill="none" stroke="var(--plan-accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  solo: (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20" />
    </svg>
  ),
  versus: (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" />
      <path d="M9.5 6.5 13 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2" />
    </svg>
  ),
  crown: (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" />
    </svg>
  ),
};

/** One plan. `audience` is the big "who is this for" tag that does the deciding for you. */
function PlanCard({
  variant,
  audience,
  icon,
  title,
  price,
  was,
  tagline,
  features,
  status,
  children,
}: {
  variant: "solo" | "versus" | "ultimate";
  audience: string;
  icon: ReactNode;
  title: string;
  price: number;
  was?: number;
  tagline: string;
  features: string[];
  status?: string;
  children: ReactNode;
}) {
  return (
    <article className={`plan plan-${variant} flex flex-col`} aria-label={`${title}, ${formatPrice(price)} a month. ${audience}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="plan-audience">
          {icon}
          {audience}
        </span>
        {status && <span className="plan-status">{status}</span>}
      </div>
      <h2 className="mt-5 font-display text-[26px] leading-none font-extrabold tracking-[-0.03em]">{title}</h2>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="font-display text-[46px] leading-none font-extrabold tracking-[-0.04em] tabular-nums">{formatPrice(price)}</span>
        <span className="text-body-lg opacity-65">/ month</span>
        {was && <s className="text-body-lg opacity-50 tabular-nums">{formatPrice(was)}</s>}
      </p>
      <p className="mt-3 text-body-lg opacity-75">{tagline}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex gap-3 text-body-lg">
            <Tick />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-7 space-y-3">{children}</div>
    </article>
  );
}

export default function PricingPage() {
  const { profile, setProfile } = useProfile();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const monthly = proSkinFor(currentMonth());

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("cancelled");
    if (c === "pass") setNotice("The Duel Pass has been cancelled.");
    else if (c) setNotice("Pro has been cancelled. You're on the Free plan.");
    const p = q.get("purchased");
    if (p === "pro") setNotice("Welcome to Pro! Claim this month's skin below.");
    if (p === "bundle") setNotice(`Welcome to ${BUNDLE.name}! Pro and the Duel Pass are both switched on.`);
  }, []);

  async function go(key: string, path: string, body: Record<string, unknown>) {
    setBusy(key);
    setError(null);
    try {
      const { url } = await api<{ url: string }>(path, { body: { playerId: getPlayerId(), ...body } });
      refreshProfiles();
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  async function claimMonthly() {
    setBusy("claim");
    setError(null);
    try {
      const next = await api<ClientProfile>("/api/pro/claim-skin", { body: { playerId: getPlayerId() } });
      setProfile((p) => (p ? { ...p, ...next } : p));
      setNotice(`${monthly?.name} is yours and you're wearing it.`);
      refreshProfiles();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const pro = profile?.plan === "pro";
  const pass = Boolean(profile?.passActive);
  const both = pro && pass;
  const claimed = monthly ? profile?.owned.includes(monthly.id) : false;
  const until = (t: number | null | undefined) => (t ? new Date(t).toLocaleDateString("en-GB") : "");
  const separately = PLANS.pro.pricePence + PASS.pricePence;
  const saving = separately - BUNDLE.pricePence;
  const spin = (key: string) => (busy === key ? <Spinner /> : null);

  return (
    <div className="space-y-10 py-10 sm:py-14">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <div className="space-y-3">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">Plans</p>
          <h1 className="text-[34px] leading-[1.08] tracking-tight sm:text-[46px]">Pick the plan that fits how you play.</h1>
          <p className="max-w-[52ch] text-body-lg text-muted-foreground">
            Studying on your own? Go <strong className="text-foreground">Pro</strong>. Here to beat your friends? Get the{" "}
            <strong className="text-foreground">Duel Pass</strong>. Want both? <strong className="text-foreground">{BUNDLE.name}</strong> saves you{" "}
            {formatPrice(saving)} a month. Cancel any time.
          </p>
        </div>
        <div className="space-y-2">
          {notice && (
            <p role="status" className="rounded-2xl bg-success-soft px-4 py-3 text-body text-success">
              {notice}
            </p>
          )}
          {profile && !profile.paymentsLive && <p className="text-body text-muted-foreground">Demo mode: payments aren&apos;t connected yet, so subscribing won&apos;t charge you.</p>}
        </div>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-6">
        <PlanCard
          variant="solo"
          audience="Best for solo learners"
          icon={ICONS.solo}
          title="Pro"
          price={PLANS.pro.pricePence}
          tagline={PLANS.pro.tagline}
          features={PLANS.pro.features.slice(0, 5)}
          status={pro ? `Active${profile?.proUntil ? ` · until ${until(profile.proUntil)}` : ""}` : undefined}
        >
          {monthly && (
            <div className="flex items-center gap-3 rounded-2xl bg-[color-mix(in_oklab,var(--plan-accent)_12%,transparent)] p-3">
              <Avatar equipped={{ ...(profile?.equipped ?? {}), skin: monthly.id }} size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-caption uppercase opacity-60">This month&apos;s Pro skin</p>
                <p className="font-semibold">{monthly.name}</p>
              </div>
              {pro && !claimed && (
                <Button variant="brand" size="sm" onClick={claimMonthly} disabled={busy !== null}>
                  {spin("claim")} Claim
                </Button>
              )}
              {pro && claimed && <span className="text-label opacity-70">Claimed</span>}
            </div>
          )}
          {pro ? (
            <Button variant="secondary" className="w-full" onClick={() => go("mpro", "/api/billing/manage", { which: "pro" })} disabled={busy !== null}>
              {profile?.paymentsLive ? "Manage Pro" : "Cancel Pro"}
            </Button>
          ) : (
            <button type="button" className="plan-cta" onClick={() => go("pro", "/api/billing/checkout", { kind: "pro" })} disabled={busy !== null}>
              {spin("pro")} Go Pro · {formatPrice(PLANS.pro.pricePence)}
            </button>
          )}
        </PlanCard>

        <PlanCard
          variant="ultimate"
          audience={`Best value · save ${formatPrice(saving)}`}
          icon={ICONS.crown}
          title={BUNDLE.name}
          price={BUNDLE.pricePence}
          was={separately}
          tagline="Pro and the Duel Pass together: unlimited study and every season reward."
          features={[...BUNDLE.features, "Unlimited AI and Raj", "All 30 pass tiers, skins and bling"]}
          status={both ? "Active" : undefined}
        >
          {both ? (
            <p className="text-body opacity-80">You have everything. Enjoy!</p>
          ) : (
            <button type="button" className="plan-cta" onClick={() => go("bundle", "/api/billing/checkout", { kind: "bundle" })} disabled={busy !== null}>
              {spin("bundle")} Get {BUNDLE.name} · {formatPrice(BUNDLE.pricePence)}
            </button>
          )}
          <p className="text-center text-caption opacity-60">{formatPrice(separately)} if bought separately</p>
        </PlanCard>

        <PlanCard
          variant="versus"
          audience="Best for competitive players"
          icon={ICONS.versus}
          title={PASS.name}
          price={PASS.pricePence}
          tagline="A monthly season of coins, gems, skins and bling for every duel you play."
          features={PASS.features}
          status={pass ? `Active · until ${until(profile?.passUntil)}` : undefined}
        >
          {pass ? (
            <div className="flex flex-wrap gap-2">
              <Link href="/pass" className="plan-cta flex-1">
                Open the pass
              </Link>
              <Button variant="ghost" onClick={() => go("mpass", "/api/billing/manage", { which: "pass" })} disabled={busy !== null}>
                {profile?.paymentsLive ? "Manage" : "Cancel"}
              </Button>
            </div>
          ) : (
            <>
              <button type="button" className="plan-cta" onClick={() => go("pass", "/api/billing/checkout", { kind: "pass" })} disabled={busy !== null}>
                {spin("pass")} Get the Duel Pass · {formatPrice(PASS.pricePence)}
              </button>
              <Link href="/pass" className="block text-center text-body underline underline-offset-4 opacity-80">
                See this season&apos;s rewards
              </Link>
            </>
          )}
        </PlanCard>
      </div>

      {/* Free stays visible but quiet, so it's a safety net rather than a competing choice. */}
      <section className="plan-free grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center" aria-label="Free plan">
        <div>
          <p className="font-display text-title-lg font-extrabold">Free</p>
          <p className="text-body text-muted-foreground">{formatPrice(0)} forever</p>
        </div>
        <p className="text-body text-muted-foreground">
          {PLANS.free.features.slice(0, 4).join(" · ")}
          {profile && !pro && (
            <span className="mt-1 block text-foreground">
              Today: {profile.usage.aiGenerations}/{PLANS.free.limits.aiGenerations} AI generations · {profile.usage.rajMessages}/{PLANS.free.limits.rajMessages} Raj messages
            </span>
          )}
        </p>
        {!pro && !pass ? <span className="plan-status">Your plan</span> : <Link href="/shop" className="text-body underline underline-offset-4">Visit the shop</Link>}
      </section>
      {error && <p className="text-body text-destructive">{error}</p>}
    </div>
  );
}
