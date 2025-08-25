import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic"; export const runtime = "nodejs";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth: { persistSession: false } });
const BUCKET = process.env.SUPABASE_BUCKET!;

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const docSnap = await adminDb.collection("documents").doc(params.id).get();
  if (!docSnap.exists) return new Response("Not found", { status: 404 });
  const doc = docSnap.data()!;
  if (doc.userId !== userId) return new Response("Forbidden", { status: 403 });

  const storagePath = doc.storagePath as string;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60);
  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ url: data.signedUrl });
}
