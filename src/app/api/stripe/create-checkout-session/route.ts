import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin";
import { stripe } from "@/lib/stripe";
export const dynamic = "force-dynamic"; export const runtime = "nodejs";

export async function POST() {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const price = process.env.STRIPE_PRICE_PRO_MONTHLY!;
  const origin = (await headers()).get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const subRef = adminDb.collection("subscriptions").doc(userId);
  const subSnap = await subRef.get();
  let stripeCustomerId = subSnap.exists ? (subSnap.data()?.stripeCustomerId as string | undefined) : undefined;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ metadata: { userId } });
    stripeCustomerId = customer.id;
    await subRef.set({ userId, plan: "free", stripeCustomerId }, { merge: true });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/pricing?success=true`,
    cancel_url: `${origin}/pricing?canceled=true`,
    allow_promotion_codes: true,
  });

  return Response.json({ sessionId: session.id });
}
