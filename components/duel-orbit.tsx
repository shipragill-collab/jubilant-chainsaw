"use client";

import { useEffect, useRef } from "react";

/**
 * The home page's centrepiece, drawn on a canvas:
 * - an outer dial of 10 segments, one per question, lighting up in turn;
 * - a ring of fine ticks, like a stopwatch;
 * - a slowly turning sphere of dots (the notes);
 * - two bright players, you and a friend, racing round on tilted orbits.
 * It leans toward the pointer, pauses off screen, and holds still for
 * reduced-motion users.
 */
export function DuelOrbit({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let colors: string[] = [];
    let fg = "#f3f1ee";
    let dim = "rgba(255,255,255,0.12)";
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = (cs.getPropertyValue("--spectrum") || "#ff5a5f").split(",").map((c) => c.trim()).filter(Boolean);
      fg = cs.getPropertyValue("--foreground").trim() || fg;
      dim = cs.getPropertyValue("--grid-line").trim() || dim;
    };
    readColors();

    // A Fibonacci sphere: evenly spread points.
    const N = 900;
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = i * 2.399963229728653;
      return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
    });

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    resize();

    let tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
      targetX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
    };

    const trails: { x: number; y: number }[][] = [[], []];

    const draw = (time: number) => {
      const t = time / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.46;
      tiltX += (targetX - tiltX) * 0.05;
      tiltY += (targetY - tiltY) * 0.05;

      // Outer dial: 10 question segments, lit one after another.
      const segs = 10;
      const gap = 0.05;
      const lit = (t * 0.9) % (segs + 3);
      ctx.lineCap = "round";
      for (let i = 0; i < segs; i++) {
        const a0 = -Math.PI / 2 + (i / segs) * Math.PI * 2 + gap;
        const a1 = -Math.PI / 2 + ((i + 1) / segs) * Math.PI * 2 - gap;
        const on = Math.max(0, Math.min(1, lit - i));
        const col = colors[i % colors.length];
        ctx.lineWidth = Math.max(3, R * 0.022);
        ctx.strokeStyle = dim;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(cx, cy, R, a0, a1);
        ctx.stroke();
        if (on > 0) {
          ctx.strokeStyle = col;
          ctx.shadowColor = col;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(cx, cy, R, a0, a0 + (a1 - a0) * on);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      // Stopwatch ticks.
      const ticks = 120;
      for (let i = 0; i < ticks; i++) {
        const a = (i / ticks) * Math.PI * 2 + t * 0.05;
        const long = i % 10 === 0;
        const r0 = R * (long ? 0.86 : 0.88), r1 = R * 0.915;
        ctx.strokeStyle = long ? fg : dim;
        ctx.globalAlpha = long ? 0.35 : 1;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // The sphere of dots, turning.
      const S = R * 0.62;
      const rot = t * 0.18 + tiltY;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const tx = 0.35 + tiltX, cxr = Math.cos(tx), sxr = Math.sin(tx);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const x1 = p.x * cr + p.z * sr;
        const z1 = -p.x * sr + p.z * cr;
        const y2 = p.y * cxr - z1 * sxr;
        const z2 = p.y * sxr + z1 * cxr;
        const depth = (z2 + 1) / 2; // 0 back, 1 front
        const band = Math.abs(Math.sin(p.y * 3 + t * 0.6)) > 0.92;
        ctx.globalAlpha = 0.12 + depth * 0.75;
        ctx.fillStyle = band ? colors[0] : fg;
        const size = (band ? 1.6 : 1.1) * (0.6 + depth * 0.8);
        ctx.fillRect(cx + x1 * S - size / 2, cy + y2 * S - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      // Two players racing round tilted orbits, with fading trails.
      const players = [
        { col: colors[0], speed: 0.62, tilt: 0.5, off: 0 },
        { col: colors[5 % colors.length], speed: 0.55, tilt: -0.45, off: Math.PI },
      ];
      players.forEach((pl, k) => {
        const a = t * pl.speed + pl.off;
        const ox = Math.cos(a) * R * 0.78;
        const oy = Math.sin(a) * R * 0.3;
        const x = cx + ox * Math.cos(pl.tilt) - oy * Math.sin(pl.tilt);
        const y = cy + ox * Math.sin(pl.tilt) + oy * Math.cos(pl.tilt);
        const tr = trails[k];
        tr.push({ x, y });
        if (tr.length > 40) tr.shift();
        for (let j = 0; j < tr.length; j++) {
          ctx.globalAlpha = (j / tr.length) * 0.5;
          ctx.fillStyle = pl.col;
          const s = 1 + (j / tr.length) * 2.5;
          ctx.beginPath();
          ctx.arc(tr[j].x, tr[j].y, s, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowColor = pl.col;
        ctx.shadowBlur = 22;
        ctx.fillStyle = pl.col;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(4, R * 0.022), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    let raf = 0;
    let running = false;
    const loop = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      if (reduce.matches) {
        draw(4200); // one calm, finished-looking frame
        return;
      }
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(4200);
    });
    ro.observe(canvas);
    const mo = new MutationObserver(() => {
      readColors();
      if (!running) draw(4200);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-skin"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => readColors();
    mq.addEventListener("change", onScheme);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    const onReduce = () => {
      stop();
      start();
    };
    reduce.addEventListener("change", onReduce);
    draw(4200);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      mq.removeEventListener("change", onScheme);
      reduce.removeEventListener("change", onReduce);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`block aspect-square w-full ${className}`} />;
}
