"use client";

import { useEffect, useState } from "react";
import { summarizeActivity, type Activity } from "./raj-mood";
import { useProfile } from "./use-profile";

/** Raj's mood for this player, recomputed each minute so it rolls over at midnight. */
export function useRajActivity(): Activity | null {
  const { profile } = useProfile();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return profile ? summarizeActivity(profile.activity ?? [], now) : null;
}
