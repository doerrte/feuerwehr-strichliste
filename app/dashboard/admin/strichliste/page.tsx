"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  active: boolean;
};

type Drink = {
  id: number;
  name: string;
};

type Count = {
  drinkId: number;
  amount: number;
};

export default function AdminStrichlistePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [originalCounts, setOriginalCounts] =
    useState<Record<number, number>>({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
    loadDrinks();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;

    const data = await res.json();
    setUsers(data.filter((u: User) => u.active));
  }

  async function loadDrinks() {
    const res = await fetch(
      "/api/admin/counts/drinks"
    );
    if (!res.ok) return;

    const data = await res.json();
    setDrinks(data);
  }

  async function openUser(user: User) {
    setSelectedUser(user);

    const res = await fetch(
      `/api/admin/counts?userId=${user.id}`
    );
    if (!res.ok) return;

    const data: Count[] = await res.json();

    const map: Record<number, number> = {};
    let sum = 0;

    data.forEach((c) => {
      map[c.drinkId] = c.amount;
      sum += c.amount;
    });

    setOriginalCounts(map);
    setTotal(sum);
  }

  async function saveTotal() {
    if (!selectedUser) return;

    const originalTotal =
      Object.values(originalCounts).reduce(
        (a, b) => a + b,
        0
      );

    const difference = total - originalTotal;

    if (difference === 0) {
      alert("Keine Änderung.");
      return;
    }

    const firstDrink = drinks[0];
    if (!firstDrink) {
      alert("Kein Getränk vorhanden.");
      return;
    }

    const currentAmount =
      originalCounts[firstDrink.id] ?? 0;

    const newAmount =
      currentAmount + difference;

    await fetch("/api/admin/counts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selectedUser.id,
        drinkId: firstDrink.id,
        amount: newAmount,
      }),
    });

    alert("Gesamtstand angepasst ✅");
    setSelectedUser(null);
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        📊 Admin – Strichliste
      </h1>

      {/* Benutzerliste */}
      <section className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => openUser(u)}
            className="border p-3 rounded bg-white shadow cursor-pointer hover:bg-gray-50"
          >
            {u.name}
          </div>
        ))}
      </section>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white w-full max-w-md rounded-xl shadow p-6 space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                Gesamtstand von {selectedUser.name}
              </h2>
              <button
                onClick={() =>
                  setSelectedUser(null)
                }
                className="text-red-600"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium">
                Gesamt getrunken
              </label>
              <input
                type="number"
                value={total}
                onChange={(e) =>
                  setTotal(
                    Number(e.target.value)
                  )
                }
                className="w-full border p-2 rounded mt-1"
              />
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={saveTotal}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Speichern
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}