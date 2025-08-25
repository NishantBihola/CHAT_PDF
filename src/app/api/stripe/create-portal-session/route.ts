import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin";
import { stripe } from "@/lib/stripe";
export const dynamic = "force-dynamic"; export const runtime = "nodejs";

export async function POST() {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const origin = (await headers()).get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const subSnap = await adminDb.collection("subscriptions").doc(userId).get();
  const stripeCustomerId = subSnap.exists ? subSnap.data()?.stripeCustomerId : null;
  if (!stripeCustomerId) return new Response("No Stripe customer", { status: 400 });

  const ps = await stripe.billingPortal.sessions.create({ customer: stripeCustomerId, return_url: `${origin}/pricing` });
  return Response.json({ url: ps.url });
}
