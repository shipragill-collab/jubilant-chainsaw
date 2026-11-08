/** The gem, Quiz Duel's premium currency: a small cut sapphire-violet stone. */
export function Gem({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={`inline-block shrink-0 ${className}`} aria-hidden>
      <path d="M5 3 H15 L19 8 L10 18.5 L1 8 Z" fill="#7c5cff" stroke="#3f2a9e" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M1 8 H19 M5 3 L7.5 8 L10 18.5 L12.5 8 L15 3 M7.5 8 L10 3 L12.5 8" fill="none" stroke="#c4b5fd" strokeWidth="0.9" strokeLinejoin="round" opacity="0.9" />
      <path d="M6 4.2 L8 7" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function Gems({ amount, className = "" }: { amount: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 tabular-nums ${className}`}>
      <Gem />
      {amount.toLocaleString()}
    </span>
  );
}
