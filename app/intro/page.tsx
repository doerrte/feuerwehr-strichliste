"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function IntroPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setRole(data.role);
    }
    loadUser();
  }, []);

  async function finishIntro() {
    await fetch("/api/users/mark-intro", {
      method: "POST",
    });

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white max-w-md w-full rounded-xl shadow p-6 space-y-6">

        <h1 className="text-xl font-bold">
          Willkommen 👋
        </h1>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold">
            Für Benutzer
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Getränk auswählen</li>
            <li>Anzahl mit + / – festlegen</li>
            <li>Buchung bestätigen</li>
            <li>QR-Code für Schnellbuchung nutzen</li>
          </ul>
        </section>

        {role === "ADMIN" && (
          <section className="space-y-2 text-sm">
            <h2 className="font-semibold">
              Für Admins
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Lager verwalten</li>
              <li>Mindestbestand setzen</li>
              <li>Strichliste korrigieren</li>
              <li>QR-Codes generieren</li>
              <li>Getränke zurücksetzen</li>
            </ul>
          </section>
        )}

        <button
          onClick={finishIntro}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Verstanden
        </button>

      </div>
    </main>
  );
}