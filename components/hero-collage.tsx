"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { RajAvatar } from "./raj-chat";

/**
 * Pinterest-style collage of rounded, overlapping tiles. Each tile shows a photo
 * from /public/hero/<n>.jpg when one exists (the server passes the list, so
 * missing files are never requested), and an illustrated preview otherwise.
 */
function Tile({ src, className, fallback }: { src?: string; className: string; fallback: ReactNode }) {
  const [photo, setPhoto] = useState<"loading" | "ok" | "none">(src ? "loading" : "none");
  const img = useRef<HTMLImageElement>(null);
  // The image can finish (or fail) before React hydrates and attaches onLoad/onError.
  useEffect(() => {
    const el = img.current;
    if (el?.complete) setPhoto(el.naturalWidth > 0 ? "ok" : "none");
  }, []);
  return (
    <div className={`absolute overflow-hidden rounded-[32px] ${className}`}>
      {photo !== "ok" && fallback}
      {src && photo !== "none" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={img}
          src={src}
          alt=""
          onLoad={() => setPhoto("ok")}
          onError={() => setPhoto("none")}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${photo === "ok" ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

export function HeroCollage({ photos = {} }: { photos?: Record<number, string> }) {
  return (
    // Laid out on a fixed 640×360 canvas (proportions taken from the reference), scaled down on small screens.
    <div aria-hidden className="relative mb-8 h-[202px] w-full sm:mb-10 sm:h-[360px]">
      <div className="absolute top-0 left-1/2 h-[360px] w-[640px] origin-top -translate-x-1/2 scale-[0.56] sm:scale-100">
        {/* Left, lower: flashcard */}
        <Tile
          src={photos[1]}
          className="top-[108px] left-0 h-[220px] w-[230px] bg-[#d9ef7b]"
          fallback={
            <div className="flex h-full flex-col justify-between p-6 pr-14 text-[#1d2a00]">
              <span className="text-caption font-semibold tracking-wide uppercase opacity-70">Flashcard</span>
              <span className="text-title-lg font-bold leading-tight">What does the Calvin cycle make?</span>
              <span className="text-label opacity-70">Tap to flip</span>
            </div>
          }
        />
        {/* Centre, top: quiz question */}
        <Tile
          src={photos[2]}
          className="top-0 left-[183px] z-10 h-[260px] w-[288px] bg-[#c8282d]"
          fallback={
            <div className="flex h-full flex-col gap-2 p-6 text-white">
              <span className="text-caption font-semibold tracking-wide uppercase opacity-90">Question 3 / 10</span>
              <span className="text-title-lg font-bold leading-tight">Where does photosynthesis happen?</span>
              <div className="mt-auto space-y-1.5">
                {["Mitochondria", "Chloroplasts", "Nucleus"].map((o, i) => (
                  <div key={o} className={`rounded-full px-3 py-1.5 text-label font-medium ${i === 1 ? "bg-white text-[#c8282d]" : "bg-black/15"}`}>
                    {o}
                  </div>
                ))}
              </div>
            </div>
          }
        />
        {/* Right, top: score */}
        <Tile
          src={photos[3]}
          className="top-0 left-[502px] h-[136px] w-[138px] bg-[#1f2937]"
          fallback={
            <div className="flex h-full flex-col justify-center p-4 text-white">
              <span className="text-caption opacity-60">You</span>
              <span className="text-[30px] leading-none font-extrabold tabular-nums">1,240</span>
              <span className="mt-1.5 text-caption opacity-60">Alex · 1,105</span>
            </div>
          }
        />
        {/* Right, lower: Raj */}
        <Tile
          src={photos[4]}
          className="top-[182px] left-[449px] z-20 h-[172px] w-[173px] bg-[#fbecc4]"
          fallback={
            <div className="flex h-full flex-col justify-between p-4 text-[#2d2205]">
              <RajAvatar />
              <span className="text-body leading-snug font-medium">
                <strong>Raj:</strong> Nice! Why do C4 plants split the steps up?
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
}
