"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function changePassword() {
    const res = await fetch(
      "/api/auth/change-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Passwort erfolgreich geändert");
    setOldPassword("");
    setNewPassword("");
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">
        Passwort ändern
      </h1>

      <input
        type="password"
        placeholder="Altes Passwort"
        value={oldPassword}
        onChange={(e) =>
          setOldPassword(e.target.value)
        }
        className="border p-2 rounded w-full"
      />

      <input
        type="password"
        placeholder="Neues Passwort"
        value={newPassword}
        onChange={(e) =>
          setNewPassword(e.target.value)
        }
        className="border p-2 rounded w-full"
      />

      <button
        onClick={changePassword}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Speichern
      </button>
    </main>
  );
}
