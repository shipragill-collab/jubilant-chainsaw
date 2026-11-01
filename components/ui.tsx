import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "brand" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  brand: "bg-brand text-brand-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground border border-surface-border hover:bg-surface-hover",
  ghost: "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "default" | "lg" }) {
  const sizing = size === "lg" ? "h-10 px-4 text-body" : "h-8 px-3 text-label";
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${sizing} ${variants[variant]} ${className}`}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`surface p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "success" }) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    brand: "bg-brand-soft text-brand",
    success: "bg-success-soft text-success",
  };
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-micro font-medium ${tones[tone]}`}>{children}</span>;
}

export function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export const inputClass =
  "w-full rounded-lg border border-input bg-surface px-3 text-body text-foreground placeholder:text-faint-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";
