export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!, // server-side only
  { auth: { persistSession: false } }
);

const BUCKET = process.env.SUPABASE_BUCKET!;

function makePath(filename: string, userId?: string | null) {
  const safe = filename.replace(/\s+/g, "_");
  const ts = Date.now();
  const owner = userId ?? "anonymous";
  return `uploads/${owner}/${ts}-${safe}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const userId = (form.get("userId") as string) || null;

    if (!file) return new Response("No file", { status: 400 });
    if (file.type !== "application/pdf") return new Response("Only PDF allowed", { status: 415 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = makePath(file.name, userId);

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;

    // Public bucket: immediate public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return Response.json({
      path,
      url: publicUrl as string | null,
      name: file.name,
      sizeMB: (buffer.byteLength / (1024 * 1024)).toFixed(2),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Upload error";
    return new Response(msg, { status: 500 });
  }
}
