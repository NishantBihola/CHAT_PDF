"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import UploadDropzone from "@/components/UploadDropzone";
import { FileText, Loader2, Trash2, CheckCircle2, Sparkles } from "lucide-react";

type Doc = {
  file?: File;
  name: string;
  sizeMB: string;
  uploaded?: boolean;
  url?: string | null;
  docId?: string;
  embedded?: boolean;
};

export default function DashboardPage() {
  const { user } = useUser();
  const userId = user?.id ?? null;

  const [docs, setDocs] = useState<Doc[]>([]);
  const [busyIdx, setBusyIdx] = useState<number | null>(null);

  const onFiles = (files: File[]) => {
    const next = files.map((f) => ({ file: f, name: f.name, sizeMB: (f.size / (1024 * 1024)).toFixed(2) + " MB" }));
    setDocs((prev) => [...prev, ...next]);
  };

  const removeDoc = (i: number) => setDocs((prev) => prev.filter((_, idx) => idx !== i));

  const uploadOne = async (i: number) => {
    const d = docs[i];
    if (!d.file) return;
    setBusyIdx(i);
    try {
      const fd = new FormData();
      fd.append("file", d.file);
      if (userId) fd.append("userId", userId);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data: { url: string | null; docId: string } = await res.json();
      setDocs((prev) => prev.map((x, idx) => (idx === i ? { ...x, uploaded: true, url: data.url, docId: data.docId } : x)));
    } catch (e: any) { alert(e.message || "Upload failed"); } finally { setBusyIdx(null); }
  };

  const ingestOne = async (i: number) => {
    const d = docs[i];
    if (!d.url || !d.docId || !userId) return alert("Upload first.");
    setBusyIdx(i);
    try {
      const res = await fetch("/api/ingest-from-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ docId: d.docId, userId, url: d.url }) });
      if (!res.ok) throw new Error(await res.text());
      setDocs((prev) => prev.map((x, idx) => (idx === i ? { ...x, embedded: true } : x)));
    } catch (e: any) { alert(e.message || "Ingest failed"); } finally { setBusyIdx(null); }
  };

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-gray-600">Upload PDFs, ingest to AI, and chat.</p>

      <section className="mt-6"><UploadDropzone onFiles={onFiles} /></section>

      {docs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Your Documents</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((d, i) => (
              <div key={`${d.name}-${i}`} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <div><p className="font-medium">{d.name}</p><p className="text-xs text-gray-500">{d.sizeMB}</p></div>
                  </div>
                  <button onClick={() => removeDoc(i)} className="rounded-md p-1 hover:bg-gray-100" title="Remove"><Trash2 className="h-4 w-4 text-gray-600" /></button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button className="rounded-md border px-3 py-1 text-sm" onClick={() => uploadOne(i)} disabled={!!d.uploaded || busyIdx === i}>
                    {busyIdx === i && !d.uploaded ? (<><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Uploading…</>) :
                     d.uploaded ? (<><CheckCircle2 className="mr-2 inline h-4 w-4" />Uploaded</>) : "Upload"}
                  </button>

                  <button className="rounded-md border px-3 py-1 text-sm" onClick={() => ingestOne(i)} disabled={!d.uploaded || !!d.embedded || busyIdx === i}>
                    {busyIdx === i && d.uploaded && !d.embedded ? (<><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Ingesting…</>) :
                     d.embedded ? (<><CheckCircle2 className="mr-2 inline h-4 w-4" />Ready</>) : (<><Sparkles className="mr-2 inline h-4 w-4" />Ingest</>)}
                  </button>

                  {d.docId && <a href={`/documents/${d.docId}`} className="text-sm text-indigo-600 underline">Open</a>}
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-sm text-gray-600 underline">View file</a>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
