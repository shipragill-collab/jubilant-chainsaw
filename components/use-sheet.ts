"use client";

import { animate, type AnimationPlaybackControls } from "motion";
import { useCallback, useEffect, useRef } from "react";

/**
 * A bottom sheet that behaves like a physical object (Apple's "fluid
 * interfaces" rules, translated for the web):
 * - it tracks the finger 1:1 and keeps the offset from where you grabbed it,
 * - it resists (rubber-bands) when pulled past the top,
 * - on release it projects your flick forward and picks open or closed from
 *   where it's *going*, then hands your speed to a spring,
 * - it can be grabbed mid-animation and starts from where it really is,
 * - it leaves the way it came in (down), and only cross-fades with reduced motion.
 */

const DRAG_THRESHOLD = 10; // px before we commit to a drag (taps on links still work)

/** Apple's momentum projection: where a flick would come to rest. */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Soft boundary: the further past the edge, the less it follows. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useSheet() {
  const ref = useRef<HTMLDialogElement>(null);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const y = useRef(0);

  const set = (value: number) => {
    y.current = value;
    const el = ref.current;
    if (el) el.style.transform = `translate3d(0, ${value}px, 0)`;
  };

  /** Spring to a resting point, starting from wherever the sheet is now. */
  const springTo = useCallback((target: number, velocity = 0, done?: () => void) => {
    anim.current?.stop();
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      // Gentle, non-moving equivalent: a short cross-fade.
      set(0);
      anim.current = animate(el, { opacity: target > 0 ? 0 : 1 }, { duration: 0.18, onComplete: done });
      return;
    }
    el.style.opacity = "1";
    // Critically damped by default; a touch of bounce only when a flick carried momentum.
    const bounce = Math.abs(velocity) > 400 && target === 0 ? 0.15 : 0;
    anim.current = animate(y.current, target, {
      type: "spring",
      bounce,
      duration: 0.4,
      velocity,
      onUpdate: set,
      onComplete: done,
    });
  }, []);

  const open = useCallback(() => {
    const el = ref.current;
    if (!el || el.open) return;
    el.showModal();
    if (reducedMotion()) el.style.opacity = "0"; // cross-fade in, no slide
    else set(el.getBoundingClientRect().height);
    springTo(0);
  }, [springTo]);

  const close = useCallback(() => {
    const el = ref.current;
    if (!el?.open) return;
    // Exit along the same path it entered: straight down.
    springTo(el.getBoundingClientRect().height + 24, 0, () => el.close());
  }, [springTo]);

  // Drag to dismiss.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { pointer: number; sheet: number; id: number } | null = null;
    let dragging = false;
    let history: { y: number; t: number }[] = [];

    const down = (e: PointerEvent) => {
      if (e.button !== 0 || e.target === el) return; // backdrop clicks are handled by onClick
      // Grab it mid-flight: stop the animation and start from where it really is.
      anim.current?.stop();
      start = { pointer: e.clientY, sheet: y.current, id: e.pointerId };
      dragging = false;
      history = [{ y: e.clientY, t: e.timeStamp }];
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dy = e.clientY - start.pointer;
      if (!dragging) {
        if (Math.abs(dy) < DRAG_THRESHOLD) return;
        dragging = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = "true";
      }
      const raw = start.sheet + dy;
      set(raw < 0 ? rubberband(raw, el.getBoundingClientRect().height) : raw);
      history.push({ y: e.clientY, t: e.timeStamp });
      if (history.length > 6) history.shift();
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const wasDragging = dragging;
      start = null;
      dragging = false;
      delete el.dataset.dragging;
      if (!wasDragging) {
        if (y.current !== 0) springTo(0);
        return;
      }
      const first = history[0];
      const last = history[history.length - 1];
      const dt = Math.max(1, last.t - first.t);
      const velocity = ((last.y - first.y) / dt) * 1000; // px/s
      const height = el.getBoundingClientRect().height;
      // Decide from where the flick is heading, not where the finger let go.
      const landing = y.current + project(velocity);
      if (landing > height * 0.5) springTo(height + 24, velocity, () => el.close());
      else springTo(0, velocity);
    };
    // A drag shouldn't also count as a click on the link under the finger.
    const click = (e: MouseEvent) => {
      if (el.dataset.justDragged) {
        e.preventDefault();
        e.stopPropagation();
        delete el.dataset.justDragged;
      }
    };
    const markDragged = () => {
      if (el.dataset.dragging) el.dataset.justDragged = "true";
    };
    const cancel = (e: Event) => {
      e.preventDefault(); // Escape: animate out instead of vanishing
      close();
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", markDragged, true);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    el.addEventListener("cancel", cancel);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", markDragged, true);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      el.removeEventListener("cancel", cancel);
      anim.current?.stop();
    };
  }, [springTo, close]);

  return { ref, open, close };
}
