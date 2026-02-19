"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [captchaValid, setCaptchaValid] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // ⏳ Countdown
  useEffect(() => {
    if (!secondsLeft) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading || secondsLeft) return;

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
          captchaValid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login fehlgeschlagen");

        if (data.attempts !== undefined) {
          setAttempts(data.attempts);
        }

        if (data.secondsLeft) {
          setSecondsLeft(data.secondsLeft);
        }

        setLoading(false);
        return;
      }

      // ✅ Erfolgreich → weiterleiten
      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      setError("Serverfehler");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow w-80 space-y-4"
      >
        <h1 className="text-lg font-bold text-center">
          Strichliste Login
        </h1>

        <input
          type="text"
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* 🔐 Einfaches Captcha Beispiel */}
        <div className="text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={captchaValid}
              onChange={(e) => setCaptchaValid(e.target.checked)}
            />
            Ich bin kein Roboter
          </label>
        </div>

        {/* ❌ Fehlermeldung */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* 🔢 Fehlversuche Anzeige */}
        {attempts !== null && attempts <= 5 && (
          <div className="text-orange-600 text-xs">
            Fehlversuche: {attempts}/5
          </div>
        )}

        {/* ⏳ Countdown Anzeige */}
        {secondsLeft && (
          <div className="text-red-600 text-sm font-medium">
            Gesperrt für {secondsLeft} Sekunden
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !!secondsLeft}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          {loading ? "Bitte warten..." : "Anmelden"}
        </button>
      </form>
    </main>
  );
}
