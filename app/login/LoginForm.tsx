"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect =
    searchParams.get("redirect") || "/dashboard";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent
  ) {
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
        setError(
          data.error || "Login fehlgeschlagen"
        );
        setLoading(false);
        return;
      }

      router.replace(redirect);
    } catch {
      setError("Serverfehler");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-5 transition">

      <h1 className="text-xl font-semibold text-center">
        🔐 Login
      </h1>

      <form
        onSubmit={handleLogin}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium">
            Telefonnummer
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="border dark:border-gray-700 bg-white dark:bg-gray-800 p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Passwort
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="border dark:border-gray-700 bg-white dark:bg-gray-800 p-2 rounded w-full"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg transition active:scale-95"
        >
          {loading
            ? "Bitte warten..."
            : "Einloggen"}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center">
        Passwort vergessen?  
        Bitte an den Getränkewart wenden.
      </p>

    </div>
  );
}