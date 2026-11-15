import { ImageResponse } from "next/og";
import { duelOutcome } from "./game";
import { read } from "./store";

export interface CardData {
  title: string;
  players: { name: string; score: number; correct: number; winner: boolean }[];
  status: "waiting" | "playing" | "finished";
  questions: number;
}

/** Duel facts for the card, or null when the duel can't be read. */
export async function cardData(id: string): Promise<CardData | null> {
  try {
    const db = await read();
    const duel = db.duels[id];
    const quiz = duel && db.quizzes[duel.quizId];
    if (!duel || !quiz) return null;
    const { status, winnerId } = duelOutcome(duel);
    return {
      title: quiz.title,
      status,
      questions: quiz.questions.length,
      players: duel.players.map((p) => ({ name: p.name, score: p.score, correct: p.answers.filter((a) => a.correct).length, winner: p.id === winnerId })),
    };
  } catch {
    return null;
  }
}

const INK = "#131211";
const PAPER = "#f3f1ee";
const RED = "#ff5a5f";
const BLUE = "#5b8cff";
const MUTED = "#a6a19a";

function headline(d: CardData | null) {
  if (!d) return "Can you beat me?";
  const [a, b] = d.players;
  if (d.status !== "finished" || !a || !b) return `${a?.name ?? "Someone"} challenged you`;
  const w = d.players.find((p) => p.winner);
  if (!w) return `${a.name} and ${b.name} tied`;
  const l = d.players.find((p) => !p.winner)!;
  return `${w.name} beat ${l.name}`;
}

/** The card image. `tall` is a 4:5 post for stories and chats; otherwise a 1.91:1 link preview. */
export function renderCard(d: CardData | null, tall: boolean) {
  const W = tall ? 1080 : 1200;
  const H = tall ? 1350 : 630;
  const big = tall ? 150 : 104;
  const players = d?.players.length ? d.players : [{ name: "You", score: 0, correct: 0, winner: false }];
  const done = d?.status === "finished";
  const ring = (i: number) => (i === 0 ? RED : BLUE);
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: INK, color: PAPER, padding: tall ? 80 : 56, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 46, background: RED }}>
              <div style={{ width: 20, height: 20, borderRadius: 20, border: `4px solid ${INK}` }} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>Quiz Duel</div>
          </div>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: MUTED }}>{done ? "FINAL SCORE" : "DUEL IN PROGRESS"}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: tall ? 90 : 40 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: MUTED }}>{(d?.title ?? "A study duel").toUpperCase().slice(0, 48)}</div>
          <div style={{ display: "flex", fontSize: tall ? 92 : 64, fontWeight: 800, letterSpacing: -3, lineHeight: 1, marginTop: 18 }}>{headline(d)}</div>
        </div>

        <div style={{ display: "flex", flexDirection: tall ? "column" : "row", gap: tall ? 28 : 32, marginTop: tall ? 80 : 36, flex: 1 }}>
          {players.slice(0, 2).map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1,
                padding: tall ? "36px 44px" : "24px 32px", borderRadius: 20,
                background: p.winner ? "#1f1d1b" : "#181716",
                border: `2px solid ${p.winner ? ring(i) : "#2a2826"}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: tall ? 44 : 34, fontWeight: 700 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 18, background: ring(i) }} />
                  {p.name.slice(0, 18)}
                </div>
                <div style={{ display: "flex", fontSize: tall ? 28 : 22, color: MUTED, marginTop: 8 }}>
                  {p.correct}/{d?.questions ?? 10} correct{p.winner ? " · winner" : ""}
                </div>
              </div>
              <div style={{ display: "flex", fontSize: big, fontWeight: 800, letterSpacing: -4, color: p.winner ? ring(i) : PAPER }}>{p.score}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: tall ? 60 : 28, fontSize: tall ? 30 : 24, color: MUTED }}>
          <div style={{ display: "flex" }}>Turn your notes into a quiz. Duel a friend.</div>
          <div style={{ display: "flex", color: RED, letterSpacing: 2 }}>{done ? "REMATCH?" : "YOUR TURN"}</div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
