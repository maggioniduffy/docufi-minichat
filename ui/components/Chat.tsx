"use client";

import { useState, FormEvent } from "react";
import UploadForm from "./UploadForm";
import DocumentSelector from "./SelectDocument";
import { Document } from "../app/models";
import ChatBox from "./ChatBox";
import Outline from "./Outline";

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [doc, setSelectedDoc] = useState<Document | null>();

  const handleChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setInput("");

    const res = await fetch("api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input, docId: doc?.id }),
    });

    if (!res.ok) {
      setMessages((msgs) => [...msgs, { role: "assistant", content: "Error processing your request." }]);
      return;
    }

    const { data } = await res.json();
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { role: "assistant", content: data.answer ?? "No answer found." }]);
    }, 500);
  };

  return (
    <div className="h-full flex overflow-hidden p-4 gap-4">
      {/* Chat panel */}
      <div
        className="flex-1 flex flex-col rounded-2xl overflow-hidden min-w-0"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2.5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className={`w-2 h-2 rounded-full shrink-0 ${doc?.id ? "bg-emerald-400" : "bg-white/15"}`} />
          <span className={`text-sm truncate ${doc?.id ? "text-white/75 font-medium" : "text-white/25"}`}>
            {doc?.id ? doc.filename : "No document selected"}
          </span>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-4 min-h-0">
          <ChatBox
            input={input}
            setInput={setInput}
            onSubmit={handleChat}
            docId={doc?.id}
            messages={messages}
          />
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto">
        <DocumentSelector onSelect={setSelectedDoc} selectedId={doc?.id ?? ""} />
        <Outline docId={doc?.id} />
        <UploadForm onUpload={setSelectedDoc} />
      </aside>
    </div>
  );
}
