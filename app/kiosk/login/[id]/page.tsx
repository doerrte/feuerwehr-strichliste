"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function KioskLoginPage() {
  const { id } = useParams();
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/kiosk/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: id,
        password: pin,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Fehler");
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">

      <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-xl w-full max-w-md space-y-6">

        <h2 className="text-xl font-semibold text-center">
          PIN eingeben
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, ""))
            }
            placeholder="PIN"
            className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-center text-lg tracking-widest"
          />

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-red-600 text-white rounded-2xl"
          >
            Anmelden
          </button>

        </form>

      </div>
    </main>
  );
}