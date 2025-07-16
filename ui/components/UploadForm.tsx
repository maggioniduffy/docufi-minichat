"use client";

import { useState, useRef } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const res = await fetch("api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setDocId(data.docId);
    } catch (err) {
      alert("Upload error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {/* Dropzone */}
      <div
        className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
          isDragging
            ? "bg-blue-100 border-blue-500"
            : "bg-white border-gray-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile) handleFile(droppedFile);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-gray-700 font-semibold mb-1">
          Click or drop a file here
        </p>
        <p className="text-sm text-gray-500">PDF, DOCX, or TXT</p>
      </div>

      {/* Hidden input */}
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => handleFile(e.target.files?.[0])}
        ref={inputRef}
        className="hidden"
      />

      {/* File name */}
      {file && <div className="text-sm text-gray-600">📄 {file.name}</div>}

      {/* Upload button */}
      <button
        type="submit"
        disabled={!file || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {/* Output */}
      {docId && (
        <p className="text-green-600 font-mono break-all">
          ✅ Uploaded! Doc ID: {docId}
        </p>
      )}
    </form>
  );
}
