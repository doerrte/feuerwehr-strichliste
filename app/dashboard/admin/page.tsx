"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  phone: string;
  role: string;
  active: boolean;
  deletedAt: string | null;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<string>("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  async function executeAction() {
    if (!confirmUser) return;

    await fetch("/api/admin/users/manage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: confirmUser.id,
        action: actionType,
      }),
    });

    setConfirmUser(null);
    loadUsers();
  }

  const activeUsers = users.filter(
    u => u.active && !u.deletedAt
  );

  const inactiveUsers = users.filter(
    u => !u.active && !u.deletedAt
  );

  const deletedUsers = users.filter(
    u => u.deletedAt
  );

  return (
    <div className="space-y-10">

      <h1 className="text-2xl font-semibold">
        👥 Benutzerverwaltung
      </h1>

      <UserSection
        title="Aktive Benutzer"
        users={activeUsers}
        onAction={(user, action) => {
          setConfirmUser(user);
          setActionType(action);
        }}
      />

      <UserSection
        title="Deaktivierte Benutzer"
        users={inactiveUsers}
        onAction={(user, action) => {
          setConfirmUser(user);
          setActionType(action);
        }}
      />

      <UserSection
        title="Gelöschte Benutzer"
        users={deletedUsers}
        isDeleted
        onAction={(user, action) => {
          setConfirmUser(user);
          setActionType(action);
        }}
      />

      {confirmUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h2 className="text-lg font-semibold text-center">
              Aktion bestätigen?
            </h2>

            <p className="text-center text-gray-500">
              {confirmUser.name}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmUser(null)}
                className="flex-1 py-2 rounded-xl bg-gray-200"
              >
                Abbrechen
              </button>

              <button
                onClick={executeAction}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white"
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function UserSection({
  title,
  users,
  onAction,
  isDeleted,
}: any) {
  if (!users.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-medium text-lg">{title}</h2>

      {users.map((user: any) => (
        <div
          key={user.id}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg border flex justify-between items-center"
        >
          <div>
            <div className="font-medium">
              {user.name}
            </div>
            <div className="text-sm text-gray-500">
              {user.phone}
            </div>
            {user.deletedAt && (
              <div className="text-xs text-red-500">
                gelöscht am {new Date(user.deletedAt).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="flex gap-2">

            {!isDeleted && (
              <>
                <button
                  onClick={() =>
                    onAction(
                      user,
                      user.active
                        ? "deactivate"
                        : "activate"
                    )
                  }
                  className="px-3 py-1 rounded-xl bg-gray-200 text-sm"
                >
                  {user.active ? "Deaktivieren" : "Aktivieren"}
                </button>

                <button
                  onClick={() =>
                    onAction(user, "delete")
                  }
                  className="px-3 py-1 rounded-xl bg-red-100 text-red-700 text-sm"
                >
                  Löschen
                </button>
              </>
            )}

            {isDeleted && (
              <button
                onClick={() =>
                  onAction(user, "restore")
                }
                className="px-3 py-1 rounded-xl bg-green-100 text-green-700 text-sm"
              >
                Wiederherstellen
              </button>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}