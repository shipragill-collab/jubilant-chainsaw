import Stripe from "stripe";
import { COIN_PACKS, GEM_PACKS, MIN_PRICE_PENCE, PLANS, itemById } from "./catalog";
import { BUNDLE, PASS } from "./pass";
import { GameError } from "./game";
import { giveItem, grantPass, grantPro, profileOf } from "./profile";
import { newId, read, update } from "./store";
import type { Db, Order } from "./types";

/**
 * Payments. With STRIPE_SECRET_KEY set, purchases go through Stripe Checkout
 * (Stripe's hosted page; this app never sees card details). Without it, the app
 * runs a clearly labelled demo checkout that grants purchases without charging.
 */

export const paymentsLive = () => Boolean(process.env.STRIPE_SECRET_KEY);

let stripeClient: Stripe | null = null;
const stripe = () => (stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY!));

export function appOrigin(req: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function describeOrder(o: Pick<Order, "kind" | "packId" | "itemId">) {
  if (o.kind === "pro") {
    return { name: "Quiz Duel Pro", detail: "Monthly subscription", pricePence: PLANS.pro.pricePence, coins: PLANS.pro.monthlyCoins, gems: 0, recurring: true };
  }
  if (o.kind === "bundle") {
    return { name: `Quiz Duel ${BUNDLE.name}`, detail: "Monthly subscription · Pro + Duel Pass", pricePence: BUNDLE.pricePence, coins: PLANS.pro.monthlyCoins, gems: 0, recurring: true };
  }
  if (o.kind === "pass") {
    return { name: PASS.name, detail: "Monthly subscription · 30 reward tiers", pricePence: PASS.pricePence, coins: 0, gems: 0, recurring: true };
  }
  if (o.kind === "item") {
    const item = itemById(o.itemId);
    if (!item?.pricePence) throw new GameError("That item isn't sold for money.", 404);
    return { name: item.name, detail: `${item.rarity[0].toUpperCase()}${item.rarity.slice(1)} ${item.slot === "theme" ? "app skin" : "skin"}`, pricePence: item.pricePence, coins: 0, gems: 0, recurring: false };
  }
  if (o.kind === "gems") {
    const pack = GEM_PACKS.find((p) => p.id === o.packId);
    if (!pack) throw new GameError("Unknown gem pack.", 404);
    return { name: `${pack.gems} gems`, detail: `${pack.label} pack`, pricePence: pack.pricePence, coins: 0, gems: pack.gems, recurring: false };
  }
  const pack = COIN_PACKS.find((p) => p.id === o.packId);
  if (!pack) throw new GameError("Unknown coin pack.", 404);
  return { name: `${pack.coins.toLocaleString()} coins`, detail: `${pack.label} pack`, pricePence: pack.pricePence, coins: pack.coins, gems: 0, recurring: false };
}

/** Start a purchase. Returns where to send the browser. */
export async function startCheckout(req: Request, playerId: string, kind: unknown, packId: unknown, itemId?: unknown): Promise<string> {
  if (kind !== "pro" && kind !== "coins" && kind !== "gems" && kind !== "pass" && kind !== "bundle" && kind !== "item") throw new GameError("Unknown purchase.");
  if (kind === "item") {
    const db = await read();
    if (db.profiles[playerId]?.owned.includes(String(itemId))) throw new GameError("You already own this.", 409);
  }
  const order: Order = {
    id: newId(16),
    playerId,
    kind,
    packId: kind === "coins" || kind === "gems" ? String(packId) : undefined,
    itemId: kind === "item" ? String(itemId) : undefined,
    createdAt: Date.now(),
    status: "pending",
  };
  const item = describeOrder(order);
  if (item.pricePence < MIN_PRICE_PENCE) throw new GameError("That price is below the minimum.", 400);
  await update((db) => {
    db.orders[order.id] = order;
  });

  if (!paymentsLive()) return `/checkout/demo?order=${order.id}`;

  const origin = appOrigin(req);
  const session = await stripe().checkout.sessions.create({
    mode: item.recurring ? "subscription" : "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: item.pricePence,
          product_data: { name: item.name, description: item.detail },
          ...(item.recurring ? { recurring: { interval: "month" as const } } : {}),
        },
      },
    ],
    metadata: { orderId: order.id },
    ...(item.recurring ? { subscription_data: { metadata: { orderId: order.id } } } : {}),
    success_url: `${origin}/api/billing/return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop?checkout=cancelled`,
  });
  if (!session.url) throw new GameError("Couldn't start checkout.", 502);
  return session.url;
}

/** Credit a paid order exactly once. */
export function fulfil(db: Db, orderId: string, stripeIds?: { customer?: string | null; subscription?: string | null }) {
  const order = db.orders[orderId];
  if (!order) throw new GameError("Order not found.", 404);
  if (order.status === "paid") return order;
  const p = profileOf(db, order.playerId);
  if (stripeIds?.customer) p.stripeCustomerId = stripeIds.customer;
  if (order.kind === "pro") {
    grantPro(p);
    if (stripeIds?.subscription) p.stripeSubscriptionId = stripeIds.subscription;
  } else if (order.kind === "bundle") {
    // One subscription keeps both going; renewals and cancellations match either id.
    grantPro(p);
    grantPass(p);
    if (stripeIds?.subscription) p.stripeSubscriptionId = p.stripePassSubscriptionId = stripeIds.subscription;
  } else if (order.kind === "pass") {
    grantPass(p);
    if (stripeIds?.subscription) p.stripePassSubscriptionId = stripeIds.subscription;
  } else if (order.kind === "item") {
    giveItem(p, order.itemId!);
  } else {
    const d = describeOrder(order);
    p.coins += d.coins;
    p.gems = (p.gems ?? 0) + d.gems;
  }
  order.status = "paid";
  p.credited.push(order.id);
  return order;
}

/** Demo mode only: complete an order without payment. */
export async function confirmDemo(orderId: string, playerId: string) {
  if (paymentsLive()) throw new GameError("Real payments are switched on; demo checkout is disabled.", 403);
  return update((db) => {
    const order = db.orders[orderId];
    if (!order || order.playerId !== playerId) throw new GameError("Order not found.", 404);
    return fulfil(db, orderId);
  });
}

/** Back from Stripe Checkout: verify the session with Stripe, then credit. */
export async function completeStripeSession(sessionId: string) {
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;
  if (!orderId) throw new GameError("Unknown checkout.", 404);
  const paid = session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
  if (!paid) throw new GameError("Payment wasn't completed.", 402);
  const id = (v: string | { id: string } | null) => (typeof v === "string" ? v : (v?.id ?? null));
  return update((db) => fulfil(db, orderId, { customer: id(session.customer), subscription: id(session.subscription) }));
}

/** Stripe webhook: monthly renewals extend Pro; cancellations let it lapse. */
export async function handleWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) throw new GameError("Webhook not configured.", 400);
  const event = stripe().webhooks.constructEvent(rawBody, signature, secret);

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null };
    if (invoice.billing_reason !== "subscription_cycle") return; // the first payment is handled at checkout
    const sub =
      (typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id) ??
      (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } }).parent?.subscription_details?.subscription;
    if (!sub) return;
    await update((db) => {
      for (const [id, p] of Object.entries(db.profiles)) {
        if (p.stripeSubscriptionId === sub) grantPro(profileOf(db, id));
        if (p.stripePassSubscriptionId === sub) grantPass(profileOf(db, id));
      }
    });
  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await update((db) => {
      // The subscription runs to the end of the paid period.
      for (const p of Object.values(db.profiles)) {
        if (p.stripeSubscriptionId === sub.id) delete p.stripeSubscriptionId;
        if (p.stripePassSubscriptionId === sub.id) delete p.stripePassSubscriptionId;
      }
    });
  }
}

/** Manage or cancel Pro. Stripe: the billing portal. Demo: cancel immediately. */
export async function manageSubscription(req: Request, playerId: string, which: "pro" | "pass" = "pro"): Promise<string> {
  if (!paymentsLive()) {
    await update((db) => {
      const p = profileOf(db, playerId);
      if (which === "pass") p.passUntil = null;
      else {
        p.plan = "free";
        p.proUntil = null;
      }
    });
    return `/pricing?cancelled=${which}`;
  }
  const db = await read();
  const customer = db.profiles[playerId]?.stripeCustomerId;
  if (!customer) throw new GameError("No subscription found.", 404);
  const portal = await stripe().billingPortal.sessions.create({ customer, return_url: `${appOrigin(req)}/pricing` });
  return portal.url;
}
