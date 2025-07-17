"use client";

import { useState } from "react";

export default function ChatBox() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setInput("");
    // TODO: Replace with backend call using docId
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content: "This is a placeholder response referencing facts from doc ",
          // (docId ?? "N/A"),
        },
      ]);
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col md:w-2/3 w-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.role === "user"
                ? "bg-blue-100 text-blue-900 self-end"
                : "bg-gray-100 text-gray-700 self-start"
            }`}
          >
            <b>{msg.role === "user" ? "You" : "Assistant"}:</b> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleChat} className="flex gap-2 text-black">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask about your uploaded document..."
          //disabled={!docId}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          //disabled={!docId || !input.trim()}
        >
          Send
        </button>
      </form>
      {/* {!docId && (
        <div className="text-sm text-gray-400 mt-2">
          Upload a document to start chatting.
        </div>
      )} */}
    </div>
  );
}
