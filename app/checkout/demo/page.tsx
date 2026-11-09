"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Coins } from "@/components/coin";
import { Button, Panel, Section, Spinner } from "@/components/ui";
import { formatPrice } from "@/lib/catalog";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles } from "@/lib/use-profile";

interface Summary {
  order: { id: string; kind: "pro" | "coins" | "gems" | "pass" | "bundle" | "item"; status: string; name: string; detail: string; pricePence: number; coins: number; gems: number; recurring: boolean };
  live: boolean;
}

/**
 * Demo checkout, used only while real payments aren't connected. It never asks
 * for card details and says plainly that nothing is charged.
 */
export default function DemoCheckout() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const order = new URLSearchParams(window.location.search).get("order") ?? "";
    api<Summary>(`/api/billing/demo?order=${encodeURIComponent(order)}&playerId=${getPlayerId()}`)
      .then(setSummary)
      .catch((err) => setError((err as Error).message));
  }, []);

  async function confirm() {
    if (!summary) return;
    setBusy(true);
    try {
      const r = await api<{ itemId: string | null }>("/api/billing/demo", { body: { order: summary.order.id, playerId: getPlayerId() } });
      refreshProfiles();
      const k = summary.order.kind;
      router.push(k === "pass" ? "/pass?purchased=pass" : k === "pro" || k === "bundle" ? `/pricing?purchased=${k}` : `/shop?purchased=${k}${r.itemId ? `&item=${r.itemId}` : ""}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Section
      title="Checkout"
      intro="Demo mode: payments aren't connected to this app yet, so confirming won't charge you and no card details are needed."
    >
      {error ? (
        <Panel>
          <p className="text-body-lg text-destructive">{error}</p>
          <Link href="/shop" className="mt-3 inline-block text-body underline underline-offset-4">
            Back to the shop
          </Link>
        </Panel>
      ) : !summary ? (
        <p className="flex items-center gap-2 text-body text-muted-foreground">
          <Spinner /> Loading your order…
        </p>
      ) : (
        <Panel className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-title-lg font-semibold">{summary.order.name}</p>
              <p className="text-body-lg text-muted-foreground">{summary.order.detail}</p>
              {summary.order.kind === "pro" && (
                <p className="mt-2 text-body text-muted-foreground">
                  Includes <Coins amount={summary.order.coins} /> bonus coins.
                </p>
              )}
            </div>
            <p className="text-title-lg font-semibold tabular-nums">
              {formatPrice(summary.order.pricePence)}
              {summary.order.recurring && <span className="text-body font-normal text-muted-foreground"> / month</span>}
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-input px-4 py-3 text-body text-muted-foreground">
            Demo purchase: £0.00 will be charged. When the app owner connects Stripe, this step becomes Stripe&apos;s secure
            checkout page.
          </div>
          {summary.order.status === "paid" ? (
            <p className="text-body-lg text-success">This order is already complete.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="brand" size="lg" onClick={confirm} disabled={busy}>
                {busy ? <Spinner /> : null} Confirm demo purchase
              </Button>
              <Button variant="ghost" size="lg" onClick={() => router.push("/shop?checkout=cancelled")}>
                Cancel
              </Button>
            </div>
          )}
        </Panel>
      )}
    </Section>
  );
}
