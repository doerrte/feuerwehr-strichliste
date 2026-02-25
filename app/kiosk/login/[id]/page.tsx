"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type User = {
  id: number;
  name: string;
};

export default function KioskPinPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/kiosk/users", {
        cache: "no-store",
      });
      const users = await res.json();
      const selected = users.find((u: User) => u.id === Number(id));
      setUser(selected);
    }
    loadUser();
  }, [id]);

  async function submitPin(value: string) {
    if (value.length !== 4) return;

    const res = await fetch("/api/kiosk/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: id,
        pin: value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setPin("");
      return;
    }

    router.replace("/dashboard");
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
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center p-8">

      {/* Benutzer Info */}
      {user && (
        <div className="text-center mb-8 space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-600 text-white flex items-center justify-center text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-semibold">
            {user.name}
          </h2>
          <p className="text-sm text-gray-500">
            PIN eingeben
          </p>
        </div>
      )}

      {/* PIN Anzeige */}
      <div className="flex gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="
              w-6 h-6 rounded-full
              border-2 border-gray-400
              flex items-center justify-center
            "
          >
            {pin[i] ? (
              <div className="w-3 h-3 bg-black dark:bg-white rounded-full" />
            ) : null}
          </div>
        ))}
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <button
            key={n}
            onClick={() => handleDigit(String(n))}
            className="
              py-5 text-xl font-semibold
              bg-white dark:bg-gray-900
              rounded-2xl shadow
              hover:scale-105 transition
            "
          >
            {n}
          </button>
        ))}

        <button
          onClick={() => router.push("/kiosk")}
          className="
            py-5 text-sm font-medium
            bg-gray-200 dark:bg-gray-800
            rounded-2xl
          "
        >
          Abbrechen
        </button>

        <button
          onClick={() => handleDigit("0")}
          className="
            py-5 text-xl font-semibold
            bg-white dark:bg-gray-900
            rounded-2xl shadow
            hover:scale-105 transition
          "
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="
            py-5 text-sm font-medium
            bg-gray-200 dark:bg-gray-800
            rounded-2xl
          "
        >
          Löschen
        </button>

      </div>

    </main>
  );
}