import { NextResponse } from "next/server";
import { handleWebhook } from "@/lib/billing";

export async function POST(req: Request) {
  try {
    await handleWebhook(await req.text(), req.headers.get("stripe-signature"));
    return NextResponse.json({ received: true });
  } catch (err) {
    console.warn("[billing] webhook rejected", err);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
