"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  phone: string;
  role: "ADMIN" | "USER";
  active: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Neues Mitglied
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "USER">("USER");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }

  /* =========================
     Benutzer anlegen
  ========================= */
  async function createUser() {
    if (!newName || !newPhone || !newPassword) {
      alert("Bitte alle Felder ausfüllen");
      return;
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        phone: newPhone,
        password: newPassword,
        role: newRole,
      }),
    });

    if (!res.ok) {
      alert("Fehler beim Anlegen");
      return;
    }

    setNewName("");
    setNewPhone("");
    setNewPassword("");
    setNewRole("USER");

    loadUsers();
  }

  /* =========================
     Benutzer speichern
  ========================= */
  async function saveUser(user: User) {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        active: user.active,
      }),
    });

    if (!res.ok) {
      alert("Speichern fehlgeschlagen");
    } else {
      loadUsers();
    }
  }

  if (loading) {
    return <main className="p-6 text-gray-500">Lade Mitglieder…</main>;
  }

  return (
    <main className="p-6 space-y-8 pb-24">
      <h1 className="text-xl font-bold">Mitgliederverwaltung</h1>

      {/* =========================
          Neues Mitglied
      ========================= */}
      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="font-semibold">Neues Mitglied anlegen</h2>

        <input
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />

        <input
          placeholder="Telefon"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />

        <input
          type="password"
          placeholder="Start-Passwort"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />

        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as any)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="USER">Benutzer</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button
          onClick={createUser}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Benutzer anlegen
        </button>
      </section>

      {/* =========================
          Benutzerliste
      ========================= */}
      <section className="bg-white rounded-xl shadow p-4 space-y-4">
        <h2 className="font-semibold">Alle Mitglieder</h2>

        {users.map((u) => (
          <div
            key={u.id}
            className="border rounded-lg p-3 space-y-2"
          >
            <input
              value={u.name}
              onChange={(e) =>
                setUsers((list) =>
                  list.map((x) =>
                    x.id === u.id ? { ...x, name: e.target.value } : x
                  )
                )
              }
              className="w-full border rounded px-2 py-1"
            />

            <div className="text-sm text-gray-500">
              {u.phone}
            </div>

            <div className="flex gap-2">
              <select
                value={u.role}
                onChange={(e) =>
                  setUsers((list) =>
                    list.map((x) =>
                      x.id === u.id
                        ? { ...x, role: e.target.value as any }
                        : x
                    )
                  )
                }
                className="border rounded px-2 py-1"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={u.active}
                  onChange={(e) =>
                    setUsers((list) =>
                      list.map((x) =>
                        x.id === u.id
                          ? { ...x, active: e.target.checked }
                          : x
                      )
                    )
                  }
                />
                aktiv
              </label>
            </div>

            <button
              onClick={() => saveUser(u)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Speichern
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
