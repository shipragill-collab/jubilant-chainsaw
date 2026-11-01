"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProfileView } from "./profile";
import { api, getPlayerId } from "./player";

export type ClientProfile = ProfileView & { paymentsLive: boolean };

const listeners = new Set<() => void>();
/** Tell every mounted useProfile() to refetch (after a purchase, a duel, …). */
export const refreshProfiles = () => listeners.forEach((l) => l());

export function useProfile() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const load = useCallback(async () => {
    try {
      setProfile(await api<ClientProfile>(`/api/profile?playerId=${getPlayerId()}`));
    } catch {
      /* keep the last value */
    }
  }, []);
  useEffect(() => {
    void load();
    listeners.add(load);
    return () => {
      listeners.delete(load);
    };
  }, [load]);
  return { profile, setProfile, reload: load };
}
