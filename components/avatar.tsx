import type { Equipped } from "@/lib/catalog";

/**
 * Player avatar: a round character drawn in SVG, with a skin and up to three
 * accessories layered on top. Everything is vector, so it's crisp at any size.
 */

const SKINS: Record<string, { fill: string; defs?: React.ReactNode; face?: string }> = {
  "skin-classic": { fill: "#e1342f" },
  "skin-ocean": { fill: "#2f7de1" },
  "skin-lime": { fill: "#b6dc3c", face: "#1d2a00" },
  "skin-midnight": { fill: "#1f2937" },
  "skin-peach": { fill: "#f4a988", face: "#3b1d0e" },
  "skin-candy": {
    fill: "url(#av-candy)",
    defs: (
      <pattern id="av-candy" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <rect width="12" height="12" fill="#ff7eb6" />
        <rect width="6" height="12" fill="#ffd1e6" />
      </pattern>
    ),
    face: "#5a1235",
  },
  "skin-sunset": {
    fill: "url(#av-sunset)",
    defs: (
      <linearGradient id="av-sunset" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffb347" />
        <stop offset="0.55" stopColor="#ff5f6d" />
        <stop offset="1" stopColor="#8e44ad" />
      </linearGradient>
    ),
  },
  "skin-dots": {
    fill: "url(#av-dots)",
    defs: (
      <pattern id="av-dots" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#13a89e" />
        <circle cx="7" cy="7" r="2.6" fill="#c9f5ef" />
      </pattern>
    ),
  },
  "skin-galaxy": {
    fill: "url(#av-galaxy)",
    defs: (
      <radialGradient id="av-galaxy" cx="0.35" cy="0.3" r="0.9">
        <stop offset="0" stopColor="#8a5cff" />
        <stop offset="0.5" stopColor="#3b1f8f" />
        <stop offset="1" stopColor="#0b0b2a" />
      </radialGradient>
    ),
  },
  "skin-gold": {
    fill: "url(#av-gold)",
    defs: (
      <linearGradient id="av-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff1a8" />
        <stop offset="0.45" stopColor="#f2c230" />
        <stop offset="1" stopColor="#b8860b" />
      </linearGradient>
    ),
    face: "#4a3200",
  },
};

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
    case "neck-cape":
      return <path d="M20 74 Q50 86 80 74 L92 104 Q50 96 8 104 Z" fill="#e1342f" opacity="0.95" />;
    default:
      return null;
  }
}

export function Avatar({ equipped, size = 40, className = "", title }: { equipped?: Equipped | null; size?: number; className?: string; title?: string }) {
  const skin = SKINS[equipped?.skin ?? "skin-classic"] ?? SKINS["skin-classic"];
  const face = skin.face ?? "#ffffff";
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
      <defs>{skin.defs}</defs>
      {cape && <Neck id="neck-cape" />}
      <circle cx="50" cy="58" r="34" fill={skin.fill} />
      <ellipse cx="40" cy="40" rx="10" ry="6" fill="#fff" opacity="0.18" />
      <Eyes id={equipped?.eyes} face={face} />
      <path d="M41 70 Q50 77 59 70" fill="none" stroke={face} strokeWidth="3" strokeLinecap="round" />
      {!cape && <Neck id={equipped?.neck} />}
      <Hat id={equipped?.hat} />
    </svg>
  );
}
