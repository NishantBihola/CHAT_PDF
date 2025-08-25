export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { pcIndex } from "@/lib/pinecone";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { userId, docId, question, topK = 6 } = (await req.json()) as { userId: string; docId: string; question: string; topK?: number };
    if (!userId || !docId || !question) return new Response("Missing fields", { status: 400 });

    const qemb = await openai.embeddings.create({ model: "text-embedding-3-small", input: question });
    const results = await pcIndex.query({ topK, vector: qemb.data[0].embedding, includeMetadata: true, filter: { docId, userId } });

    const contexts = (results.matches ?? []).map((m) => (m.metadata as any)?.chunk as string | undefined).filter(Boolean) as string[];

    const sys = "Answer ONLY from the provided document context. If unsure, say you don’t know.";
    const messages: any = [
      { role: "system", content: sys },
      { role: "user", content: `Question: ${question}\n\nContext:\n${contexts.join("\n---\n")}` },
    ];

    const completion = await openai.chat.completions.create({ model: "gpt-4o-mini", messages, temperature: 0.2 });
    const answer = completion.choices[0]?.message?.content ?? "No answer.";
    return Response.json({ answer, contextsCount: contexts.length });
  } catch (e: any) { return new Response(e.message || "Chat error", { status: 500 }); }
}
