import { adminDb } from "@/lib/firebaseAdmin";
import PdfViewer from "@/components/PdfViewer";

async function getDocMeta(id: string) {
  const snap = await adminDb.collection("documents").doc(id).get();
  return snap.exists ? (snap.data() as { url: string; name: string; userId: string }) : null;
}

export default async function DocPage({ params }: { params: { id: string } }) {
  const meta = await getDocMeta(params.id);
  if (!meta) return <main className="p-6">Document not found.</main>;

  return (
    <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 md:grid-cols-3">
      <section className="md:col-span-2">
        <h1 className="mb-3 text-xl font-semibold">{meta.name}</h1>
        <PdfViewer fileUrl={meta.url} />
      </section>
      <section className="md:col-span-1">
        <ChatToPdf docId={params.id} ownerId={meta.userId} />
      </section>
    </main>
  );
}

"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

function ChatToPdf({ docId, ownerId }: { docId: string; ownerId: string }) {
  const { user } = useUser();
  const [q, setQ] = useState("");
  const [a, setA] = useState<string>("");

  const ask = async () => {
    if (!q.trim()) return;
    setA("…");
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user?.id ?? ownerId, docId, question: q }) });
    const data = await res.json();
    setA(data.answer ?? "No answer.");
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Ask this PDF</h3>
      <textarea className="mt-3 w-full rounded border p-2" placeholder="e.g. Summarize section 3" value={q} onChange={(e) => setQ(e.target.value)} />
      <button className="mt-3 w-full rounded bg-black px-3 py-2 text-white" onClick={ask}>Ask</button>
      {a && <div className="prose mt-4 whitespace-pre-wrap text-sm">{a}</div>}
    </div>
  );
}
