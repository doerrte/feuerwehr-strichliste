"use client";

import { useEffect, useState } from "react";

type User = {
  name: string;
  phone: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });

  if (res.ok) {
    const data = await res.json();

    if (data.user) {
      setUser(data.user);
      setPhone(data.user.phone ?? "");
    }
  }
}

  async function handleSave() {
    setMessage("");

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        oldPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    setMessage("Änderungen gespeichert ✅");
    setOldPassword("");
    setNewPassword("");
  }

  if (!user) return null;

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-semibold">
          👤 Profil
        </h1>
        <p className="text-sm text-gray-500">
          Persönliche Einstellungen
        </p>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border space-y-6">

        <div>
          <label className="block text-sm font-medium mb-1">
          
          </label>
          <input
            value={user.name}
            disabled
            className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Telefonnummer
          </label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={15}
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, ""))
            }
            className="w-full p-3 rounded-xl border bg-transparent text-center tracking-wide"
          />
        </div>

        <div className="pt-4 border-t space-y-4">

          <h2 className="font-medium">
            Passwort ändern
          </h2>

          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="Alte PIN"
            value={oldPassword}
            onChange={(e) =>
              setOldPassword(e.target.value.replace(/\D/g, ""))
            }
            className="w-full p-3 rounded-xl border bg-transparent text-center tracking-widest"
          />

          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="Neue PIN"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value.replace(/\D/g, ""))
            }
            className="w-full p-3 rounded-xl border bg-transparent text-center tracking-widest"
          />
        </div>

        {message && (
          <div className="text-sm text-blue-600">
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl bg-blue-600 text-white font-medium shadow-md"
        >
          Änderungen speichern
        </button>

      </div>

    </div>
  );
}