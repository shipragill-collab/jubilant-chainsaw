import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Gallery tile: one card (the drawn "screenshot"), with a quiet mono caption
 * underneath. When the card already shows the title, `hideTitle` keeps the
 * caption to the meta text so the title isn't repeated.
 */
export function PreviewCard({
  href,
  title,
  meta,
  dot,
  hideTitle = false,
  children,
  className = "",
}: {
  href: string;
  title: string;
  meta?: string;
  dot?: boolean;
  hideTitle?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} aria-label={`${title}${meta ? `, ${meta}` : ""}`} className={`preview-card group block min-w-0 ${className}`}>
      <div className="preview-card-art aspect-[16/10] overflow-hidden">{children}</div>
      <div className="mt-3 flex items-center gap-3 font-mono text-[12px] tracking-[0.08em] uppercase">
        {!hideTitle && <span className="truncate text-foreground">{title}</span>}
        {meta && <span className="shrink-0 truncate text-muted-foreground">{meta}</span>}
        {dot && <span aria-label="New" className="ml-auto size-2 shrink-0 rounded-full bg-brand" />}
      </div>
    </Link>
  );
}

/** One accent per set, from the same spectrum as the home page dial. */
const ACCENTS = ["#ff5a5f", "#ff8a3d", "#f2c14e", "#4fcf80", "#38c9dd", "#5b8cff", "#a78bfa"];

export function paletteFor(key: string) {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { accent: ACCENTS[h % ACCENTS.length] };
}

/** A miniature "page" for a study set, drawn instead of a screenshot. */
export function SetThumbnail({ title, kicker, lines, seed }: { title: string; kicker: string; lines: string[]; seed: string }) {
  const { accent } = paletteFor(seed);
  return (
    <div className="set-thumb flex h-full flex-col p-[6%]" style={{ ["--accent" as string]: accent }}>
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:text-[11px]">
        <span className="size-2 rounded-[2px]" style={{ background: accent }} />
        {kicker}
      </div>
      <p className="display mt-auto line-clamp-3 text-[24px] sm:text-[30px]">{title}</p>
      <div className="mt-3 space-y-1">
        {lines.slice(0, 2).map((l, i) => (
          <p key={i} className="truncate text-[12px] text-muted-foreground">
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
    <div className="set-thumb grid h-full place-items-center p-[7%]" style={{ ["--accent" as string]: p.accent }}>
      <div className="flex h-full w-full flex-col justify-between rounded-lg bg-surface p-[6%] shadow-[inset_0_0_0_1px_var(--surface-border)]">
        <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:text-[11px]">Flashcard {index + 1}</span>
        <p className="line-clamp-3 text-[15px] leading-snug font-bold tracking-tight sm:text-[18px]">{front}</p>
        <span className="font-mono text-[10px] text-muted-foreground uppercase sm:text-[11px]">Tap to flip</span>
      </div>
    </div>
  );
}
