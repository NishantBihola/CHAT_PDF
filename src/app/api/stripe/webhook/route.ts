import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebaseAdmin";
import type Stripe from "stripe";
export const dynamic = "force-dynamic"; export const runtime = "nodejs";

async function setPlanByCustomer(customerId: string, plan: "free" | "pro", status?: string | null, currentPeriodEnd?: number | null) {
  const q = await adminDb.collection("subscriptions").where("stripeCustomerId", "==", customerId).limit(1).get();
  if (q.empty) return;
  const doc = q.docs[0];
  await doc.ref.set({ plan, status: status ?? null, currentPeriodEnd: currentPeriodEnd ?? null }, { merge: true });
}

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });
  const raw = await req.text();

  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch (err: any) { return new Response(`Webhook Error: ${err.message}`, { status: 400 }); }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sess = event.data.object as Stripe.Checkout.Session;
        const cust = sess.customer as string;
        let periodEnd: number | null = null; let status: string | null = null;
        const subId = (sess.subscription as string) || "";
        if (subId) { const sub = await stripe.subscriptions.retrieve(subId); periodEnd = (sub.current_period_end ?? 0) * 1000; status = sub.status; }
        await setPlanByCustomer(cust, "pro", status, periodEnd);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const cust = sub.customer as string;
        const active = sub.status === "active" || sub.status === "trialing";
        const periodEnd = (sub.current_period_end ?? 0) * 1000;
        await setPlanByCustomer(cust, active ? "pro" : "free", sub.status, periodEnd);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const cust = sub.customer as string;
        await setPlanByCustomer(cust, "free", sub.status, null);
        break;
      }
      default: break;
    }
    return new Response("ok");
  } catch (e: any) { return new Response(`Webhook handler error: ${e.message}`, { status: 500 }); }
}
