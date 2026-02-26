"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function submitPin(value: string) {
    if (value.length !== 4) return;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        pin: value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setPin("");
      return;
    }

    window.location.href = "/dashboard";
  }

  function handleDigit(digit: string) {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      submitPin(newPin);
    }
  }

  function handleDelete() {
    setPin(pin.slice(0, -1));
  }

  return (
    <main className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">

      {/* Glow Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-red-600 rounded-full blur-[160px] opacity-40" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-red-800 rounded-full blur-[160px] opacity-40" />
      </div>

      <div className="
        relative z-10
        w-full max-w-md mx-6
        bg-white/10
        backdrop-blur-3xl
        border border-white/20
        rounded-3xl
        shadow-2xl
        p-8 space-y-6
      ">

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/icons/feuerwehr.png"
            alt="Feuerwehr"
            width={70}
            height={70}
            priority
          />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-white">
            Login mit PIN
          </h1>
        </div>

        {/* Telefonnummer */}
        <input
          type="number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefonnummer"
          className="
            w-full px-4 py-3 rounded-2xl
            bg-white/10 border border-white/20
            text-white placeholder-white/40
            focus:outline-none focus:ring-2 focus:ring-red-500
          "
        />

        {/* PIN Anzeige */}
        <div className="flex justify-center gap-4">
          {[0,1,2,3].map((i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white/40 flex items-center justify-center"
            >
              {pin[i] && (
                <div className="w-3 h-3 bg-white rounded-full" />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(String(n))}
              className="
                py-4 text-xl font-semibold
                bg-white/10 border border-white/20
                text-white rounded-2xl
                hover:bg-white/20 transition
              "
            >
              {n}
            </button>
          ))}

          <button
            onClick={handleDelete}
            className="
              py-4 text-sm
              bg-white/10 border border-white/20
              text-white rounded-2xl
            "
          >
            Löschen
          </button>

          <button
            onClick={() => handleDigit("0")}
            className="
              py-4 text-xl font-semibold
              bg-white/10 border border-white/20
              text-white rounded-2xl
            "
          >
            0
          </button>

          <div />
        </div>

      </div>

    </main>
  );
}