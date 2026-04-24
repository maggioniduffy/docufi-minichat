"use client";

import React, { useEffect, useRef } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface Message {
  role: string;
  content: string;
}

interface Props {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  docId?: string;
  messages: Message[];
}

const ChatBox = ({ input, setInput, onSubmit, docId, messages }: Props) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-0.5">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/20 text-sm text-center">
              {docId ? "Ask anything about your document" : "Select a document to get started"}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
              >
                AI
              </div>
            )}

            <div
              className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                      color: "rgba(255,255,255,0.95)",
                      borderBottomRightRadius: "6px",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.88)",
                      borderBottomLeftRadius: "6px",
                    }
              }
            >
              {msg.role === "user" ? (
                <p>{msg.content}</p>
              ) : (
                <MarkdownPreview
                  source={msg.content}
                  style={{ background: "transparent", color: "rgba(255,255,255,0.88)" }}
                />
              )}
            </div>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors placeholder-white/25"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
          placeholder={docId ? "Ask about your document…" : "Select a document first"}
          disabled={!docId}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.55)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
        />
        <button
          type="submit"
          disabled={!docId || !input.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-25"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </>
  );
};

export default ChatBox;
