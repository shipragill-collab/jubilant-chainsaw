import type { ReactNode } from "react";

/** A readable long-form page: narrow column, clear headings, plain English. */
export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro: string; children: ReactNode }) {
  return (
    <article className="legal mx-auto max-w-[68ch] py-12 sm:py-16">
      <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">Last updated {updated}</p>
      <h1 className="mt-3 text-[34px] leading-[1.1] tracking-tight sm:text-[44px]">{title}</h1>
      <p className="mt-4 text-body-lg text-muted-foreground">{intro}</p>
      <div className="mt-10 space-y-8">{children}</div>
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-title-lg font-extrabold tracking-[-0.01em]">{title}</h2>
      <div className="space-y-3 text-body-lg leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">{children}</div>
    </section>
  );
}
