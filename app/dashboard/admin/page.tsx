"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  phone: string;
  role: "ADMIN" | "USER";
  active: boolean;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  async function manageUser(
    userId: number,
    action: "activate" | "deactivate" | "delete"
  ) {
    const confirmText =
      action === "delete"
        ? "Benutzer wirklich löschen?"
        : action === "deactivate"
        ? "Benutzer deaktivieren?"
        : "Benutzer aktivieren?";

    if (!confirm(confirmText)) return;

    setLoading(true);

    const res = await fetch(
      "/api/admin/users/manage",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          userId,
          action,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Fehler");
      setLoading(false);
      return;
    }

    await loadUsers();
    setLoading(false);
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        👥 Benutzerverwaltung
      </h1>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">
                {user.name}
              </div>

              <div className="text-sm text-gray-600">
                {user.phone}
              </div>

              <div className="text-xs mt-1">
                Rolle:{" "}
                <span className="font-medium">
                  {user.role}
                </span>
              </div>

              <div className="text-xs mt-1">
                Status:{" "}
                {user.active ? (
                  <span className="text-green-600 font-medium">
                    Aktiv
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    Deaktiviert
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {user.active ? (
                <button
                  disabled={loading}
                  onClick={() =>
                    manageUser(
                      user.id,
                      "deactivate"
                    )
                  }
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  Deaktivieren
                </button>
              ) : (
                <button
                  disabled={loading}
                  onClick={() =>
                    manageUser(
                      user.id,
                      "activate"
                    )
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Aktivieren
                </button>
              )}

              <button
                disabled={loading}
                onClick={() =>
                  manageUser(
                    user.id,
                    "delete"
                  )
                }
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}