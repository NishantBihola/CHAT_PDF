export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { adminDb } from "@/lib/firebaseAdmin";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth: { persistSession: false } });
const BUCKET = process.env.SUPABASE_BUCKET!;

function makePath(filename: string, userId?: string | null): string {
  const owner = (userId || "anonymous").replace(/[^a-zA-Z0-9-_]/g, "_");
  const base = filename.split("/").pop()!.split("\\").pop()!;
  const safeBase = base.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 128);
  const hasPdf = /\.pdf$/i.test(safeBase);
  const finalName = hasPdf ? safeBase : `${safeBase}.pdf`;
  const ts = Date.now();
  return `uploads/${owner}/${ts}-${finalName}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const userId = (form.get("userId") as string) || null;
    if (!file) return new Response("No file", { status: 400 });
    if (file.type !== "application/pdf") return new Response("Only PDF allowed", { status: 415 });

    // (Optional) Free plan cap (2 uploads) — requires subscriptions collection; can add later

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = makePath(file.name, userId);

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: file.type, upsert: false });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const docRef = adminDb.collection("documents").doc();
    await docRef.set({
      id: docRef.id,
      userId: userId ?? "anonymous",
      name: file.name,
      storagePath: path,
      url: publicUrl as string | null,
      createdAt: Date.now(),
      embedded: false,
      pages: null,
    });

    return Response.json({ docId: docRef.id, url: publicUrl as string | null });
  } catch (e: any) { return new Response(e.message || "Upload error", { status: 500 }); }
}
