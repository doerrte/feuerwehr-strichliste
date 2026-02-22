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
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
    loadDrinks();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.filter((u: User) => u.active));
  }

  async function loadDrinks() {
    const res = await fetch("/api/drinks");
    const data = await res.json();
    setDrinks(data);
  }

  async function openUser(user: User) {
    setSelectedUser(user);

    const res = await fetch(
      `/api/admin/counts?userId=${user.id}`
    );
    const data: Count[] = await res.json();

    const map: Record<number, number> = {};
    let sum = 0;

    data.forEach((c) => {
      map[c.drinkId] = c.amount;
      sum += c.amount;
    });

    setCounts(map);
    setTotal(sum);
  }

  async function updateCount(
    drinkId: number,
    newAmount: number
  ) {
    if (!selectedUser) return;

    if (!confirm("Änderung wirklich speichern?"))
      return;

    await fetch("/api/admin/counts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selectedUser.id,
        drinkId,
        amount: newAmount,
      }),
    });

    const newCounts = {
      ...counts,
      [drinkId]: newAmount,
    };

    setCounts(newCounts);

    const newTotal = Object.values(
      newCounts
    ).reduce((a, b) => a + b, 0);

    setTotal(newTotal);
  }

  async function resetAll() {
    if (!selectedUser) return;

    if (
      !confirm(
        "⚠️ Wirklich alle Getränke auf 0 setzen?"
      )
    )
      return;

    await fetch(
      "/api/admin/counts/reset",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
        }),
      }
    );

    // UI zurücksetzen
    const resetMap: Record<number, number> = {};
    drinks.forEach((d) => {
      resetMap[d.id] = 0;
    });

    setCounts(resetMap);
    setTotal(0);
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        📊 Admin – Strichliste
      </h1>

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

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow p-6 space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                Strichliste von {selectedUser.name}
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

            <div className="text-sm text-gray-600">
              Gesamt:{" "}
              <strong>{total}</strong>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {drinks.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{d.name}</span>

                  <input
                    type="number"
                    value={
                      counts[d.id] ?? 0
                    }
                    onChange={(e) =>
                      updateCount(
                        d.id,
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-20 text-center border rounded p-1"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={resetAll}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                🔄 Reset
              </button>

              <button
                onClick={() =>
                  setSelectedUser(null)
                }
                className="border px-4 py-2 rounded"
              >
                Schließen
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}