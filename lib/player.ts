"use client";

const ID_KEY = "quiz-duel:player-id";
const NAME_KEY = "quiz-duel:name";

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: identity lasts for this page only */
  }
}

let memoryId: string | null = null;

/** Anonymous, per-browser player id. */
export function getPlayerId(): string {
  const stored = safeGet(ID_KEY) ?? memoryId;
  if (stored) return stored;
  const id = crypto.randomUUID();
  memoryId = id;
  safeSet(ID_KEY, id);
  return id;
}

export const getSavedName = () => safeGet(NAME_KEY) ?? "";
export const saveName = (name: string) => safeSet(NAME_KEY, name.trim());

export async function api<T>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: init?.method ?? (init?.body ? "POST" : "GET"),
    headers: init?.body ? { "content-type": "application/json" } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}
