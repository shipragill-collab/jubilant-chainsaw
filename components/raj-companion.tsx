"use client";

import { useEffect, useRef } from "react";
import type { RajFeeling } from "@/lib/raj-mood";

/**
 * Raj, Quiz Duel's AI study companion: a living flashcard.
 *
 * Built from five primitives: a rounded card body, a folded corner, a mustard
 * bookmark ribbon, two dot eyes and a line mouth. States:
 *  - "idle": floats and blinks; with `listening`, leans in and looks down.
 *  - "thinking": rocks like a card being turned over, the corner flaps, the
 *    eyes scan upward and three mustard squares hop.
 *  - "happy": a squashy hop, arc eyes, an open smile, sparks draw in.
 * Animations live in globals.css (.raj-*) and honour prefers-reduced-motion.
 */
export type RajState = "idle" | "thinking" | "happy";

export function RajCompanion({
  state = "idle",
  feeling = "happy",
  listening = false,
  size = 40,
  followPointer = false,
  label,
  className = "",
}: {
  state?: RajState;
  /** How Raj feels about the player's study habit; shows while idle. */
  feeling?: RajFeeling;
  listening?: boolean;
  size?: number;
  /** Let the eyes follow the pointer while idle (use on large, featured Rajes). */
  followPointer?: boolean;
  /** Accessible name; omit when the companion is decorative. */
  label?: string;
  className?: string;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const eyes = useRef<SVGGElement>(null);

  useEffect(() => {
    if (eyes.current) eyes.current.style.transform = "";
    if (!followPointer || state !== "idle" || listening) return;
    const onMove = (e: PointerEvent) => {
      const r = svg.current?.getBoundingClientRect();
      if (!r || !eyes.current) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      const k = Math.min(3, len / 60);
      eyes.current.style.transform = `translate(${(dx / len) * k}px, ${(dy / len) * k}px)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [followPointer, state, listening]);

  return (
    <svg
      ref={svg}
      // Re-key on state so one-shot animations (the hop, the sparks) replay each time.
      key={`${state}-${feeling}`}
      className={`raj shrink-0 ${className}`}
      viewBox="-14 -14 148 150"
      width={size}
      height={size}
      data-state={state}
      data-feeling={feeling}
      data-listening={listening ? "true" : "false"}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <ellipse className="raj-shadow" cx="60" cy="124" rx="34" ry="5" />
      <g>
        <line className="raj-spark" x1="12" y1="18" x2="3" y2="9" />
        <line className="raj-spark" x1="7" y1="34" x2="-5" y2="32" />
        <line className="raj-spark" x1="26" y1="8" x2="23" y2="-4" />
      </g>
      <g>
        <rect className="raj-dot" x="104" y="10" width="7" height="7" rx="2" />
        <rect className="raj-dot" x="114" y="2" width="7" height="7" rx="2" />
        <rect className="raj-dot" x="124" y="-6" width="7" height="7" rx="2" />
      </g>
      <g className="raj-zzz">
        <path d="M100 4 h9 l-9 10 h9" />
        <path d="M113 -10 h7 l-7 8 h7" />
        <path d="M123 -22 h5 l-5 6 h5" />
      </g>
      <g className="raj-float">
        <g className="raj-tilt">
          <path className="raj-body" d="M44 22 H76 A26 26 0 0 1 102 48 V82 L84 104 H44 A26 26 0 0 1 18 78 V48 A26 26 0 0 1 44 22 Z" />
          <path className="raj-fold" d="M102 82 L84 104 L86 88 Z" strokeLinejoin="round" />
          <path className="raj-ribbon" d="M70 14 H84 V46 L77 40 L70 46 Z" />
          <g className="raj-eyes" ref={eyes}>
            <g className="raj-pupils">
              <g className="raj-dot-eyes">
                <g className="raj-blink">
                  <circle className="raj-feature" cx="47" cy="60" r="6" />
                  <circle className="raj-feature" cx="73" cy="60" r="6" />
                </g>
              </g>
              <g className="raj-happy-eyes">
                <path className="raj-stroke" d="M41 62 Q47 53 53 62" />
                <path className="raj-stroke" d="M67 62 Q73 53 79 62" />
              </g>
            </g>
          </g>
          <g className="raj-lids">
            <rect x="40" y="52" width="14" height="7.5" rx="1" />
            <rect x="66" y="52" width="14" height="7.5" rx="1" />
          </g>
          <g className="raj-closed-eyes">
            <path className="raj-stroke" d="M41 60 Q47 65 53 60" />
            <path className="raj-stroke" d="M67 60 Q73 65 79 60" />
          </g>
          <g className="raj-brows-up">
            <path className="raj-stroke" d="M40 47 Q47 42 54 47" />
            <path className="raj-stroke" d="M66 47 Q73 42 80 47" />
          </g>
          <g className="raj-brows-worry">
            <path className="raj-stroke" d="M40 50 L53 45" />
            <path className="raj-stroke" d="M80 50 L67 45" />
          </g>
          <path className="raj-stroke raj-mouth-smile" d="M53 78 Q60 84 67 78" />
          <path className="raj-stroke raj-mouth-frown" d="M53 82 Q60 76 67 82" />
          <path className="raj-stroke raj-mouth-wobble" d="M51 80 Q55.5 76 60 80 T69 80" />
          <circle className="raj-feature raj-mouth-o" cx="60" cy="80" r="3.5" />
          <path className="raj-stroke raj-mouth-flat" d="M55 80 H65" />
          <path className="raj-feature raj-mouth-open" d="M51 76 Q60 90 69 76 Z" />
        </g>
      </g>
    </svg>
  );
}

export const RAJ_STATUS: Record<RajState, string> = {
  idle: "Listening",
  thinking: "Thinking",
  happy: "Here's an idea",
};
