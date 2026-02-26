"use client";

import { useState } from "react";

export default function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setError("");

    if (!name || !phone || !pin) {
      setError("Alle Felder ausfüllen");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/users/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone, pin, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Fehler");
      setLoading(false);
      return;
    }

    onCreated();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">

        <h2 className="text-xl font-semibold">
          Benutzer erstellen
        </h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          placeholder="Telefonnummer"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full border p-3 rounded-xl"
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
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-green-600 text-white"
          >
            {loading ? "Erstelle..." : "Erstellen"}
          </button>
        </div>

      </div>
    </div>
  );
}