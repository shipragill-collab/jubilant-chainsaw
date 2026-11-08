"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Avatar } from "@/components/avatar";
import { Badge, Button, Spinner } from "@/components/ui";
import { PLANS, currentMonth, formatPrice, proSkinFor } from "@/lib/catalog";
import { PASS } from "@/lib/pass";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles, useProfile, type ClientProfile } from "@/lib/use-profile";

function Tick({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="9" fill={on ? "#e1342f" : "currentColor"} opacity={on ? 1 : 0.12} />
      <path d="m6 10.5 2.6 2.5L14 7.5" fill="none" stroke={on ? "#fff" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanCard({ dark, title, price, tagline, features, current, children }: {
  dark?: boolean; title: string; price: number; tagline: string; features: string[]; current: boolean; children: ReactNode;
}) {
  return (
    <div className={`flex flex-col rounded-[28px] p-7 ${dark ? "bg-primary text-primary-foreground" : "bg-panel"}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-title-lg font-semibold">{title}</h2>
        {current && <Badge tone={dark ? "brand" : "neutral"}>{price ? "Active" : "Your plan"}</Badge>}
      </div>
      <p className="mt-6 flex items-baseline gap-1.5">
        <span className="display text-[48px]">{formatPrice(price)}</span>
        {price > 0 && <span className="text-body-lg opacity-60">/ month</span>}
      </p>
      <p className="mt-2 text-body-lg opacity-70">{tagline}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex gap-3 text-body-lg">
            <Tick on={Boolean(dark)} />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-8 space-y-3">{children}</div>
    </div>
  );
}

export default function PricingPage() {
  const { profile, setProfile } = useProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const monthly = proSkinFor(currentMonth());

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("cancelled");
    if (c === "pass") setNotice("The Duel Pass has been cancelled.");
    else if (c) setNotice("Pro has been cancelled. You're on the Free plan.");
    if (q.get("purchased") === "pro") setNotice("Welcome to Pro! Claim this month's skin below.");
  }, []);

  async function go(path: string, body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api<{ url: string }>(path, { body: { playerId: getPlayerId(), ...body } });
      refreshProfiles();
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function claimMonthly() {
    setBusy(true);
    setError(null);
    try {
      const next = await api<ClientProfile>("/api/pro/claim-skin", { body: { playerId: getPlayerId() } });
      setProfile((p) => (p ? { ...p, ...next } : p));
      setNotice(`${monthly?.name} is yours and you're wearing it.`);
      refreshProfiles();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const pro = profile?.plan === "pro";
  const pass = Boolean(profile?.passActive);
  const claimed = monthly ? profile?.owned.includes(monthly.id) : false;
  const until = (t: number | null | undefined) => (t ? new Date(t).toLocaleDateString("en-GB") : "");

  return (
    <div className="space-y-8 py-10 sm:py-14">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div className="space-y-3">
          <h1 className="text-[32px] leading-[1.15] tracking-tight sm:text-[40px]">Plans</h1>
          <p className="text-body-lg text-muted-foreground">Start free. Add Pro, the Duel Pass, or both. Each is £1.99 a month and you can cancel any time.</p>
        </div>
        <div className="space-y-2 lg:pt-3">
          {notice && <p className="rounded-2xl bg-muted px-4 py-3 text-body">{notice}</p>}
          {profile && !profile.paymentsLive && <p className="text-body text-muted-foreground">Demo mode: payments aren&apos;t connected yet, so subscribing won&apos;t charge you.</p>}
          <Link href="/shop" className="inline-block text-body-lg text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Visit the shop
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PlanCard title="Free" price={0} tagline={PLANS.free.tagline} features={PLANS.free.features} current={!pro}>
          <p className="text-body opacity-70">
            {profile && !pro
              ? `Today: ${profile.usage.aiGenerations}/${PLANS.free.limits.aiGenerations} AI generations · ${profile.usage.rajMessages}/${PLANS.free.limits.rajMessages} Raj messages`
              : "Always free."}
          </p>
        </PlanCard>

        <PlanCard dark title="Pro" price={PLANS.pro.pricePence} tagline={PLANS.pro.tagline} features={PLANS.pro.features} current={pro}>
          {monthly && (
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
              <Avatar equipped={{ ...(profile?.equipped ?? {}), skin: monthly.id }} size={52} />
              <div className="min-w-0 flex-1">
                <p className="text-caption uppercase opacity-60">This month&apos;s Pro skin</p>
                <p className="font-semibold">{monthly.name}</p>
              </div>
              {pro && !claimed && (
                <Button variant="brand" size="sm" onClick={claimMonthly} disabled={busy}>
                  Claim
                </Button>
              )}
              {pro && claimed && <span className="text-label opacity-70">Claimed</span>}
            </div>
          )}
          {pro ? (
            <>
              {profile?.proUntil && <p className="text-body opacity-70">Renews or ends on {until(profile.proUntil)}.</p>}
              <Button variant="secondary" onClick={() => go("/api/billing/manage", { which: "pro" })} disabled={busy}>
                {profile?.paymentsLive ? "Manage Pro" : "Cancel Pro"}
              </Button>
            </>
          ) : (
            <Button variant="brand" size="lg" onClick={() => go("/api/billing/checkout", { kind: "pro" })} disabled={busy}>
              {busy ? <Spinner /> : null} Upgrade to Pro
            </Button>
          )}
        </PlanCard>

        <PlanCard title={PASS.name} price={PASS.pricePence} tagline="A monthly season of coins, gems, skins and bling." features={PASS.features} current={pass}>
          {pass ? (
            <>
              <p className="text-body opacity-70">Active until {until(profile?.passUntil)}.</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/pass" className="inline-flex h-10 items-center rounded-full bg-brand px-4 font-medium text-brand-foreground">
                  Open the pass
                </Link>
                <Button variant="ghost" onClick={() => go("/api/billing/manage", { which: "pass" })} disabled={busy}>
                  {profile?.paymentsLive ? "Manage" : "Cancel"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="brand" size="lg" onClick={() => go("/api/billing/checkout", { kind: "pass" })} disabled={busy}>
                Get the Duel Pass
              </Button>
              <Link href="/pass" className="inline-flex h-12 items-center px-2 text-body underline underline-offset-4">
                See rewards
              </Link>
            </div>
          )}
        </PlanCard>
      </div>
      {error && <p className="text-body text-destructive">{error}</p>}
    </div>
  );
}
