"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DAILY_GOAL, MILESTONES, rajLine, type Activity } from "@/lib/raj-mood";
import { useRajActivity } from "@/lib/use-raj";
import { RajCompanion } from "./raj-companion";

const WEEKDAY = new Intl.DateTimeFormat("en", { weekday: "narrow", timeZone: "UTC" });
const DATE = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", timeZone: "UTC" });
const dateOf = (day: number) => new Date(day * 864e5);

export function StreakFlame({ lit, size = 22 }: { lit: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 20 24" width={size} height={size * 1.2} aria-hidden className={lit ? "streak-flame" : undefined}>
      <path d="M10 1 C12 6 18 9 18 15 A8 8 0 0 1 2 15 C2 11 5 9 6 6 C7 9 9 10 9 10 C9 6 8 4 10 1 Z" fill={lit ? "#ff8a3d" : "currentColor"} opacity={lit ? 1 : 0.22} />
      {lit && <path d="M10 11 C11 13 14 14 14 17 A4 4 0 0 1 6 17 C6 15 8 14 10 11 Z" fill="#ffc46b" />}
    </svg>
  );
}

function Widget({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={`surface mf-gilt grid content-start gap-4 p-5 sm:p-6 ${className}`}>
      <h2 className="text-label font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}

function StreakHero({ a }: { a: Activity }) {
  const line = rajLine(a);
  return (
    <Widget title="Your streak" className="md:col-span-2">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <StreakFlame lit={a.streak > 0} size={56} />
          <div>
            <p className="display text-[64px] leading-none tabular-nums">{a.streak}</p>
            <p className="text-body-lg text-muted-foreground">day streak</p>
          </div>
        </div>
        <div className="min-w-0 flex-1 basis-56 space-y-2">
          <p className="text-title font-semibold">
            {a.studiedToday ? "Today is done. Nicely kept." : a.streak > 0 ? "Study today to keep it alive." : "Study today to start a streak."}
          </p>
          <p className="text-body text-muted-foreground">
            Best streak: <span className="font-semibold text-foreground tabular-nums">{a.bestStreak}</span> day{a.bestStreak === 1 ? "" : "s"}
          </p>
          {!a.studiedToday && (
            <Link href={a.feeling === "new" ? "/study" : "/tutor"} className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-body font-semibold text-brand-foreground">
              {line.cta}
            </Link>
          )}
        </div>
        <div className="grid place-items-center rounded-2xl bg-[var(--raj-tint)] p-3">
          <RajCompanion feeling={a.feeling} size={84} label={`Raj looks ${a.feeling}`} />
        </div>
      </div>
    </Widget>
  );
}

function GoalRing({ a }: { a: Activity }) {
  const done = Math.min(a.todayCount, DAILY_GOAL);
  const r = 42;
  const c = 2 * Math.PI * r;
  const met = a.todayCount >= DAILY_GOAL;
  return (
    <Widget title="Daily goal">
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 100 100" width="104" height="104" role="img" aria-label={`${done} of ${DAILY_GOAL} study actions today`}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r} fill="none" strokeWidth="10" strokeLinecap="round"
            stroke={met ? "var(--raj-mustard)" : "var(--brand)"}
            strokeDasharray={c} strokeDashoffset={c * (1 - done / DAILY_GOAL)}
            transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.3, 1.2, 0.5, 1)" }}
          />
          <text x="50" y="57" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--foreground)">{done}/{DAILY_GOAL}</text>
        </svg>
        <div className="min-w-0 space-y-1">
          <p className="text-title-sm font-semibold">{met ? "Goal reached!" : `${DAILY_GOAL - done} to go`}</p>
          <p className="text-body text-muted-foreground">Duel answers, flashcard reviews, Raj practice and new study sets all count.</p>
        </div>
      </div>
    </Widget>
  );
}

function ThisWeek({ a }: { a: Activity }) {
  return (
    <Widget title="This week">
      <ol className="grid grid-cols-7 gap-2">
        {a.week.map((d) => (
          <li key={d.day} className="grid justify-items-center gap-1.5">
            <span
              className={`grid aspect-square w-full max-w-10 place-items-center rounded-xl border-[1.5px] ${
                d.active ? "border-transparent bg-[var(--raj-forest)]" : d.isToday ? "border-dashed border-[var(--raj-mustard)]" : "border-surface-border bg-muted"
              }`}
              title={d.active ? "Studied" : "No study"}
            >
              {d.active && <StreakFlame lit size={14} />}
            </span>
            <span className={`text-caption ${d.isToday ? "font-bold text-foreground" : "text-muted-foreground"}`}>{WEEKDAY.format(dateOf(d.day))}</span>
          </li>
        ))}
      </ol>
    </Widget>
  );
}

function Calendar({ a }: { a: Activity }) {
  const shade = (n: number) =>
    n === 0 ? "var(--muted)" : n < 3 ? "color-mix(in oklab, var(--heat) 40%, transparent)" : n < DAILY_GOAL ? "color-mix(in oklab, var(--heat) 70%, transparent)" : "var(--heat)";
  return (
    <Widget title="Last 5 weeks">
      <div className="grid grid-cols-7 gap-1.5" role="img" aria-label={`Studied on ${a.month.filter((d) => d.count).length} of the last 35 days`}>
        {a.month.map((d) => (
          <span
            key={d.day}
            title={`${DATE.format(dateOf(d.day))}: ${d.count} study action${d.count === 1 ? "" : "s"}`}
            className={`aspect-square rounded-[5px] ${d.isToday ? "ring-2 ring-[var(--raj-mustard)] ring-offset-1 ring-offset-[var(--surface)]" : ""}`}
            style={{ background: shade(d.count) }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-caption text-muted-foreground">
        <span>{DATE.format(dateOf(a.month[0].day))}</span>
        <span className="flex items-center gap-1">
          Less {[0, 1, 3, DAILY_GOAL].map((n) => <span key={n} className="size-3 rounded-[3px]" style={{ background: shade(n) }} />)} More
        </span>
        <span>Today</span>
      </div>
    </Widget>
  );
}

function Milestones({ a }: { a: Activity }) {
  const { target, previous } = a.milestone;
  const pct = Math.round(((a.streak - previous) / (target - previous)) * 100);
  return (
    <Widget title="Next milestone">
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--raj-tint)] text-title-lg font-extrabold text-foreground tabular-nums">{target}</span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-title-sm font-semibold">{target - a.streak} day{target - a.streak === 1 ? "" : "s"} to a {target}-day streak</p>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={previous} aria-valuemax={target} aria-valuenow={a.streak}>
            <div className="h-full rounded-full bg-[var(--raj-mustard)] transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Milestones">
        {MILESTONES.slice(0, 6).map((m) => (
          <li
            key={m}
            className={`rounded-full px-3 py-1 text-caption font-semibold tabular-nums ${a.bestStreak >= m ? "bg-[var(--raj-mustard)] text-[#2d2205]" : "bg-muted text-muted-foreground"}`}
            title={a.bestStreak >= m ? `Reached a ${m}-day streak` : `Reach a ${m}-day streak`}
          >
            {m} days
          </li>
        ))}
      </ul>
    </Widget>
  );
}

function Totals({ a }: { a: Activity }) {
  const stats = [
    { label: "Days studied", value: a.totalDays },
    { label: "Best streak", value: a.bestStreak },
    { label: "Today", value: a.todayCount },
  ];
  return (
    <Widget title="All time">
      <dl className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="grid gap-0.5">
            <dt className="text-caption text-muted-foreground">{s.label}</dt>
            <dd className="text-display-sm font-extrabold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Widget>
  );
}

/** The streak dashboard: six widgets driven by the same activity data as Raj's mood. */
export function StreakWidgets() {
  const a = useRajActivity();
  if (!a) return <div className="h-96" aria-hidden />;
  return (
    <div className="grid items-start gap-5 md:grid-cols-3">
      <StreakHero a={a} />
      <GoalRing a={a} />
      <div className="grid content-start gap-5">
        <ThisWeek a={a} />
        <Totals a={a} />
      </div>
      <Calendar a={a} />
      <Milestones a={a} />
    </div>
  );
}
