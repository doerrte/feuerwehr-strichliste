"use client";

import { useState } from "react";

type User = {
  id: number;
  name: string;
  phone: string;
  role: "USER" | "ADMIN";
};

export default function EditUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [pin, setPin] = useState("");
  const [role, setRole] = useState(user.role);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!confirm("Änderungen speichern?")) return;

    const res = await fetch("/api/admin/users/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user.id,
        name,
        phone,
        pin,
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Fehler");
      return;
    }

    onUpdated();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">

        <h2 className="text-xl font-semibold">
          Benutzer bearbeiten
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

       <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={15}
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, ""))
          }
          placeholder="Telefonnummer"
          className="
            w-full p-3 rounded-xl
            bg-gray-100 dark:bg-gray-800
            text-center tracking-wide
          "
        />

       <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={(e) =>
            setPin(e.target.value.replace(/\D/g, ""))
          }
          placeholder="Neue 4-stellige PIN"
          className="
            w-full p-3 rounded-xl
            bg-gray-100 dark:bg-gray-800
            text-center tracking-widest
          "
        />

        <div className="flex gap-3">
          <button
            onClick={() => setRole("USER")}
            className={`flex-1 py-2 rounded-xl ${
              role === "USER"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            USER
          </button>

          <button
            onClick={() => setRole("ADMIN")}
            className={`flex-1 py-2 rounded-xl ${
              role === "ADMIN"
                ? "bg-red-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            ADMIN
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-gray-700"
          >
            Abbrechen
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl bg-green-600 text-white"
          >
            Speichern
          </button>
        </div>

      </div>
    </div>
  );
}