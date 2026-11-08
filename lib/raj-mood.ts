/**
 * Raj's feelings follow how regularly the player studies, Duolingo-style:
 * delighted by a streak, eager when it's at risk, worried then sad when the
 * player stays away, and asleep after a long break. Days are the player's
 * local calendar days, so this runs in the browser.
 */

export type RajFeeling = "new" | "happy" | "proud" | "eager" | "worried" | "sad" | "sleepy";

const DAY = 24 * 3600 * 1000;

/** Local calendar day number (days since the epoch in the viewer's time zone). */
export function localDay(ts: number, tzOffsetMin = new Date(ts).getTimezoneOffset()): number {
  return Math.floor((ts - tzOffsetMin * 60_000) / DAY);
}

export interface Activity {
  feeling: RajFeeling;
  /** Consecutive days studied, ending today or yesterday. */
  streak: number;
  studiedToday: boolean;
  /** Whole days since the player last studied (0 = today); null if never. */
  daysAway: number | null;
  /** The last 7 days, oldest first: did the player study that day? */
  week: { day: number; active: boolean; isToday: boolean }[];
}

export function summarizeActivity(timestamps: number[], now = Date.now(), tz?: number): Activity {
  const day = (t: number) => (tz === undefined ? localDay(t) : localDay(t, tz));
  const today = day(now);
  const days = new Set(timestamps.filter((t) => t <= now).map(day));
  const last = days.size ? Math.max(...days) : null;
  const daysAway = last === null ? null : today - last;

  let streak = 0;
  if (daysAway !== null && daysAway <= 1) {
    for (let d = last!; days.has(d); d--) streak++;
  }

  const studiedToday = daysAway === 0;
  let feeling: RajFeeling;
  if (daysAway === null) feeling = "new";
  else if (studiedToday) feeling = streak >= 7 ? "proud" : "happy";
  else if (daysAway === 1) feeling = "eager";
  else if (daysAway <= 3) feeling = "worried";
  else if (daysAway <= 13) feeling = "sad";
  else feeling = "sleepy";

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = today - 6 + i;
    return { day: d, active: days.has(d), isToday: d === today };
  });

  return { feeling, streak, studiedToday, daysAway, week };
}

/** What Raj says for each feeling. Friendly nudges, never guilt trips. */
export function rajLine(a: Activity): { title: string; body: string; cta: string } {
  const days = (n: number) => `${n} day${n === 1 ? "" : "s"}`;
  switch (a.feeling) {
    case "new":
      return {
        title: "Hi, I'm Raj!",
        body: "Study a little each day and watch me light up. Your first session starts a streak.",
        cta: "Start studying",
      };
    case "proud":
      return {
        title: `${days(a.streak)} in a row!`,
        body: "That's a proper habit. I'm so proud of you. Keep it going tomorrow.",
        cta: "Practise a bit more",
      };
    case "happy":
      return {
        title: "Nice work today!",
        body: a.streak > 1 ? `Your streak is ${days(a.streak)}. Come back tomorrow to make it ${a.streak + 1}.` : "You've started a streak. Come back tomorrow to keep it going.",
        cta: "Keep practising",
      };
    case "eager":
      return {
        title: "Ready when you are!",
        body: `One quick round today keeps your ${a.streak}-day streak alive.`,
        cta: "Save my streak",
      };
    case "worried":
      return {
        title: "Everything OK?",
        body: `I haven't seen you for ${days(a.daysAway!)}. A two-minute practice would make my day.`,
        cta: "Do 2 minutes",
      };
    case "sad":
      return {
        title: "I miss you!",
        body: `It's been ${days(a.daysAway!)}. Let's start small with a few flashcards.`,
        cta: "Start small",
      };
    case "sleepy":
      return {
        title: "Zzz… oh, you're back?",
        body: "I dozed off while you were away. Three flashcards will wake me right up.",
        cta: "Wake Raj up",
      };
  }
}
