"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">Eran Portal</span>
          <div className="flex items-center gap-4">
            <Link
              href="/upload"
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                pathname === "/upload"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upload
            </Link>
            <Link
              href="/documents"
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                pathname === "/documents"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Documents
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
