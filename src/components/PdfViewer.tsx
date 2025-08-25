"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.1);
  const [rotate, setRotate] = useState(0);
  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button className="rounded border px-3 py-1" onClick={() => setScale(s => s + 0.2)}>Zoom +</button>
        <button className="rounded border px-3 py-1" onClick={() => setScale(s => Math.max(0.4, s - 0.2))}>Zoom -</button>
        <button className="rounded border px-3 py-1" onClick={() => setRotate(r => (r + 90) % 360)}>Rotate</button>
      </div>
      <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        {Array.from({ length: numPages }, (_, i) => (
          <Page key={i} pageNumber={i + 1} scale={scale} rotate={rotate} className="mb-4 rounded border shadow" />
        ))}
      </Document>
    </div>
  );
}
