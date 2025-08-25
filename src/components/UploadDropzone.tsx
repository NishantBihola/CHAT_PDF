"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, AlertCircle } from "lucide-react";
import clsx from "clsx";

type Props = {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  maxSizeMB?: number; // default 25 MB
};

export default function UploadDropzone({
  onFiles,
  multiple = true,
  maxSizeMB = 25,
}: Props) {
  const [error, setError] = useState<string>("");

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      setError("");

      if (rejections?.length) {
        const msg = rejections
          .map((r) => `${r.file.name}: ${r.errors.map((e) => e.message).join(", ")}`)
          .join(" | ");
        setError(msg);
        return;
      }

      if (accepted.length) onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple,
    accept: { "application/pdf": [".pdf"] },
    maxSize: maxSizeMB * 1024 * 1024,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={clsx(
          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white p-8 text-center transition",
          isDragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300",
          isDragReject && "border-red-500 bg-red-50"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-8 w-8 text-indigo-600" />
        <p className="mt-3 font-medium">Drag & drop PDF files here</p>
        <p className="mt-1 text-sm text-gray-600">
          or <span className="font-medium text-indigo-600">click to browse</span> — up to {maxSizeMB}MB
        </p>
        <p className="mt-2 text-xs text-gray-500">Only .pdf files are accepted.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
