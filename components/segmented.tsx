"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Tabs on a recessed track with a raised thumb that slides to the selected tab. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = track.current?.querySelector<HTMLButtonElement>(`[data-id="${value}"]`);
      if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => ro.disconnect();
  }, [value, options.length]);

  return (
    <div ref={track} className="segmented" role="tablist" aria-label={label}>
      {thumb && <span aria-hidden className="segmented-thumb" style={{ left: thumb.left, width: thumb.width }} />}
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          data-id={o.id}
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
