"use client";

import { useEffect, useState } from "react";
import CreateUserModal from "@/components/CreateUserModal";

type User = {
  id: number;
  name: string;
  phone: string;
  role: "USER" | "ADMIN";
  active: boolean;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  return (
    <main className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Benutzerverwaltung
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-2xl bg-green-600 text-white shadow-md active:scale-95 transition"
        >
          ➕ Benutzer
        </button>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">
                {user.name}
              </div>
              <div className="text-sm text-gray-500">
                {user.phone}
              </div>
            </div>

            <span className={`text-xs px-3 py-1 rounded-full ${
              user.role === "ADMIN"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {user.role}
            </span>
          </div>
        ))}
      </div>

      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            loadUsers();
          }}
        />
      )}

    </main>
  );
}