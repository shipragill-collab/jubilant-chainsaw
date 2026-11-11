import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f3ee",
    theme_color: "#e5383b",
    categories: ["education", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "New study set", url: "/study" },
      { name: "Ask Raj", url: "/tutor" },
      { name: "Leaderboard", url: "/leaderboard" },
    ],
  };
}
