"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  phone: string;
  role: "ADMIN" | "USER";
  active: boolean;
};

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const res = await fetch(`/api/admin/users/${id}`);
    if (!res.ok) {
      alert("Benutzer nicht gefunden");
      router.push("/dashboard/admin");
      return;
    }

    const data = await res.json();
    setUser(data);
    setLoading(false);
  }

  async function changePassword() {
  if (!newPassword.trim()) {
    alert("Passwort fehlt");
    return;
  }

  const res = await fetch("/api/admin/users/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: id,           // 👈 wichtig
      newPassword: newPassword,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Fehler");
    return;
  }

  alert("Passwort geändert");
  setNewPassword("");
}

  async function toggleActive() {
    await fetch("/api/admin/users/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        action: "toggle",
      }),
    });

    loadUser();
  }

  async function deleteUser() {
    if (!confirm("Benutzer wirklich löschen?")) return;

    const res = await fetch("/api/admin/users/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        action: "delete",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Benutzer gelöscht");
    router.push("/dashboard/admin");
  }

  if (loading) return <main className="p-6">Lade...</main>;
  if (!user) return null;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        Benutzer bearbeiten
      </h1>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <div>
          <strong>Name:</strong> {user.name}
        </div>
        <div>
          <strong>Telefon:</strong> {user.phone}
        </div>
        <div>
          <strong>Rolle:</strong> {user.role}
        </div>
        <div>
          <strong>Status:</strong>{" "}
          {user.active ? "Aktiv" : "Deaktiviert"}
        </div>
      </div>

      {/* Passwort ändern */}
      <section className="bg-white p-4 rounded-xl shadow space-y-3">
        <h2 className="font-medium">
          Passwort ändern
        </h2>

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
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Passwort speichern
        </button>
      </section>

      {/* Aktivieren / Deaktivieren */}
      <button
        onClick={toggleActive}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        {user.active
          ? "Deaktivieren"
          : "Aktivieren"}
      </button>

      {/* Löschen */}
      <button
        onClick={deleteUser}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Benutzer löschen
      </button>
    </main>
  );
}
