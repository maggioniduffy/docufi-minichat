"use client";

import { useEffect, useState } from "react";

type Document = {
  id: string;
  filename: string;
  uploaded_at: string;
};

export default function DocumentSelector({
  onSelect,
  selectedId,
}: {
  onSelect: (id: string) => void;
  selectedId?: string;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      try {
        const res = await fetch("/api/upload/documents");
        const data = await res.json();
        setDocuments(data.documents || []);
      } catch (err) {
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Select a document:</label>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-gray-400">No documents found.</div>
      ) : (
        <select
          className="border rounded px-3 py-2 w-full"
          value={selectedId ?? ""}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="" disabled>
            Choose a document
          </option>
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.filename} ({new Date(doc.uploaded_at).toLocaleString()})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
