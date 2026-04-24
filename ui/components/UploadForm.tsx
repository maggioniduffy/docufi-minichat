"use client";

import { Document } from "@/app/models";
import { useState, useRef, useEffect } from "react";

interface Props {
  onUpload: (doc: Document | null) => void;
}

export default function UploadForm({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existsMsg, setExistsMsg] = useState<string | null>(null);
  const [processingDocs, setProcessingDocs] = useState<{ [docId: string]: boolean }>({});
  const [readyDocs, setReadyDocs] = useState<{ [docId: string]: boolean }>({});
  const [docFilenames, setDocFilenames] = useState<{ [docId: string]: string }>({});

  const pollStatus = (docId: string) => {
    setProcessingDocs((prev) => ({ ...prev, [docId]: true }));
    setReadyDocs((prev) => ({ ...prev, [docId]: false }));
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/upload/status?docId=${docId}`);
        const data = await res.json();
        if (data.ready) {
          setProcessingDocs((prev) => ({ ...prev, [docId]: false }));
          setReadyDocs((prev) => ({ ...prev, [docId]: true }));
          clearInterval(interval);
          onUpload({ id: docId, filename: docFilenames[docId] || "Unknown" });
        }
      } catch {
        setProcessingDocs((prev) => ({ ...prev, [docId]: false }));
      }
    }, 10000);
  };

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 6000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!existsMsg) return;
    const t = setTimeout(() => setExistsMsg(null), 6000);
    return () => clearTimeout(t);
  }, [existsMsg]);

  const handleFile = (f: File | undefined) => { if (f) setFile(f); };

  const removeFile = () => {
    setFile(null);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const res = await fetch("api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { data } = await res.json();

      if (data.status === "existing") {
        setExistsMsg(`"${data.filename}" is already uploaded.`);
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        setLoading(false);
        return;
      }

      setDocFilenames((prev) => ({ ...prev, [data.docId]: data.filename }));
      pollStatus(data.docId);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    try {
      const res = await fetch("api/upload", { method: "DELETE" });
      if (!res.ok) throw new Error("Clear failed");
      setFile(null);
      setError(null);
      setProcessingDocs({});
      setReadyDocs({});
      setDocFilenames({});
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const processingEntries = Object.entries(processingDocs).filter(([, v]) => v);
  const readyEntries = Object.entries(readyDocs).filter(([, v]) => v);

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-white/50 text-[11px] font-medium uppercase tracking-wider">Upload Document</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div
          className="rounded-xl p-5 text-center cursor-pointer transition-all"
          style={{
            border: `1.5px dashed ${isDragging ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.1)"}`,
            background: isDragging ? "rgba(124,58,237,0.07)" : "rgba(255,255,255,0.02)",
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
          onClick={() => inputRef.current?.click()}
        >
          <svg className="mx-auto mb-2 opacity-35" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p className="text-white/45 text-xs">Click or drop a file</p>
          <p className="text-white/22 text-[11px] mt-0.5">PDF · DOCX · TXT</p>
        </div>

        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => handleFile(e.target.files?.[0])}
          ref={inputRef}
          className="hidden"
        />

        {file && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="text-white/60 text-xs flex-1 truncate">{file.name}</span>
            <button type="button" onClick={removeFile} className="text-white/25 hover:text-white/60 transition-colors text-xs leading-none">✕</button>
          </div>
        )}

        {error && <p className="text-rose-400 text-xs px-1">{error}</p>}
        {existsMsg && <p className="text-amber-400 text-xs px-1">{existsMsg}</p>}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-2.5 rounded-xl text-xs font-medium text-white transition-opacity disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
        >
          {loading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {processingEntries.map(([id]) => (
        <div
          key={id}
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="text-amber-300/80 text-xs truncate">Extracting · {docFilenames[id] || id}</span>
        </div>
      ))}

      {readyEntries.map(([id]) => (
        <div
          key={id}
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-emerald-300/80 text-xs truncate">Ready · {docFilenames[id] || id}</span>
        </div>
      ))}

      <button
        onClick={clear}
        className="text-[11px] text-white/20 hover:text-rose-400 transition-colors text-center py-0.5"
      >
        Clear all documents
      </button>
    </div>
  );
}
