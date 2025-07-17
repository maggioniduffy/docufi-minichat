"use client";

import { useState, useRef } from "react";
import DocumentSelector from "./SelectDocument";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setError(null); // Clear previous error
    console.log("Submitting file:", file);
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
      const data = await res.json();
      setDocId(data.docId);
    } catch (err) {
      setError("Upload error: " + (err as Error).message);
      console.log(
        "Upload error: " +
          (err as Error).message +
          (err as Error).stack +
          (err as Error).name
      );
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

        {/* Success message */}
        {docId && (
          <div className="text-green-600 font-semibold mt-2">
            ✅ Upload successful! Doc ID: {docId}
          </div>
        )}

        {error && (
          <div className="text-red-600 font-semibold mt-2">{error}</div>
        )}

        {/* Upload button */}
        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {/* Output */}
        {docId && (
          <p className="text-green-600 font-mono break-all">
            ✅ Uploaded! Doc ID: {docId}
          </p>
        )}
      </form>

      <button
        onClick={clear}
        className="text-black bg-gray-200 hover:bg-gray-300 font-semibold py-2 px-4 rounded-md transition-colors"
      >
        {" "}
        Clear{" "}
      </button>
      <DocumentSelector onSelect={() => {}} selectedId={"docId"} />
    </div>
  );
}
