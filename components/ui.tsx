import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "brand" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-85",
  brand: "bg-brand text-brand-foreground hover:brightness-95",
  secondary: "bg-secondary text-secondary-foreground hover:bg-surface-selected",
  ghost: "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
};

export function buttonClass({ variant = "primary", size = "default" }: { variant?: Variant; size?: "sm" | "default" | "lg" } = {}) {
  const sizing =
    size === "lg" ? "h-12 px-6 text-body-lg font-semibold" : size === "sm" ? "h-8 px-3 text-label font-medium" : "h-10 px-4 text-body font-medium";
  return `inline-flex items-center justify-center gap-2 rounded-full transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 ${sizing} ${variants[variant]}`;
}

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "default" | "lg" }) {
  return <button {...props} className={`${buttonClass({ variant, size })} ${className}`} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`surface p-5 sm:p-7 ${className}`}>{children}</div>;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`panel p-5 sm:p-7 ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "success" }) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    brand: "bg-brand-soft text-brand",
    success: "bg-success-soft text-success",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium ${tones[tone]}`}>{children}</span>;
}

export function Spinner() {
  return <span aria-hidden className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}

/** Two-column section: label column on the left, content on the right (stacks on mobile). */
export function Section({ title, intro, children, aside }: { title: ReactNode; intro?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="grid gap-8 border-b border-surface-border py-10 last:border-0 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <div className="space-y-3">
        <h1 className="text-[32px] leading-[1.15] font-normal tracking-tight sm:text-[40px]">{title}</h1>
        {intro && <div className="text-body-lg text-muted-foreground">{intro}</div>}
        {aside}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-input bg-surface px-4 text-body-lg text-foreground placeholder:text-faint-foreground outline-none transition focus:border-foreground";
