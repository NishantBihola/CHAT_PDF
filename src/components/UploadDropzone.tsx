"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const onDrop = useCallback((accepted: File[]) => onFiles(accepted), [onFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: true, accept: { "application/pdf": [".pdf"] },
  });

  return (
    <div {...getRootProps()} className="flex h-40 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed">
      <input {...getInputProps()} />
      {isDragActive ? <p>Drop the files here…</p> : <p>Drag ‘n’ drop PDFs here, or click to select</p>}
    </div>
  );
}
