"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddUserModal({
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");

    if (!/^\d{4}$/.test(pin)) {
      setError("PIN muss genau 4 Zahlen enthalten");
      return;
    }

    if (pin !== confirmPin) {
      setError("PIN stimmt nicht überein");
      return;
    }

    const res = await fetch("/api/admin/users/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        pin,
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">

        <h2 className="text-xl font-semibold text-center">
          Benutzer erstellen
        </h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
        />

        <input
          placeholder="Telefonnummer"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
        />

        <input
          placeholder="4-stellige PIN"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-center tracking-widest"
        />

        <input
          placeholder="PIN bestätigen"
          maxLength={4}
          value={confirmPin}
          onChange={(e) =>
            setConfirmPin(e.target.value.replace(/\D/g, ""))
          }
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-center tracking-widest"
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "USER" | "ADMIN")
          }
          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-200 dark:bg-gray-700"
          >
            Abbrechen
          </button>

          <button
            onClick={handleCreate}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white"
          >
            Erstellen
          </button>
        </div>

      </div>
    </div>
  );
}