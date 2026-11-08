"use client";

import Link from "next/link";
import { rajLine } from "@/lib/raj-mood";
import { useRajActivity } from "@/lib/use-raj";
import { RajCompanion } from "./raj-companion";

const WEEKDAY = new Intl.DateTimeFormat("en", { weekday: "narrow", timeZone: "UTC" });

function Flame({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 20 24" width="18" height="22" aria-hidden>
      <path d="M10 1 C12 6 18 9 18 15 A8 8 0 0 1 2 15 C2 11 5 9 6 6 C7 9 9 10 9 10 C9 6 8 4 10 1 Z" fill={lit ? "#ff7a1a" : "currentColor"} opacity={lit ? 1 : 0.25} />
      {lit && <path d="M10 11 C11 13 14 14 14 17 A4 4 0 0 1 6 17 C6 15 8 14 10 11 Z" fill="#ffd54f" />}
    </svg>
  );
}

/**
 * Raj's mood card: Raj reacts to the player's study habit, Duolingo-style,
 * with a streak counter, the last seven days and one clear next step.
 */
export function RajMoodCard({ href, compact = false }: { href?: string; compact?: boolean }) {
  const activity = useRajActivity();
  if (!activity) return <div className={compact ? "h-[180px]" : "h-[220px]"} aria-hidden />;
  const line = rajLine(activity);
  const target = href ?? (activity.feeling === "new" ? "/study" : "/tutor");
  const lit = activity.streak > 0;

  return (
    <section
      aria-label="Raj and your study streak"
      className={`raj-room flex gap-5 rounded-[24px] border-[1.5px] border-surface-border bg-surface shadow-[0_3px_0_var(--surface-border)] ${
        compact ? "flex-col items-start p-5" : "flex-col items-center p-6 sm:flex-row sm:items-center sm:p-7"
      }`}
    >
      <div className={`grid shrink-0 place-items-center rounded-[20px] bg-[var(--raj-tint)] ${compact ? "h-[120px] w-full" : "h-[150px] w-full sm:w-[170px]"}`}>
        <RajCompanion feeling={activity.feeling} size={compact ? 104 : 128} followPointer label={`Raj looks ${activity.feeling}`} />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-1">
          <p className="text-title-lg font-bold tracking-tight">{line.title}</p>
          <p className="text-body-lg text-muted-foreground">{line.body}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="flex items-center gap-1.5 text-body-lg font-bold tabular-nums" aria-label={`${activity.streak} day streak`}>
            <Flame lit={lit} /> {activity.streak}
            <span className="font-medium text-muted-foreground">day streak</span>
          </span>
          <ol className="flex gap-1.5" aria-label="Last 7 days">
            {activity.week.map((d) => (
              <li key={d.day} className="grid justify-items-center gap-1">
                <span
                  title={d.active ? "Studied" : "No study"}
                  className={`block size-5 rounded-[6px] border-[1.5px] ${
                    d.active
                      ? "border-[var(--raj-forest)] bg-[var(--raj-forest)]"
                      : d.isToday
                        ? "border-dashed border-[var(--raj-mustard)] bg-transparent"
                        : "border-surface-border bg-muted"
                  }`}
                />
                <span className={`text-[11px] leading-none ${d.isToday ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                  {WEEKDAY.format(new Date(d.day * 864e5))}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <Link
          href={target}
          className="inline-flex h-10 items-center rounded-full bg-[var(--raj-forest)] px-5 text-body font-semibold text-white shadow-[0_3px_0_var(--raj-forest-deep)] transition active:translate-y-[3px] active:shadow-none"
        >
          {line.cta}
        </Link>
      </div>
    </section>
  );
}

/** A tiny Raj for the header that shows today's mood and links to Raj. */
export function RajHeaderBuddy() {
  const activity = useRajActivity();
  const line = activity ? rajLine(activity) : null;
  return (
    <Link
      href="/tutor"
      title={line ? `${line.title} ${line.body}` : "Ask Raj"}
      aria-label={line ? `Raj: ${line.title}` : "Ask Raj"}
      className="grid size-11 place-items-center rounded-full bg-[var(--raj-tint)] transition hover:brightness-95"
    >
      <RajCompanion feeling={activity?.feeling ?? "happy"} size={34} />
    </Link>
  );
}
