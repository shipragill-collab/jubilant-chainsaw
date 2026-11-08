import type { ReactNode } from "react";
import { itemById, type Equipped, type SkinLook } from "@/lib/catalog";

/**
 * Player avatar: a round character drawn in SVG, with a skin and up to three
 * accessories layered on top. Everything is vector, so it's crisp at any size.
 */

/** Paint a skin from its catalogue look: a fill, optional defs, and decorations clipped to the body. */
function paint(itemId: string, look: SkinLook): { fill: string; defs: ReactNode; overlay: ReactNode; under: ReactNode; top: ReactNode; face?: string } {
  const [c0, c1 = c0, c2 = c1, c3 = c2] = look.colors;
  const id = `av-${itemId}`;
  const radial = (stops: string[]) => (
    <radialGradient id={id} cx="0.35" cy="0.3" r="0.9">
      {stops.map((c, i) => <stop key={i} offset={i / Math.max(1, stops.length - 1)} stopColor={c} />)}
    </radialGradient>
  );
  const out = { fill: c0, defs: null as ReactNode, overlay: null as ReactNode, under: null as ReactNode, top: null as ReactNode, face: look.face };
  switch (look.kind) {
    case "solid":
      break;
    case "gradient":
      out.fill = `url(#${id})`;
      out.defs = (
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {look.colors.map((c, i) => <stop key={i} offset={i / Math.max(1, look.colors.length - 1)} stopColor={c} />)}
        </linearGradient>
      );
      break;
    case "radial":
      out.fill = `url(#${id})`;
      out.defs = radial(look.colors);
      break;
    case "split":
      out.fill = `url(#${id})`;
      out.defs = (
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.5" stopColor={c0} />
          <stop offset="0.5" stopColor={c1} />
        </linearGradient>
      );
      break;
    case "dots":
      out.fill = `url(#${id})`;
      out.defs = (
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill={c0} />
          <circle cx="7" cy="7" r="2.6" fill={c1} />
        </pattern>
      );
      break;
    case "speckle":
      out.fill = `url(#${id})`;
      out.defs = (
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill={c0} />
          <circle cx="4" cy="5" r="1.4" fill={c1} />
          <circle cx="14" cy="9" r="1" fill={c1} />
          <circle cx="9" cy="16" r="1.6" fill={c1} />
        </pattern>
      );
      break;
    case "facet":
      out.fill = `url(#${id})`;
      out.defs = radial([c0, c1, c2]);
      out.overlay = (
        <g opacity="0.55">
          <path d="M50 24 L70 44 L50 58 L30 44 Z" fill={c0} opacity="0.7" />
          <path d="M30 44 L50 58 L36 84 L18 62 Z" fill={c2} opacity="0.45" />
          <path d="M70 44 L84 62 L66 84 L50 58 Z" fill={c1} opacity="0.6" />
          <path d="M36 84 L50 58 L66 84 L50 94 Z" fill={c2} opacity="0.35" />
        </g>
      );
      break;
    case "stars":
      out.fill = `url(#${id})`;
      out.defs = radial([c0, c1, c2]);
      out.overlay = (
        <g fill="#fff">
          {[[30, 40, 1.2], [68, 34, 1.6], [76, 70, 1.1], [26, 72, 1.4], [56, 86, 1], [40, 30, 0.9], [82, 52, 0.9]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity="0.85" />
          ))}
          <path d="M64 78 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" opacity="0.9" />
        </g>
      );
      break;
    case "glow":
      out.fill = `url(#${id})`;
      out.defs = radial([c0, c1, c2]);
      out.under = <circle cx="50" cy="58" r="42" fill={c1} opacity="0.22" />;
      break;
    case "xmas-snow":
      out.overlay = (
        <g fill={c1}>
          {[[28, 46, 2], [72, 40, 1.6], [64, 86, 2.2], [30, 80, 1.5], [80, 66, 1.8], [44, 92, 1.3]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} opacity="0.9" />)}
        </g>
      );
      out.top = (
        <g>
          <path d="M22 44 Q50 18 78 44 Q70 36 62 40 Q56 32 50 38 Q42 31 36 39 Q28 36 22 44 Z" fill={c1} />
          <circle cx="76" cy="44" r="4" fill={c2} />
          <circle cx="70" cy="46" r="3" fill="#1f6f4a" />
        </g>
      );
      break;
    case "xmas-ginger":
      out.overlay = (
        <g>
          <circle cx="50" cy="58" r="29" fill="none" stroke={c1} strokeWidth="2.5" strokeDasharray="5 4" strokeLinecap="round" />
          <circle cx="50" cy="84" r="2.6" fill={c2} />
          <circle cx="50" cy="92" r="2.2" fill={c2} opacity="0" />
        </g>
      );
      break;
    case "halloween-pumpkin":
      out.fill = `url(#${id})`;
      out.defs = radial(["#ffb15c", c0, "#c2410c"]);
      out.overlay = (
        <g fill="none" stroke="#b4410c" strokeWidth="2" opacity="0.55">
          <path d="M50 24 Q38 58 50 92" />
          <path d="M50 24 Q62 58 50 92" />
          <path d="M34 28 Q18 58 34 88" />
          <path d="M66 28 Q82 58 66 88" />
        </g>
      );
      out.top = <path d="M48 24 Q46 16 52 12 Q54 18 54 24 Z" fill="#4d7c0f" />;
      break;
    case "halloween-ghost":
      out.overlay = <ellipse cx="50" cy="84" rx="26" ry="8" fill={c1} opacity="0.08" />;
      out.under = (
        <g fill={c0}>
          <circle cx="30" cy="88" r="7" />
          <circle cx="44" cy="92" r="7" />
          <circle cx="58" cy="92" r="7" />
          <circle cx="72" cy="88" r="7" />
        </g>
      );
      break;
    case "diwali-diya":
      out.fill = `url(#${id})`;
      out.defs = radial([c1, c0, "#c2410c"]);
      out.overlay = (
        <g>
          <path d="M34 86 Q50 98 66 86 Q60 80 50 81 Q40 80 34 86 Z" fill={c2} />
          <path d="M50 80 Q46 74 50 68 Q54 74 50 80 Z" fill={c1} />
          {[[28, 44], [72, 44], [24, 62], [76, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill={c1} />)}
        </g>
      );
      break;
    case "diwali-rangoli":
      out.fill = `url(#${id})`;
      out.defs = radial(["#fff7ed", c0]);
      out.overlay = (
        <g>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <ellipse key={i} cx={50 + Math.cos(a) * 28} cy={58 + Math.sin(a) * 28} rx="4.5" ry="2.6" transform={`rotate(${(a * 180) / Math.PI} ${50 + Math.cos(a) * 28} ${58 + Math.sin(a) * 28})`} fill={[c1, c2, c3][i % 3]} />;
          })}
        </g>
      );
      break;
    case "easter-egg":
      out.overlay = (
        <g>
          {[[30, 44, 5, c1], [70, 40, 4, c2], [26, 70, 4.5, c3], [74, 72, 5, c1], [48, 90, 4, c2], [62, 30, 3, c3]].map(([x, y, r, c], i) => (
            <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string} />
          ))}
        </g>
      );
      break;
    case "easter-bunny":
      out.top = (
        <g>
          <ellipse cx="38" cy="22" rx="7" ry="18" fill={c0} transform="rotate(-12 38 22)" />
          <ellipse cx="62" cy="22" rx="7" ry="18" fill={c0} transform="rotate(12 62 22)" />
          <ellipse cx="38" cy="23" rx="3.5" ry="12" fill="#f9a8d4" transform="rotate(-12 38 23)" />
          <ellipse cx="62" cy="23" rx="3.5" ry="12" fill="#f9a8d4" transform="rotate(12 62 23)" />
        </g>
      );
      out.overlay = <ellipse cx="50" cy="74" rx="12" ry="7" fill={c1} opacity="0.7" />;
      break;
  }
  return out;
}

function Hat({ id }: { id?: string }) {
  switch (id) {
    case "hat-beanie":
      return (
        <g>
          <path d="M22 40 Q50 6 78 40 Z" fill="#3f51b5" />
          <rect x="20" y="36" width="60" height="10" rx="5" fill="#283593" />
          <circle cx="50" cy="12" r="6" fill="#ffca28" />
        </g>
      );
    case "hat-cap":
      return (
        <g>
          <path d="M50 8 L90 22 L50 36 L10 22 Z" fill="#111" />
          <rect x="34" y="26" width="32" height="12" rx="3" fill="#222" />
          <path d="M84 22 L84 40" stroke="#f2c230" strokeWidth="2.5" />
          <circle cx="84" cy="42" r="3" fill="#f2c230" />
        </g>
      );
    case "hat-party":
      return (
        <g>
          <path d="M50 0 L66 36 L34 36 Z" fill="#ff5f6d" />
          <path d="M42 18 L58 18 M38 27 L62 27" stroke="#fff" strokeWidth="3" />
          <circle cx="50" cy="2" r="4" fill="#ffd54f" />
        </g>
      );
    case "hat-wizard":
      return (
        <g>
          <path d="M50 -4 L72 36 L28 36 Z" fill="#4527a0" />
          <ellipse cx="50" cy="36" rx="30" ry="6" fill="#311b92" />
          <path d="M48 14 l2 -5 l2 5 l5 1 l-4 3 l1 5 l-4 -3 l-4 3 l1 -5 l-4 -3 Z" fill="#ffd54f" />
        </g>
      );
    case "hat-headphones":
      return (
        <g fill="none">
          <path d="M18 52 Q18 14 50 14 Q82 14 82 52" stroke="#222" strokeWidth="6" />
          <rect x="8" y="44" width="14" height="22" rx="6" fill="#222" />
          <rect x="78" y="44" width="14" height="22" rx="6" fill="#222" />
          <rect x="10" y="48" width="10" height="14" rx="4" fill="#e1342f" />
          <rect x="80" y="48" width="10" height="14" rx="4" fill="#e1342f" />
        </g>
      );
    case "hat-crown":
      return (
        <g>
          <path d="M24 38 L28 12 L40 26 L50 6 L60 26 L72 12 L76 38 Z" fill="#f2c230" stroke="#b8860b" strokeWidth="2" />
          <circle cx="50" cy="24" r="3.5" fill="#e1342f" />
          <circle cx="34" cy="30" r="2.5" fill="#2f7de1" />
          <circle cx="66" cy="30" r="2.5" fill="#2f7de1" />
        </g>
      );
    case "hat-jewel-crown":
      return (
        <g>
          <path d="M22 40 L26 12 L38 26 L50 4 L62 26 L74 12 L78 40 Z" fill="#f2c230" stroke="#8a6400" strokeWidth="2" />
          <path d="M50 14 l5 7 -5 7 -5 -7 Z" fill="#e11d48" />
          <path d="M33 28 l3.5 5 -3.5 5 -3.5 -5 Z" fill="#22d3ee" />
          <path d="M67 28 l3.5 5 -3.5 5 -3.5 -5 Z" fill="#22d3ee" />
          <rect x="22" y="36" width="56" height="5" rx="2" fill="#fff3b0" opacity="0.9" />
        </g>
      );
    default:
      return null;
  }
}

function Eyes({ id, face }: { id?: string; face: string }) {
  const pupils = (
    <g fill={face}>
      <circle cx="38" cy="55" r="5" />
      <circle cx="62" cy="55" r="5" />
      <circle cx="39.5" cy="53.5" r="1.6" fill="#fff" />
      <circle cx="63.5" cy="53.5" r="1.6" fill="#fff" />
    </g>
  );
  switch (id) {
    case "eyes-round":
      return (
        <g>
          {pupils}
          <g fill="none" stroke="#111" strokeWidth="2.5">
            <circle cx="38" cy="55" r="10" />
            <circle cx="62" cy="55" r="10" />
            <path d="M48 55 L52 55" />
          </g>
        </g>
      );
    case "eyes-shades":
      return (
        <g fill="#111">
          <path d="M24 48 H48 V56 Q48 66 37 66 Q26 66 25 56 Z" />
          <path d="M52 48 H76 V56 Q75 66 63 66 Q52 66 52 56 Z" />
          <rect x="46" y="49" width="8" height="3" />
          <path d="M28 51 L36 51" stroke="#fff" strokeWidth="2" opacity="0.5" />
        </g>
      );
    case "eyes-monocle":
      return (
        <g>
          {pupils}
          <circle cx="62" cy="55" r="11" fill="none" stroke="#b8860b" strokeWidth="2.5" />
          <path d="M72 60 Q78 72 74 84" fill="none" stroke="#b8860b" strokeWidth="1.5" />
        </g>
      );
    case "eyes-star":
      return (
        <g>
          {[38, 62].map((cx) => (
            <path
              key={cx}
              transform={`translate(${cx} 55)`}
              d="M0 -12 L3.5 -4 L12 -3.5 L5.5 2.5 L7.5 11 L0 6.5 L-7.5 11 L-5.5 2.5 L-12 -3.5 L-3.5 -4 Z"
              fill="#ff5fb0"
              stroke="#fff"
              strokeWidth="1.5"
            />
          ))}
          <rect x="47" y="52" width="6" height="2.5" fill="#fff" />
        </g>
      );
    case "eyes-diamond-shades":
      return (
        <g>
          <path d="M24 49 L36 45 L48 49 L44 63 L28 63 Z" fill="#a5f3fc" stroke="#e0f2fe" strokeWidth="1.5" />
          <path d="M52 49 L64 45 L76 49 L72 63 L56 63 Z" fill="#a5f3fc" stroke="#e0f2fe" strokeWidth="1.5" />
          <path d="M30 50 L36 47 L42 50" stroke="#fff" strokeWidth="1.5" fill="none" />
          <rect x="47" y="50" width="6" height="2.5" fill="#e0f2fe" />
        </g>
      );
    case "eyes-prism-shades":
      return (
        <g>
          <defs>
            <linearGradient id="av-prism" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#f472b6" /><stop offset="0.5" stopColor="#facc15" /><stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <rect x="24" y="48" width="24" height="14" rx="5" fill="url(#av-prism)" opacity="0.9" />
          <rect x="52" y="48" width="24" height="14" rx="5" fill="url(#av-prism)" opacity="0.9" />
          <rect x="47" y="51" width="6" height="2.5" fill="#111" />
        </g>
      );
    default:
      return pupils;
  }
}

function Neck({ id }: { id?: string }) {
  switch (id) {
    case "neck-bowtie":
      return (
        <g>
          <path d="M50 84 L36 76 L36 92 Z M50 84 L64 76 L64 92 Z" fill="#e1342f" />
          <circle cx="50" cy="84" r="4" fill="#a8201c" />
        </g>
      );
    case "neck-scarf":
      return (
        <g>
          <path d="M22 76 Q50 92 78 76 L80 86 Q50 102 20 86 Z" fill="#26a69a" />
          <path d="M62 86 L68 104 L58 104 L56 90 Z" fill="#00897b" />
        </g>
      );
    case "neck-medal":
      return (
        <g>
          <path d="M40 74 L50 90 L60 74" fill="none" stroke="#2f7de1" strokeWidth="5" />
          <circle cx="50" cy="94" r="8" fill="#f2c230" stroke="#b8860b" strokeWidth="2" />
          <text x="50" y="97.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#7a5600">1</text>
        </g>
      );
    case "neck-gold-chain":
      return (
        <g>
          <path d="M30 76 Q50 98 70 76" fill="none" stroke="#f2c230" strokeWidth="4" strokeDasharray="4 2.5" strokeLinecap="round" />
          <circle cx="50" cy="90" r="4" fill="#f2c230" stroke="#8a6400" strokeWidth="1.5" />
        </g>
      );
    case "neck-diamond-pendant":
      return (
        <g>
          <path d="M34 76 Q50 92 66 76" fill="none" stroke="#e5e7eb" strokeWidth="2" />
          <path d="M50 86 l6 6 -6 9 -6 -9 Z" fill="#bae6fd" stroke="#fff" strokeWidth="1.5" />
        </g>
      );
    case "neck-champion-chain":
      return (
        <g>
          <path d="M28 76 Q50 100 72 76" fill="none" stroke="#f59e0b" strokeWidth="5" strokeDasharray="5 2" strokeLinecap="round" />
          <circle cx="50" cy="94" r="8" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
          <path d="M50 89 l1.6 3.4 3.7.4 -2.8 2.5 .8 3.7 -3.3 -1.9 -3.3 1.9 .8 -3.7 -2.8 -2.5 3.7 -.4 Z" fill="#78350f" />
        </g>
      );
    case "neck-cape":
      return <path d="M20 74 Q50 86 80 74 L92 104 Q50 96 8 104 Z" fill="#e1342f" opacity="0.95" />;
    default:
      return null;
  }
}

export function Avatar({ equipped, size = 40, className = "", title }: { equipped?: Equipped | null; size?: number; className?: string; title?: string }) {
  const item = itemById(equipped?.skin) ?? itemById("skin-classic")!;
  const p = paint(item.id, item.look ?? { kind: "solid", colors: ["#e1342f"] });
  const face = p.face ?? "#ffffff";
  const cape = equipped?.neck === "neck-cape";
  return (
    <svg
      viewBox="0 -6 100 112"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        {p.defs}
        <clipPath id="av-body-clip">
          <circle cx="50" cy="58" r="34" />
        </clipPath>
      </defs>
      {cape && <Neck id="neck-cape" />}
      {p.under}
      <circle cx="50" cy="58" r="34" fill={p.fill} />
      <g clipPath="url(#av-body-clip)">{p.overlay}</g>
      <ellipse cx="40" cy="40" rx="10" ry="6" fill="#fff" opacity="0.18" />
      {p.top}
      <Eyes id={equipped?.eyes} face={face} />
      <path d="M41 70 Q50 77 59 70" fill="none" stroke={face} strokeWidth="3" strokeLinecap="round" />
      {!cape && <Neck id={equipped?.neck} />}
      <Hat id={equipped?.hat} />
    </svg>
  );
}
