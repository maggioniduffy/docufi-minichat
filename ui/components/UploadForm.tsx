"use client";

import { Document } from "@/app/models";
import { useState, useRef, useEffect } from "react";

interface Props {
  onUpload: (doc: Document | null) => void;
}

export default function UploadForm({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [processingDocs, setProcessingDocs] = useState<{ [docId: string]: boolean }>({});
  const [readyDocs, setReadyDocs] = useState<{ [docId: string]: boolean }>({});
  const [docFilenames, setDocFilenames] = useState<{ [docId: string]: string }>({});

  const [existsMsg, setExistsMsg] = useState<string | null>(null);

const pollStatus = (docId: string) => {
  console.log("POLL");
  setProcessingDocs((prev) => ({ ...prev, [docId]: true }));
  setReadyDocs((prev) => ({ ...prev, [docId]: false }));

  const interval = setInterval(async () => {
    try {
      console.log("Polling status for docId:", docId);
      const res = await fetch(`/api/upload/status?docId=${docId}`);
      const data = await res.json();
      console.log("Polling response:", data);
      if (data.ready) {
        setProcessingDocs((prev) => ({ ...prev, [docId]: false }));
        setReadyDocs((prev) => ({ ...prev, [docId]: true }));
        clearInterval(interval); // <-- Add this line
        onUpload({ id: docId, filename: docFilenames[docId] || "Unknown" });
      }
    } catch (err) {
      console.error("Error polling status:", err);
      setProcessingDocs((prev) => ({ ...prev, [docId]: false }));
      setReadyDocs((prev) => ({ ...prev, [docId]: false }));
      // clearInterval(interval);
    }
  }, 10000);
};

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
  };

  const removeFile = () => {
    setFile(null);
    setDocId(null);
    setLoading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  setLoading(true);

  try {
    const res = await fetch("api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const {data} = await res.json();
    
    if (data.status === "existing") {
      setExistsMsg(`File "${data.filename}" already exists.`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setLoading(false);
      return;
    }

    console.log("Upload response:", data);
    console.log("Upload response:", JSON.stringify(data, null, 2));
    setDocId(data.docId);
    setFilename(data.filename);
    setDocFilenames((prev) => ({ ...prev, [data.docId]: data.filename })); // <-- add this
    console.log("Document uploaded:", data.docId, data.filename);
    pollStatus(data.docId);
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setError(null);
  } catch (err) {
    setError("Upload error: " + (err as Error).message);
  } finally {
    setLoading(false);
  }
};

  const clear = async () => {
    try {
      const res = await fetch("api/upload", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Clear failed");
      const data = await res.json();
      setDocId(null);
      setFile(null);
      setError(null);
      // Show success message after clear
      setTimeout(() => {
        setError("✅ Cleared all uploaded documents.");
      }, 100);
    } catch (err) {
      setError("Clear error: " + (err as Error).message);
      console.log(
        "Clear error: " +
          (err as Error).message +
          (err as Error).stack +
          (err as Error).name
      );
    }
  };
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md space-y-4 flex flex-col items-center">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-mdd">
        {/* Dropzone */}
        <div
          className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
            isDragging
              ? "bg-blue-100 border-blue-500"
              : "bg-white border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) handleFile(droppedFile);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <p className="text-gray-700 font-semibold mb-1">
            Click or drop a file here
          </p>
          <p className="text-sm text-gray-500">PDF, DOCX, or TXT</p>
        </div>

        {/* Hidden input */}
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => handleFile(e.target.files?.[0])}
          ref={inputRef}
          className="hidden"
        />

        <div className="flex justify-between items-center">
          {" "}
          {file && <div className="text-sm text-gray-600">📄 {file.name}</div>}
          {file && (
            <button
              type="button"
              onClick={removeFile}
              className="bg-red-600 hover:bg-red-700 font-semibold text-sm rounded-full px-2 py-1 text-white transition-colors"
            >
              {" "}
              X{" "}
            </button>
          )}
        </div>

        {error && (
          <div className="text-gray-600 font-semibold mt-2">{error}</div>
        )}

        {existsMsg && (
          <div className="text-yellow-700 font-semibold mt-2">{existsMsg}</div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {filename && (
          <p className="text-yellow-600 font-mono break-all">
            ✅ Uploaded! Filename: {filename} is in process
          </p>
        )}

        <div className="mt-4 w-full">
          {Object.keys(readyDocs).map((docId) =>
            readyDocs[docId] ? (
              <p key={docId} className="text-green-600 font-mono break-all">
                ✅ Document ready: {docFilenames[docId] || docId}
              </p>
            ) : null
          )}
        </div>
      </form>

      <button
        onClick={clear}
        className="text-black bg-red-400 hover:bg-red-500 font-semibold py-2 px-4 rounded-md transition-colors"
      >
        {" "}
        Clear entire table{" "}
      </button>
    </div>
  );
}
