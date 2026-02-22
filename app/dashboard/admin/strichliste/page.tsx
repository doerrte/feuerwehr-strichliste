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

  const [originalCounts, setOriginalCounts] = useState<Record<number, number>>({});
  const [counts, setCounts] = useState<Record<number, number>>({});

  const [total, setTotal] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

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
    const res = await fetch("/api/admin/counts/drinks");
    if (!res.ok) return;

    const data = await res.json();
    setDrinks(data);
  }

  async function openUser(user: User) {
    setSelectedUser(user);

    const res = await fetch(`/api/admin/counts?userId=${user.id}`);
    if (!res.ok) return;

    const data: Count[] = await res.json();

    const map: Record<number, number> = {};
    let sum = 0;

    data.forEach((c) => {
      map[c.drinkId] = c.amount;
      sum += c.amount;
    });

    setOriginalCounts(map);
    setCounts(map);
    setTotal(sum);
    setHasChanges(false);
  }

  function updateLocal(drinkId: number, value: number) {
    const newCounts = {
      ...counts,
      [drinkId]: value,
    };

    setCounts(newCounts);

    const newTotal = Object.values(newCounts).reduce(
      (a, b) => a + b,
      0
    );

    setTotal(newTotal);

    // prüfen ob Änderungen vorhanden
    const changed =
      JSON.stringify(newCounts) !== JSON.stringify(originalCounts);

    setHasChanges(changed);
  }

  async function saveChanges() {
    if (!selectedUser) return;

    for (const drinkId of Object.keys(counts)) {
      await fetch("/api/admin/counts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          drinkId: Number(drinkId),
          amount: counts[Number(drinkId)],
        }),
      });
    }

    setOriginalCounts(counts);
    setHasChanges(false);
    alert("Änderungen gespeichert ✅");
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        📊 Admin – Strichliste
      </h1>

      {/* Benutzer */}
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
          <div className="bg-white w-full max-w-lg rounded-xl shadow p-6 space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">
                Strichliste von {selectedUser.name}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-red-600"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Gesamt getrunken: <strong>{total}</strong>
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
                    value={counts[d.id] ?? 0}
                    onChange={(e) =>
                      updateLocal(
                        d.id,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 text-center border rounded p-1"
                  />
                </div>
              ))}
            </div>

            {/* Bestätigungsbutton */}
            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={saveChanges}
                disabled={!hasChanges}
                className={`px-4 py-2 rounded ${
                  hasChanges
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Änderungen speichern
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}