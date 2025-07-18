"use client";

import { useEffect, useRef, useState } from "react";
import UploadForm from "./UploadForm";
import DocumentSelector from "./SelectDocument";
import { Document } from "../app/models";
import ChatBox from "./ChatBox";
import Outline from "./Outline";

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [doc, setSelectedDoc] = useState<Document | null>();


  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setInput("");

    const res = await fetch("api/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: input, docId: doc?.id }),
    });

    if (!res.ok) {
      console.error("Error in conversation request:", res.statusText);
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Error processing your request." },
      ]);
      return;
    }

    const { data } = await res.json();
    console.log("answer", data.answer);
    
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content: data.answer ?? "No answer found.",
          docId: doc?.id ?? "N/A",
        },
      ]);
    }, 500);
  };

  return (
    <div className="h-full flex w-full items-center justify-center p-4 space-x-10">
      <div className="bg-gray-200 rounded-lg p-6 flex flex-col md:w-2/3 w-full h-full rounded-lg shadow-lg border-2 border-gray-400">
        {doc?.id && (
          <>
            <h3 className="text-gray-700 font-semibold"> {doc?.filename}</h3>
            <hr className="my-2" />
          </>
        )}
        <ChatBox
          input={input}
          setInput={setInput}
          onSubmit={handleChat}
          docId={doc?.id}
          messages={messages}
        />
        {!doc?.id && (
          <div className="text-sm text-gray-400 mt-2">
            Upload a document to start chatting.
          </div>
        )}
      </div>
      <aside className="md:w-1/3 w-full flex flex-col space-y-4 h-full justify-between">
        <DocumentSelector
          onSelect={setSelectedDoc}
          selectedId={doc?.id ?? ""}
        />
        <Outline docId={doc?.id} />
        <UploadForm onUpload={setSelectedDoc} />
      </aside>
    </div>
  );
}
