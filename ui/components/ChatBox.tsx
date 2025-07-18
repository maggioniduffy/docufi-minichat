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
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
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
            <b>{msg.role === "user" ? "You" : "Assistant"}:</b>
            <MarkdownPreview
              source={msg.content}
              style={{ background: "whitesmoke", color: "black" }}
            />
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 text-black">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask about your uploaded document..."
          disabled={!docId}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!docId || !input.trim()}
        >
          Send
        </button>
      </form>
    </>
  );
};

export default ChatBox;
