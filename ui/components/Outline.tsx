"use client";

import React, { useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface Props {
  docId?: string;
}

const Outline = ({ docId }: Props) => {
  const [outline, setOutline] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const generateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId || !topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, topic }),
      });
      if (!res.ok) { setOutline("Error generating outline."); return; }
      const { outline } = await res.json();
      setOutline(outline);
    } catch {
      setOutline("Error generating outline.");
    } finally {
      setLoading(false);
    }
  };

  if (!docId) {
    return (
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p className="text-white/50 text-[11px] font-medium uppercase tracking-wider mb-2">Outline</p>
        <p className="text-white/20 text-xs">Select a document to generate an outline.</p>
      </div>
    );
  }

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
      <p className="text-white/50 text-[11px] font-medium uppercase tracking-wider">Outline</p>

      {outline && (
        <div
          className="rounded-xl p-3 overflow-y-auto max-h-52"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <MarkdownPreview
            source={outline}
            style={{ background: "transparent", color: "rgba(255,255,255,0.8)" }}
          />
        </div>
      )}

      <form onSubmit={generateOutline} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Topic (e.g. Competitive Advantages)"
          className="rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-colors placeholder-white/25"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.55)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
        />
        <button
          type="submit"
          disabled={!topic.trim() || loading}
          className="py-2.5 rounded-xl text-xs font-medium text-white transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          style={{
            background: "rgba(124,58,237,0.25)",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          {loading ? (
            <>
              <div className="w-3 h-3 rounded-full border border-white/30 border-t-white/80 animate-spin" />
              Generating…
            </>
          ) : (
            "Generate Outline"
          )}
        </button>
      </form>
    </div>
  );
};

export default Outline;
