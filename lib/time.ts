const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "2 months ago", "just now". */
export function timeAgo(ts: number, now = Date.now()): string {
  const secs = Math.round((now - ts) / 1000);
  if (secs < 60) return "just now";
  const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (secs >= size) return fmt.format(-Math.floor(secs / size), unit);
  }
  return "just now";
}
