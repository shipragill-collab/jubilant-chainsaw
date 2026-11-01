import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { body } from "@/lib/http";
import { read } from "@/lib/store";
import { claudeReply, offlineReply, rateLimited, sanitizeHistory } from "@/lib/tutor";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Chat with Raj. Streams the reply as plain text. */
export async function POST(req: Request) {
  const b = await body(req);
  const history = sanitizeHistory(b.messages);
  if (!history.length) return NextResponse.json({ error: "Say something to Raj first." }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Raj needs a short break. Try again in a few minutes." }, { status: 429 });
  }

  const setId = typeof b.setId === "string" ? b.setId : null;
  const set = setId ? ((await read()).studySets[setId] ?? null) : null;

  const useClaude =
    Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) && process.env.QUIZ_DUEL_OFFLINE !== "1";
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = false;
      try {
        if (useClaude) {
          for await (const chunk of claudeReply(history, set)) {
            sent = true;
            controller.enqueue(encoder.encode(chunk));
          }
        } else {
          controller.enqueue(encoder.encode(offlineReply(history, set)));
          sent = true;
        }
      } catch (err) {
        const msg =
          err instanceof Anthropic.RateLimitError
            ? "I'm getting a lot of questions right now. Give me a moment and ask again."
            : err instanceof Anthropic.APIError
              ? "I couldn't reach my brain just now. Here's what I can do offline:\n\n" + offlineReply(history, set)
              : "Something went wrong on my side. Please try again.";
        console.warn("[raj]", err);
        controller.enqueue(encoder.encode(sent ? `\n\n_${msg.split("\n")[0]}_` : msg));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-raj-mode": useClaude ? "claude" : "offline",
    },
  });
}
