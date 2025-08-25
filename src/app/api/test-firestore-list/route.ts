import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const snap = await adminDb.collection("documents").limit(5).get();
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return Response.json({ count: docs.length, docs });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "list error";
    return new Response(msg, { status: 500 });
  }
}
