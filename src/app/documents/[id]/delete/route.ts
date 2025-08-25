import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic"; export const runtime = "nodejs";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth: { persistSession: false } });
const BUCKET = process.env.SUPABASE_BUCKET!;

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const subSnap = await adminDb.collection("subscriptions").doc(userId).get();
  const plan = (subSnap.exists ? subSnap.data()?.plan : "free") as "free" | "pro";
  if (plan !== "pro") return new Response("Pro plan required to delete documents.", { status: 403 });

  const docRef = adminDb.collection("documents").doc(params.id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return new Response("Not found", { status: 404 });
  const doc = docSnap.data()!;
  if (doc.userId !== userId) return new Response("Forbidden", { status: 403 });

  const storagePath = doc.storagePath as string | undefined;
  if (storagePath) {
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (error) return new Response(`Storage delete error: ${error.message}`, { status: 500 });
  }
  await docRef.delete();
  return new Response("ok");
}
