"use client";

import { useEffect, useState } from "react";
import CreateUserModal from "@/components/CreateUserModal";
import EditUserModal from "@/components/EditUserModal";

type User = {
  id: number;
  name: string;
  phone: string;
  role: "USER" | "ADMIN";
  active: boolean;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  const activeUsers = users.filter((u) => u.active);
  const inactiveUsers = users.filter((u) => !u.active);

  async function toggleActive(user: User) {
    if (!confirm("Status ändern?")) return;

    await fetch("/api/admin/users/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        action: user.active ? "deactivate" : "activate",
      }),
    });

    loadUsers();
  }

  async function deleteUser(user: User) {
    if (!confirm("Benutzer wirklich löschen?")) return;

    await fetch("/api/admin/users/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        action: "delete",
      }),
    });

    loadUsers();
  }

  return (
    <main className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Benutzerverwaltung
        </h1>

        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-2xl bg-green-600 text-white shadow-md active:scale-95 transition"
        >
          ➕ Benutzer
        </button>
      </div>

      {/* Aktive Benutzer */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-500">
          Aktive Benutzer
        </h2>

        {activeUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-5 space-y-4 border hover:scale-[1.01] transition"
          >
            <div
              onClick={() => setSelectedUser(user)}
              className="cursor-pointer"
            >
              <div className="font-semibold text-lg">
                {user.name}
              </div>
              <div className="text-sm text-gray-500">
                {user.phone}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  user.role === "ADMIN"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.role}
              </span>

              <div className="flex gap-3">

                <button
                  onClick={() => toggleActive(user)}
                  className="text-yellow-600 text-sm"
                >
                  Deaktivieren
                </button>

                <button
                  onClick={() => deleteUser(user)}
                  className="text-red-600 text-sm"
                >
                  Löschen
                </button>

              </div>

            </div>
          </div>
        ))}
      </section>

      {/* Deaktivierte Benutzer */}
      {inactiveUsers.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-gray-500">
            Deaktivierte Benutzer
          </h2>

          {inactiveUsers.map((user) => (
            <div
              key={user.id}
              className="bg-gray-100 dark:bg-gray-800 rounded-3xl shadow p-5 space-y-4 border"
            >
              <div>
                <div className="font-semibold text-lg">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500">
                  {user.phone}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">

                <span className="text-xs px-3 py-1 rounded-full bg-gray-300 text-gray-700">
                  {user.role}
                </span>

                <div className="flex gap-3">

                  <button
                    onClick={() => toggleActive(user)}
                    className="text-green-600 text-sm"
                  >
                    Aktivieren
                  </button>

                  <button
                    onClick={() => deleteUser(user)}
                    className="text-red-600 text-sm"
                  >
                    Löschen
                  </button>

                </div>

              </div>
            </div>
          ))}
        </section>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadUsers();
          }}
        />
      )}

      {/* Edit Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => {
            setSelectedUser(null);
            loadUsers();
          }}
        />
      )}

    </main>
  );
}