import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Gallery tile: a soft grey frame with a "screenshot" inset, and a caption
 * underneath (title, quiet meta text, optional red dot).
 */
export function PreviewCard({
  href,
  title,
  meta,
  dot,
  children,
  className = "",
}: {
  href: string;
  title: string;
  meta?: string;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`group block min-w-0 ${className}`}>
      <div className="rounded-md bg-panel p-6 transition group-hover:bg-surface-selected sm:p-10">
        <div className="aspect-[16/10] overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition group-hover:scale-[1.01]">
          {children}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 text-body-lg">
        <span className="truncate">{title}</span>
        {meta && <span className="shrink-0 text-muted-foreground">{meta}</span>}
        {dot && <span aria-label="New" className="ml-auto size-2.5 shrink-0 rounded-full bg-brand" />}
      </div>
    </Link>
  );
}

const PALETTES = [
  { bg: "#111111", fg: "#ffffff", accent: "#e1342f" },
  { bg: "#d9ef7b", fg: "#1d2a00", accent: "#1d2a00" },
  { bg: "#f6efe6", fg: "#2b1a0f", accent: "#e1342f" },
  { bg: "#1f2937", fg: "#f9fafb", accent: "#d9ef7b" },
  { bg: "#c9d8f0", fg: "#132a4d", accent: "#132a4d" },
  { bg: "#e1342f", fg: "#ffffff", accent: "#ffffff" },
];

export function paletteFor(key: string) {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

/** A miniature "page" for a study set, drawn instead of a screenshot. */
export function SetThumbnail({ title, kicker, lines, seed }: { title: string; kicker: string; lines: string[]; seed: string }) {
  const p = paletteFor(seed);
  return (
    <div className="flex h-full flex-col p-[6%]" style={{ background: p.bg, color: p.fg }}>
      <div className="flex items-center justify-between text-[10px] tracking-wide uppercase opacity-70 sm:text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: p.accent }} />
          {kicker}
        </span>
        <span>Quiz Duel</span>
      </div>
      <p className="display mt-auto line-clamp-3 text-[22px] sm:text-[30px]">{title}</p>
      <div className="mt-3 space-y-1">
        {lines.slice(0, 2).map((l, i) => (
          <p key={i} className="truncate text-[11px] opacity-70 sm:text-[12px]">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

/** A miniature flashcard (front side). */
export function FlashcardThumbnail({ front, index, seed }: { front: string; index: number; seed: string }) {
  const p = paletteFor(seed);
  return (
    <div className="grid h-full place-items-center p-[7%]" style={{ background: p.bg }}>
      <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-white p-[6%] text-[#111]">
        <span className="text-[10px] tracking-wide text-[#777] uppercase sm:text-[11px]">Flashcard {index + 1}</span>
        <p className="line-clamp-3 text-[15px] leading-snug font-bold tracking-tight sm:text-[18px]">{front}</p>
        <span className="text-[10px] text-[#999] sm:text-[11px]">Tap to flip</span>
      </div>
    </div>
  );
}
