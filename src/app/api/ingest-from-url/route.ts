// app/api/ingest-from-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parse as parseContentType } from "content-type";
import { extension as extFromMime } from "mime-types";

// pdf-parse is CJS; import like this in ESM/TS:
const pdfParse = require("pdf-parse");

export const runtime = "nodejs"; // IMPORTANT: pdf-parse needs Node (not Edge)
export const dynamic = "force-dynamic";

// --- Configs ---
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB cap (adjust for your needs)
const FETCH_TIMEOUT_MS = 25_000;

const BodySchema = z.object({
  url: z.string().url("Provide a valid URL (http/https)."),
});

function getFilenameFromHeaders(headers: Headers, url: URL): string {
  // Try Content-Disposition
  const cd = headers.get("content-disposition");
  if (cd) {
    // naive parse; good enough for most cases
    const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
    const name = decodeURIComponent(match?.[1] || match?.[2] || "").trim();
    if (name) return name;
  }
  // Fallback to URL path
  const pathname = url.pathname.split("/").filter(Boolean).pop() || "file";
  return pathname;
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // @ts-ignore
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { url } = BodySchema.parse(json);

    const target = new URL(url);
    if (!["http:", "https:"].includes(target.protocol)) {
      return NextResponse.json(
        { ok: false, error: "Only http/https URLs are allowed." },
        { status: 400 }
      );
    }

    // HEAD first to check size/content-type if available (best-effort)
    let contentLength = 0;
    let contentType = "";
    try {
      const headRes = await fetchWithTimeout(target, { method: "HEAD" });
      if (headRes.ok) {
        const len = headRes.headers.get("content-length");
        if (len) contentLength = Number(len);
        contentType = headRes.headers.get("content-type") || "";
        if (contentLength > MAX_BYTES) {
          return NextResponse.json(
            { ok: false, error: `File too large (${contentLength} bytes). Max ${MAX_BYTES}.` },
            { status: 413 }
          );
        }
      }
    } catch {
      // Some servers disallow HEAD—ignore and continue.
    }

    // GET the file
    const res = await fetchWithTimeout(target, { method: "GET" });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Failed to fetch: ${res.status} ${res.statusText}` },
        { status: 400 }
      );
    }

    // Size guard while streaming into a buffer
    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json({ ok: false, error: "No response body." }, { status: 400 });
    }

    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        received += value.byteLength;
        if (received > MAX_BYTES) {
          return NextResponse.json(
            { ok: false, error: `File exceeds ${MAX_BYTES} bytes.` },
            { status: 413 }
          );
        }
        chunks.push(value);
      }
    }

    const buffer = Buffer.concat(chunks);

    // Determine content-type (prefer GET if present)
    let type =
      res.headers.get("content-type") ||
      contentType ||
      "application/octet-stream";

    // Normalize (strip params like charset)
    try {
      const parsed = parseContentType(type);
      type = parsed.type;
    } catch {
      // ignore parse errors, keep as-is
    }

    // Filename + extension
    let filename = getFilenameFromHeaders(res.headers, target);
    if (!filename.includes(".")) {
      // add extension from MIME if we can
      const ext = extFromMime(type) || "";
      if (ext) filename = `${filename}.${ext}`;
    }

    // Extract text if we can (PDF, text/*, or HTML)
    let extractedText = "";
    if (type === "application/pdf") {
      try {
        const parsed = await pdfParse(buffer);
        extractedText = parsed.text || "";
      } catch (err) {
        // If parse fails, keep going—user can still store the file.
        extractedText = "";
      }
    } else if (type.startsWith("text/")) {
      extractedText = buffer.toString("utf8");
    } else if (type === "application/json") {
      extractedText = buffer.toString("utf8");
    } else if (type === "text/html") {
      extractedText = buffer.toString("utf8");
    }

    // Optional: Here’s where you would upload `buffer` to storage (S3, Vercel Blob, Supabase, etc.)
    // and/or send `extractedText` to your embeddings/vector DB pipeline.

    return NextResponse.json({
      ok: true,
      meta: {
        filename,
        contentType: type,
        bytes: buffer.byteLength,
        from: target.href,
      },
      // Return a short preview so the payload stays small
      textPreview: extractedText ? extractedText.slice(0, 2000) : "",
      // If you uploaded to storage, return a URL here:
      // fileUrl
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}
