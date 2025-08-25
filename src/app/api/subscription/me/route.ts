import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebaseAdmin";
export const dynamic = "force-dynamic"; export const runtime = "nodejs";

export async function GET() {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const snap = await adminDb.collection("subscriptions").doc(userId).get();
  const plan = (snap.exists ? snap.data()?.plan : "free") as "free" | "pro";
  const status = snap.exists ? snap.data()?.status ?? null : null;
  return Response.json({ plan, status });
}
