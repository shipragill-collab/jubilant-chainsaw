import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass } from "./ui";

/**
 * An empty state that shows what the feature looks like once it's in use:
 * a blurred, non-interactive preview with a clear call to action on top.
 */
export function PreviewEmpty({
  preview,
  eyebrow,
  title,
  body,
  href,
  cta,
}: {
  preview: ReactNode;
  eyebrow?: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="preview-empty">
      <div className="preview-empty-art" aria-hidden inert>
        {preview}
      </div>
      <div className="preview-empty-card">
        {eyebrow && <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">{eyebrow}</p>}
        <p className="font-display text-[24px] leading-tight font-extrabold tracking-[-0.02em]">{title}</p>
        <p className="text-body-lg text-muted-foreground">{body}</p>
        <Link href={href} className={`${buttonClass({ variant: "brand", size: "lg" })} mt-2`}>
          {cta}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
