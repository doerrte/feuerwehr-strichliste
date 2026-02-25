"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
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
    <main className="
      relative min-h-screen flex items-center justify-center px-6
      bg-black overflow-hidden
    ">

      {/* 🔥 Background Glow */}
      <div className="absolute inset-0">
        <div className="
          absolute -top-40 -left-40 w-[500px] h-[500px]
          bg-red-600 rounded-full blur-[160px] opacity-40
        " />
        <div className="
          absolute -bottom-40 -right-40 w-[500px] h-[500px]
          bg-red-800 rounded-full blur-[160px] opacity-40
        " />
      </div>

      {/* 🔐 Login Card */}
      <div className="
        relative z-10
        w-full max-w-md
        bg-white/10
        backdrop-blur-3xl
        border border-white/20
        rounded-3xl
        shadow-2xl
        p-8 space-y-6
      ">

        {/* Branding */}
        <div className="text-center space-y-3">

          <div className="
            w-20 h-20 mx-auto
            rounded-2xl
            bg-gradient-to-br from-red-500 to-red-700
            flex items-center justify-center
            text-3xl shadow-lg
          ">
            <Image
            src="@/public/icons/feuerwehr.png"
            alt="Feuerwehr Stadt Bedburg Icon"
            />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Feuerwehr Bedburg
          </h1>

          <p className="text-sm text-white/60">
            Einheit 5 · Digitale Strichliste
          </p>

        </div>

        {/* Divider */}
        <div className="h-px bg-white/20" />

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          <div className="space-y-2">
            <label className="text-sm text-white/70">
              Telefonnummer
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0176 12345678"
              className="
                w-full px-4 py-3 rounded-2xl
                bg-white/10
                border border-white/20
                text-white placeholder-white/40
                focus:outline-none
                focus:ring-2 focus:ring-red-500
                transition
              "
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full px-4 py-3 rounded-2xl
                bg-white/10
                border border-white/20
                text-white placeholder-white/40
                focus:outline-none
                focus:ring-2 focus:ring-red-500
                transition
              "
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-2xl
              bg-red-600 hover:bg-red-700
              text-white font-semibold
              shadow-lg
              active:scale-[0.98]
              transition
            "
          >
            {loading ? "Anmeldung..." : "Einloggen"}
          </button>

        </form>

      </div>

    </main>
  );
}