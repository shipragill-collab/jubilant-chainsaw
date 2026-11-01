"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Panel, Section, Spinner } from "@/components/ui";
import { PLANS, formatPrice } from "@/lib/catalog";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles, useProfile } from "@/lib/use-profile";

export default function PricingPage() {
  const { profile } = useProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("cancelled")) setNotice("Pro has been cancelled. You're on the Free plan.");
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

  const pro = profile?.plan === "pro";

  return (
    <Section
      title="Plans"
      intro="Start free. Go Pro for unlimited AI, a monthly coin bonus and exclusive gear in the shop."
      aside={
        <div className="space-y-3 pt-2">
          {notice && <p className="rounded-2xl bg-muted px-4 py-3 text-body">{notice}</p>}
          {profile && !profile.paymentsLive && (
            <p className="text-body text-muted-foreground">
              Demo mode: payments aren&apos;t connected yet, so upgrading won&apos;t charge you.
            </p>
          )}
          <Link href="/shop" className="inline-block text-body-lg text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Visit the shop
          </Link>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {(["free", "pro"] as const).map((id) => {
          const plan = PLANS[id];
          const current = profile ? profile.plan === id : id === "free";
          return (
            <div
              key={id}
              className={`flex flex-col rounded-[28px] p-7 sm:p-8 ${id === "pro" ? "bg-primary text-primary-foreground" : "bg-panel"}`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-title-lg font-semibold">{plan.name}</h2>
                {current && <Badge tone={id === "pro" ? "brand" : "neutral"}>Your plan</Badge>}
              </div>
              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="display text-[52px]">{formatPrice(plan.pricePence)}</span>
                {plan.pricePence > 0 && <span className="text-body-lg opacity-60">/ month</span>}
              </p>
              <p className="mt-2 text-body-lg opacity-70">{plan.tagline}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3 text-body-lg">
                    <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0" aria-hidden>
                      <circle cx="10" cy="10" r="9" fill={id === "pro" ? "#e1342f" : "currentColor"} opacity={id === "pro" ? 1 : 0.12} />
                      <path d="m6 10.5 2.6 2.5L14 7.5" fill="none" stroke={id === "pro" ? "#fff" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {id === "pro" ? (
                  pro ? (
                    <div className="space-y-2">
                      {profile?.proUntil && (
                        <p className="text-body opacity-70">Renews or ends on {new Date(profile.proUntil).toLocaleDateString()}.</p>
                      )}
                      <Button variant="secondary" onClick={() => go("/api/billing/manage", {})} disabled={busy}>
                        {profile?.paymentsLive ? "Manage subscription" : "Cancel Pro"}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="brand" size="lg" onClick={() => go("/api/billing/checkout", { kind: "pro" })} disabled={busy}>
                      {busy ? <Spinner /> : null} Upgrade to Pro
                    </Button>
                  )
                ) : (
                  <p className="text-body opacity-70">
                    {profile && !pro
                      ? `Today: ${profile.usage.aiGenerations}/${plan.limits.aiGenerations} AI generations · ${profile.usage.rajMessages}/${plan.limits.rajMessages} Raj messages`
                      : "Always free."}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-4 text-body text-destructive">{error}</p>}
    </Section>
  );
}
