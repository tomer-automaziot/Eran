"use client";

import { useState, useEffect, useCallback } from "react";

interface Document {
  id: string;
  file_name: string;
  uploaded_at: string;
  progress: number;
  status: string;
  continue_fill_url: string | null;
  generated_pdf_url: string | null;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        colors[status] || colors.pending
      }`}
    >
      {status}
    </span>
  );
}

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const barColor: Record<string, string> = {
    pending: "bg-gray-400",
    processing: "bg-blue-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            barColor[status] || barColor.pending
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 w-8">{progress}%</span>
    </div>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch {
      console.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 10000);
    return () => clearInterval(interval);
  }, [fetchDocuments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
        <button
          onClick={fetchDocuments}
          className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    File Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Upload Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Continue Fill Up
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Download PDF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {doc.file_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(doc.uploaded_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ProgressBar
                        progress={doc.progress}
                        status={doc.status}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {doc.continue_fill_url ? (
                        <a
                          href={doc.continue_fill_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Continue
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {doc.generated_pdf_url ? (
                        <a
                          href={doc.generated_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
