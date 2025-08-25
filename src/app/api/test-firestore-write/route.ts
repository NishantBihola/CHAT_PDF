import { adminDb } from "@/lib/firebaseAdmin";

export async function POST() {
  try {
    const ref = adminDb.collection("documents").doc();
    await ref.set({
      id: ref.id,
      name: "test.pdf",
      url: "https://example.com/test.pdf",
      userId: "debug-user",
      embedded: false,
      createdAt: Date.now(),
    });
    return Response.json({ ok: true, docId: ref.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "write error";
    return new Response(msg, { status: 500 });
  }
}
