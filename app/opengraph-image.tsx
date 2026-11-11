import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The preview card shown when the link is shared (WhatsApp, iMessage, Discord…). */
export default function OpengraphImage() {
  const card = (rot: number, bg: string, fg: string, q: string, a: string) => (
    <div style={{ display: "flex", flexDirection: "column", width: 300, padding: 26, borderRadius: 28, background: bg, color: fg, transform: `rotate(${rot}deg)`, boxShadow: "0 30px 60px -30px rgba(0,0,0,0.45)" }}>
      <div style={{ fontSize: 18, opacity: 0.7, letterSpacing: 2 }}>FLASHCARD</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 14, lineHeight: 1.15 }}>{q}</div>
      <div style={{ fontSize: 22, marginTop: 18, opacity: 0.85 }}>{a}</div>
    </div>
  );
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "linear-gradient(150deg, #fbf8f3, #f1e9dd)", padding: 70, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 64, background: "#e5383b" }}>
              <div style={{ width: 30, height: 30, borderRadius: 30, border: "5px solid rgba(255,255,255,0.9)" }} />
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#17131f" }}>{SITE.name}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.02, color: "#17131f", letterSpacing: -2 }}>Turn your notes into a quiz duel.</div>
            <div style={{ fontSize: 30, marginTop: 24, color: "#5c5566" }}>Flashcards, notes and a tutor called Raj. Then beat your friends.</div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {["10 questions", "Rematch", "Leaderboard"].map((t) => (
              <div key={t} style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: "#17131f", color: "#fff", fontSize: 24 }}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 0 }}>
          {card(-6, "#e5383b", "#fff", "What makes ATP?", "The mitochondria")}
          <div style={{ display: "flex", marginTop: -40, marginLeft: 80 }}>{card(5, "#17131f", "#fff", "Who wins?", "You, obviously.")}</div>
        </div>
      </div>
    ),
    size,
  );
}
