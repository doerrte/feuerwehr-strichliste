"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login fehlgeschlagen");
        setLoading(false);
        return;
      }

      window.location.href = data.redirect;
    } catch {
      setError("Serverfehler");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-red-600 via-red-500 to-red-700 dark:from-gray-950 dark:via-gray-900 dark:to-black">

      {/* Glass Card */}
      <div className="
        w-full max-w-md
        bg-white/90 dark:bg-gray-900/80
        backdrop-blur-2xl
        rounded-3xl
        shadow-2xl
        border border-white/30 dark:border-gray-800
        p-8 space-y-6
      ">

        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="text-4xl">🧯</div>
          <h1 className="text-2xl font-bold tracking-tight">
            Feuerwehr Bedburg
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Einheit 5 – Getränkeliste
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Telefonnummer
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="z.B. 0176..."
              className="
                w-full p-3 rounded-2xl
                bg-gray-100 dark:bg-gray-800
                focus:outline-none
                focus:ring-2 focus:ring-red-500
                transition
              "
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full p-3 rounded-2xl
                bg-gray-100 dark:bg-gray-800
                focus:outline-none
                focus:ring-2 focus:ring-red-500
                transition
              "
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-2xl
              bg-red-600 hover:bg-red-700
              text-white font-medium
              shadow-lg
              active:scale-[0.98]
              transition
            "
          >
            {loading ? "Bitte warten..." : "Einloggen"}
          </button>

        </form>

      </div>
    </main>
  );
}