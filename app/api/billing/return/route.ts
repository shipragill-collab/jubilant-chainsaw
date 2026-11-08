import { NextResponse } from "next/server";
import { appOrigin, completeStripeSession } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const origin = appOrigin(req);
  const sessionId = new URL(req.url).searchParams.get("session_id");
  try {
    if (!sessionId) throw new Error("missing session");
    const order = await completeStripeSession(sessionId);
    return NextResponse.redirect(`${origin}${order.kind === "pass" ? "/pass" : "/shop"}?purchased=${order.kind}${order.itemId ? `&item=${order.itemId}` : ""}`);
  } catch (err) {
    console.warn("[billing] return failed", err);
    return NextResponse.redirect(`${origin}/shop?checkout=failed`);
  }
}
