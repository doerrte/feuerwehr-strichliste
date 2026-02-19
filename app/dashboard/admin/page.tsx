"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  phone: string;
  role: "ADMIN" | "USER";
  active: boolean;
};

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ➕ Neues Mitglied
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) return;

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("LOAD USERS ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createUser() {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      alert("Bitte alle Felder ausfüllen");
      return;
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        password,
        role,
      }),
    });

    if (!res.ok) {
      alert("Fehler beim Anlegen");
      return;
    }

    // Reset
    setName("");
    setPhone("");
    setPassword("");
    setRole("USER");

    loadUsers();
  }

  if (loading) {
    return <main className="p-6">Lade Benutzer...</main>;
  }

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-xl font-bold">
        👥 Benutzerverwaltung
      </h1>

      {/* ➕ Neuer Benutzer */}
      <section className="bg-white p-4 rounded-xl shadow space-y-3">
        <h2 className="font-medium">
          ➕ Neuen Benutzer anlegen
        </h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Start-Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "USER" | "ADMIN")
          }
          className="w-full border p-2 rounded"
        >
          <option value="USER">Benutzer</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button
          onClick={createUser}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Benutzer anlegen
        </button>
      </section>

      {/* 👥 Bestehende Benutzer */}
      <section className="space-y-3">
        <h2 className="font-medium">
          Bestehende Benutzer
        </h2>

        {users.map((u) => (
          <div
            key={u.id}
            onClick={() =>
              router.push(`/dashboard/admin/users/${u.id}`)
            }
            className={`border p-3 rounded bg-white shadow cursor-pointer hover:bg-gray-50 transition ${
              !u.active ? "opacity-50" : ""
            }`}
          >
            <div className="font-medium">
              {u.name}
            </div>

            <div className="text-sm text-gray-500">
              {u.phone}
            </div>

            <div className="text-xs text-gray-600">
              Rolle: {u.role}
            </div>

            {!u.active && (
              <div className="text-xs text-red-500">
                Deaktiviert
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
