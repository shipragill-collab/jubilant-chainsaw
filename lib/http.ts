import { NextResponse } from "next/server";
import { GameError } from "./game";
import { isStoreUnavailable } from "./store";

export function playerIdFrom(value: unknown): string {
  if (typeof value !== "string" || !/^[a-z0-9-]{8,64}$/i.test(value)) {
    throw new GameError("Missing player id.", 400);
  }
  return value;
}

export async function handle(fn: () => Promise<unknown>) {
  try {
    return NextResponse.json(await fn());
  } catch (err) {
    if (err instanceof GameError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (isStoreUnavailable(err)) {
      return NextResponse.json({ error: "This site's database isn't connected yet, so nothing can be saved. (Site owner: see DEPLOY.md, step 2.)" }, { status: 503 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function body(req: Request): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
