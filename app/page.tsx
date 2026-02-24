"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();

          if (data?.id) {
            setAuthenticated(true);
            router.replace("/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }

      setLoading(false);
    }

    checkAuth();
  }, [router]);

  // Während Auth geprüft wird → nichts anzeigen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Lade App...
      </div>
    );
  }

  // Wenn eingeloggt → wird eh direkt weitergeleitet
  if (authenticated) return null;

  // Intro anzeigen wenn NICHT eingeloggt
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-8">

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">
          Feuerwehr Stadt Bedburg
        </h1>
        <p className="text-gray-500">
          Einheit 5 – Deine digitale Strichliste
        </p>
      </div>

      <Link
        href="/login"
        className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg active:scale-95 transition"
      >
        Anmelden
      </Link>

    </div>
  );
}