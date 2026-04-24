"use client";

import { useEffect, useState } from "react";
import { Document } from "../app/models";

export default function DocumentSelector({
  onSelect,
  selectedId,
}: {
  onSelect: (doc: Document) => void;
  selectedId?: string;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      try {
        const res = await fetch("/api/upload");
        const { data } = await res.json();
        setDocuments(data.documents || []);
      } catch {
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [selectedId]);

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
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-[11px] font-medium uppercase tracking-wider">Documents</p>
        {!loading && documents.length > 0 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(124,58,237,0.2)", color: "rgba(196,181,253,0.8)" }}
          >
            {documents.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
          <span className="text-white/30 text-xs">Loading…</span>
        </div>
      ) : documents.length === 0 ? (
        <p className="text-white/25 text-xs">No documents uploaded yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {documents.map((doc) => {
            const active = selectedId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => onSelect(doc)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                style={{
                  background: active ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.06)"}`,
                  color: active ? "rgba(196,181,253,1)" : "rgba(255,255,255,0.55)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="truncate text-xs">{doc.filename}</span>
                {active && (
                  <svg className="ml-auto shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
