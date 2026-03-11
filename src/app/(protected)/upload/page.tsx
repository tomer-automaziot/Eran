"use client";

import { useState, useRef } from "react";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const pdfFiles = Array.from(newFiles).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...pdfFiles]);
    setMessage(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({
          type: "success",
          text: `${data.documents.length} file(s) uploaded successfully`,
        });
        setFiles([]);
      } else {
        setMessage({ type: "error", text: "Upload failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Connection error" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload PDFs</h1>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-white"
        }`}
      >
        <p className="text-gray-600 text-lg">
          Drag & drop PDF files here, or click to browse
        </p>
        <p className="text-gray-400 text-sm mt-2">Only PDF files accepted</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-800">
              Selected Files ({files.length})
            </h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {files.map((file, i) => (
              <li
                key={i}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {uploading ? "Uploading..." : "Upload All"}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
