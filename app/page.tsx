import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { HeroCollage } from "@/components/hero-collage";
import { HomeClient } from "./home-client";

export const dynamic = "force-dynamic";

const EXTS = ["jpg", "jpeg", "png", "webp"];

/** Photos dropped into public/hero/1.jpg … 4.jpg replace the illustrated collage tiles. */
function heroPhotos(): Record<number, string> {
  const dir = path.join(process.cwd(), "public", "hero");
  const out: Record<number, string> = {};
  for (let n = 1; n <= 4; n++) {
    for (const ext of EXTS) {
      const file = path.join(dir, `${n}.${ext}`);
      if (existsSync(file)) {
        // Cache-bust when the file changes.
        out[n] = `/hero/${n}.${ext}?v=${Math.floor(statSync(file).mtimeMs)}`;
        break;
      }
    }
  }
  return out;
}

export default function Home() {
  return <HomeClient collage={<HeroCollage photos={heroPhotos()} />} />;
}
