/** Custom rank badges for the leaderboard: rosettes for the podium, a quiet number for everyone else. */
const PODIUM = [
  { face: "#f2c230", edge: "#b8860b", ribbon: "#e1342f", text: "#6b4b00" }, // 1st
  { face: "#d5dbe3", edge: "#8a96a8", ribbon: "#2f7de1", text: "#3b4656" }, // 2nd
  { face: "#e3a26b", edge: "#9c5a26", ribbon: "#13a89e", text: "#5a2e0e" }, // 3rd
];

export function RankBadge({ rank }: { rank: number }) {
  const c = PODIUM[rank - 1];
  if (!c) {
    return (
      <span className="grid size-9 place-items-center rounded-full bg-muted text-body font-semibold text-muted-foreground tabular-nums">{rank}</span>
    );
  }
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 48 56" width={36} height={42} role="img" aria-label={`Rank ${rank}`} className="shrink-0">
      <path d="M15 30 L9 54 L17 49 L22 55 L24 32 Z" fill={c.ribbon} />
      <path d="M33 30 L39 54 L31 49 L26 55 L24 32 Z" fill={c.ribbon} opacity="0.85" />
      <g transform="translate(24 22)">
        {petals.map((a) => (
          <ellipse key={a} rx="5.5" ry="9" transform={`rotate(${a}) translate(0 -10)`} fill={c.edge} opacity="0.9" />
        ))}
        <circle r="14" fill={c.face} stroke={c.edge} strokeWidth="2" />
        <circle r="10.5" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="2 2" />
        <text y="5.5" textAnchor="middle" fontSize="15" fontWeight="800" fill={c.text} fontFamily="Inter, sans-serif">
          {rank}
        </text>
      </g>
    </svg>
  );
}
