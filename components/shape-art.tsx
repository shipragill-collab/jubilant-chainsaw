import type { Shape } from "@/lib/eleven-plus";

/** Draws one non-verbal reasoning shape. */
export function ShapeArt({ shape, size = 64, label }: { shape: Shape; size?: number; label?: string }) {
  const c = 50, r = 34 * (shape.size ?? 1);
  const fillId = `half-${shape.sides}-${shape.rotation}-${shape.dots}`;
  const fill = shape.fill === "solid" ? "currentColor" : shape.fill === "half" ? `url(#${fillId})` : "none";
  let body;
  if (shape.sides === 0) {
    body = <circle cx={c} cy={c} r={r} />;
  } else if (shape.sides === 1) {
    body = <path d={`M${c} ${c - r} L${c + 18} ${c - r + 22} L${c + 7} ${c - r + 22} L${c + 7} ${c + r} L${c - 7} ${c + r} L${c - 7} ${c - r + 22} L${c - 18} ${c - r + 22} Z`} />;
  } else {
    const pts = Array.from({ length: shape.sides }, (_, i) => {
      const a = (-90 + (360 / shape.sides) * i) * (Math.PI / 180);
      return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
    body = <polygon points={pts} />;
  }
  const dots = Array.from({ length: shape.dots }, (_, i) => {
    const a = ((360 / Math.max(1, shape.dots)) * i - 90) * (Math.PI / 180);
    const d = shape.dots === 1 ? 0 : 11;
    return <circle key={i} cx={c + d * Math.cos(a)} cy={c + d * Math.sin(a)} r={4} className="nv-dot" />;
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label ?? describe(shape)} className="nv-shape">
      <defs>
        <linearGradient id={fillId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <g transform={`rotate(${shape.rotation} ${c} ${c})`} fill={fill} stroke="currentColor" strokeWidth={4} strokeLinejoin="round">
        {body}
      </g>
      {dots}
    </svg>
  );
}

const NAMES: Record<number, string> = { 0: "circle", 1: "arrow", 3: "triangle", 4: "square", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon" };

export function describe(s: Shape) {
  const name = NAMES[s.sides] ?? `${s.sides}-sided shape`;
  const fill = s.fill === "solid" ? "filled" : s.fill === "half" ? "half filled" : "empty";
  return `${fill} ${name}${s.rotation % 360 ? `, turned ${((s.rotation % 360) + 360) % 360}°` : ""}${s.dots ? `, ${s.dots} dot${s.dots > 1 ? "s" : ""}` : ""}`;
}
