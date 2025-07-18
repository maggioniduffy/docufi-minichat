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
        console.log("Fetched documents:", data.documents);
        setDocuments(data.documents || []);
      } catch (err) {
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [selectedId]);

  return (
    <div className="mb-4 bg-gray-200 p-4 rounded-lg shadow-md w-full">
      <label className="block font-semibold mb-2 text-black">
        Select a document:
      </label>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-gray-400">No documents found.</div>
      ) : (
        <select
          className="border border-2 border-gray-500 rounded px-3 py-2 w-full text-black"
          value={selectedId ?? ""}
          onChange={(e) => {
            const doc = documents.find((d) => d.id === e.target.value);
            if (doc) onSelect(doc);
          }}
        >
          <option value="" disabled>
            Choose a document
          </option>
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.filename}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
