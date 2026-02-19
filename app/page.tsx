"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">
          Feuerwehr Stadt Bedburg
        </h1>
        <h3>Einheit 5</h3>
        <p className="text-gray-500 mb-6">
          Deine digitale Strichliste
        </p>

        <button
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold"
          onClick={() => router.push("/login")}
        >
          Anmelden
        </button>
      </div>
    </main>
  );
}