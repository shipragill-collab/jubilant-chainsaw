"use client";

import { useEffect, useRef, useState } from "react";
import { THEME_SKINS, type ShopItem } from "@/lib/catalog";
import { sfx } from "@/lib/sfx";
import { RajCompanion } from "./raj-companion";

type Phase = "drop" | "shake" | "reveal" | "done";

/**
 * The Mythic unboxing, about 2.8 seconds:
 *  0.0s  the room dims; a face-down card with gold filigree drops in on a spring
 *  0.6s  it shakes three times, harder each time, with rising ticks and taps
 *  1.4s  a light sweep, then the card flips to reveal the gilded Raj; thud + arpeggio
 *  1.9s  the MYTHIC seal stamps on and gold flakes burst outward
 *  2.4s  the name rises in, with Equip now / Later
 * Under reduced motion it goes straight to the reveal.
 */
export function Unboxing({ item, onEquip, onClose }: { item: ShopItem; onEquip: () => void; onClose: () => void }) {
  const scope = `sk-${THEME_SKINS[item.id] ?? "midnight-folio"}`;
  const [phase, setPhase] = useState<Phase>("drop");
  const equipBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPhase("done");
      sfx.reveal();
      return;
    }
    const timers = [
      setTimeout(() => setPhase("shake"), 600),
      setTimeout(() => sfx.tick(0), 700),
      setTimeout(() => sfx.tick(1), 950),
      setTimeout(() => sfx.tick(2), 1170),
      setTimeout(() => {
        setPhase("reveal");
        sfx.reveal();
      }, 1400),
      setTimeout(() => setPhase("done"), 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === "done") equipBtn.current?.focus();
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const flakes = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const r = 140 + (i % 4) * 40;
    return { dx: `${Math.cos(a) * r}px`, dy: `${Math.sin(a) * r}px`, delay: `${(i % 5) * 0.03}s` };
  });

  return (
    <div className={`mf-unbox ${scope}`} role="dialog" aria-modal="true" aria-label={`${item.name} unlocked`}>
      <div className="mf-stage">
        <div className="mf-flip" data-phase={phase}>
          <div className="mf-face mf-filigree">
            <span className="mf-seal" style={{ width: 72, height: 72 }}>?</span>
          </div>
          <div className="mf-face front">
            <div className="relative grid justify-items-center gap-3">
              <RajCompanion state={phase === "done" || phase === "reveal" ? "happy" : "idle"} size={150} />
              {(phase === "reveal" || phase === "done") && (
                <span className="mf-seal mf-stamp">Mythic</span>
              )}
            </div>
          </div>
        </div>
        {(phase === "reveal" || phase === "done") && (
          <div className="mf-burst" aria-hidden>
            {flakes.map((f, i) => (
              <i key={i} style={{ ["--dx" as string]: f.dx, ["--dy" as string]: f.dy, animationDelay: f.delay }} />
            ))}
          </div>
        )}
        {phase === "done" ? (
          <div className="mf-reveal-text grid justify-items-center gap-4" style={{ animationDelay: "0s" }}>
            <div className="grid gap-1">
              <p className="text-caption font-semibold tracking-[0.2em] text-[#e2b65c] uppercase">Mythic app skin unlocked</p>
              <p className="mf-foil-text text-[34px] leading-tight font-extrabold tracking-tight">{item.name}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                ref={equipBtn}
                type="button"
                onClick={onEquip}
                className="mf-btn h-12 rounded-full px-6 text-body-lg font-bold transition active:translate-y-[3px] active:shadow-none"
              >
                Equip now
              </button>
              <button type="button" onClick={onClose} className="h-12 rounded-full px-6 text-body-lg font-semibold text-[#f3ebdd] ring-1 ring-[rgba(226,182,92,0.4)]">
                Later
              </button>
            </div>
          </div>
        ) : (
          <p className="h-[88px] text-body-lg text-[#a9a08f]" aria-live="polite">
            {phase === "reveal" ? "" : "Unsealing…"}
          </p>
        )}
      </div>
    </div>
  );
}
