/** The coin used for shop prices: a small gold disc with an embossed "Q". */
export function Coin({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={`inline-block shrink-0 ${className}`} aria-hidden>
      <circle cx="10" cy="10" r="9" fill="#f2c230" stroke="#b8860b" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="6" fill="none" stroke="#fff3b0" strokeWidth="1" opacity="0.8" />
      <text x="10" y="13.6" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#8a6400" fontFamily="Inter, sans-serif">
        Q
      </text>
    </svg>
  );
}

export function Coins({ amount, className = "" }: { amount: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 tabular-nums ${className}`}>
      <Coin />
      {amount.toLocaleString()}
    </span>
  );
}
