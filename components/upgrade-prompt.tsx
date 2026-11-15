"use client";

import Link from "next/link";
import { useState } from "react";
import { PLANS, PRO_YEARLY, TRIAL_DAYS, formatPrice } from "@/lib/catalog";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles, useProfile } from "@/lib/use-profile";

/**
 * Shown when a free limit is reached: says what happened, then offers the
 * free trial (if unused) or Pro. Built from spans so it can sit inside text.
 */
export function UpgradePrompt({ message }: { message: string }) {
  const { profile } = useProfile();
  const [state, setState] = useState<"idle" | "busy" | "started" | "error">("idle");
  const [error, setError] = useState("");
  const trial = profile?.trialAvailable ?? false;

  async function startTrial() {
    setState("busy");
    try {
      await api("/api/pro/trial", { body: { playerId: getPlayerId() } });
      refreshProfiles();
      setState("started");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  if (state === "started") {
    return (
      <span role="status" className="upgrade-card block">
        <span className="block font-semibold text-foreground">Pro is on for {TRIAL_DAYS} days. Try that again!</span>
        <span className="block text-muted-foreground">Unlimited quizzes, study sets and Raj. No card, nothing to cancel.</span>
      </span>
    );
  }

  return (
    <span role="status" className="upgrade-card block">
      <span className="block font-mono text-[11px] tracking-[0.12em] text-brand uppercase">Free limit reached</span>
      <span className="mt-1 block text-foreground">{message.replace(/ Upgrade to Pro.*$/, "")}</span>
      <span className="mt-3 flex flex-wrap items-center gap-2">
        {trial ? (
          <button type="button" className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]" onClick={startTrial} disabled={state === "busy"}>
            {state === "busy" ? "Starting…" : `Try Pro free for ${TRIAL_DAYS} days`}
          </button>
        ) : (
          <Link href="/pricing" className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">
            Go Pro · {formatPrice(PLANS.pro.pricePence)}/month
          </Link>
        )}
        <Link href="/pricing" className="text-label text-muted-foreground underline underline-offset-4 hover:text-foreground">
          {trial ? "See plans" : `or ${formatPrice(PRO_YEARLY.pricePence)} a year`}
        </Link>
        <span className="text-label text-muted-foreground">or come back tomorrow</span>
      </span>
      {state === "error" && <span className="mt-2 block text-label text-destructive">{error}</span>}
    </span>
  );
}
