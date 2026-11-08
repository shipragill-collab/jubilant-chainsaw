"use client";

import { useEffect, useRef, useState } from "react";
import { THEME_SKINS } from "@/lib/catalog";
import { setSoundEnabled, sfx, soundEnabled } from "@/lib/sfx";
import { useProfile } from "@/lib/use-profile";
import { useRajActivity } from "@/lib/use-raj";

/** Slow gold dust drifting up the page (Midnight Folio). Static under reduced motion. */
const PARTICLE_RGB: Record<string, string> = { "midnight-folio": "242, 217, 138", "moonlit-porcelain": "47, 84, 200" };

function GoldDust({ petals = false, rgb = PARTICLE_RGB["midnight-folio"] }: { petals?: boolean; rgb?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0;
    const specks = Array.from({ length: 42 }, () => ({
      x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6,
      v: 0.00004 + Math.random() * 0.00008, sway: Math.random() * Math.PI * 2, tw: Math.random() * Math.PI * 2,
    }));
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t: number) => {
      g.clearRect(0, 0, w, h);
      for (const s of specks) {
        if (!reduce) {
          s.y -= s.v * 16;
          if (s.y < -0.02) { s.y = 1.02; s.x = Math.random(); }
        }
        const x = (s.x + Math.sin(t / 4000 + s.sway) * 0.006) * w;
        const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t / 900 + s.tw));
        g.beginPath();
        g.fillStyle = `rgba(${rgb}, ${petals ? a * 0.7 : a})`;
        g.shadowColor = `rgba(${rgb}, 0.5)`;
        g.shadowBlur = petals ? 0 : 6;
        if (petals) {
          // a small cobalt petal, turning slowly as it drifts
          g.ellipse(x, s.y * h, s.r * 2.2, s.r * 1.1, t / 3000 + s.sway, 0, Math.PI * 2);
        } else {
          g.arc(x, s.y * h, s.r, 0, Math.PI * 2);
        }
        g.fill();
      }
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const onVis = () => { if (!document.hidden && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } };
    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis); };
  }, [petals, rgb]);
  return <canvas ref={ref} aria-hidden className="mf-dust" />;
}

/**
 * Applies the equipped app skin to the whole page (html[data-skin]) and runs
 * its living parts: gold dust, press sounds, and the ember swell when today's
 * study extends the streak.
 */
export function SkinProvider() {
  const { profile } = useProfile();
  const skin = profile?.equipped.theme ? THEME_SKINS[profile.equipped.theme] : undefined;
  const activity = useRajActivity();
  const studiedBefore = useRef<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (skin) root.dataset.skin = skin;
    else delete root.dataset.skin;
  }, [skin]);

  // Gold clink on every button press while the skin is on.
  useEffect(() => {
    if (!skin) return;
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("button, a.rounded-full, [role='tab']");
      if (el && !(el as HTMLButtonElement).disabled) sfx.clink();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [skin]);

  // Ember swell the moment today's study extends the streak.
  useEffect(() => {
    if (!activity) return;
    if (skin && studiedBefore.current === false && activity.studiedToday) {
      sfx.ember();
      document.documentElement.dataset.streakPulse = "1";
      setTimeout(() => delete document.documentElement.dataset.streakPulse, 2400);
    }
    studiedBefore.current = activity.studiedToday;
  }, [activity, skin]);

  return skin ? <GoldDust key={skin} petals={skin === "moonlit-porcelain"} rgb={PARTICLE_RGB[skin]} /> : null;
}

/** Header toggle for the skin's sounds; only shown while the skin is on. */
export function SkinSoundToggle() {
  const { profile } = useProfile();
  const [on, setOn] = useState(true);
  useEffect(() => setOn(soundEnabled()), []);
  if (!profile?.equipped.theme) return null;
  return (
    <button
      type="button"
      onClick={() => {
        setSoundEnabled(!on);
        setOn(!on);
      }}
      aria-pressed={on}
      aria-label={on ? "Mute skin sounds" : "Turn skin sounds on"}
      title={on ? "Mute skin sounds" : "Turn skin sounds on"}
      className="mf-sound grid size-10 place-items-center rounded-full text-muted-foreground hover:text-foreground"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 10v4h4l5 4V6L8 10H4Z" />
        {on ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="m17 9 5 6m0-6-5 6" />}
      </svg>
    </button>
  );
}
