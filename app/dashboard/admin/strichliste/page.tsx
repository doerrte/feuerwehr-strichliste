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
  const [draftCounts, setDraftCounts] = useState<Record<number, number>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
    setDraftCounts(map);
    setTotal(sum);
  }

  function changeDraft(drinkId: number, value: number) {
    const updated = {
      ...draftCounts,
      [drinkId]: value,
    };

    setDraftCounts(updated);

    const newTotal = Object.values(updated).reduce(
      (a, b) => a + b,
      0
    );

    setTotal(newTotal);
  }

  async function saveChanges() {
    if (!selectedUser) return;

    if (!confirm("Änderungen speichern?")) return;

    for (const drinkId of Object.keys(draftCounts)) {
      const id = Number(drinkId);

      if (draftCounts[id] !== counts[id]) {
        await fetch("/api/admin/counts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            drinkId: id,
            amount: draftCounts[id],
          }),
        });
      }
    }

    setCounts(draftCounts);
    alert("Änderungen gespeichert ✅");
  }

  function cancelChanges() {
    setDraftCounts(counts);
    setTotal(
      Object.values(counts).reduce(
        (a, b) => a + b,
        0
      )
    );
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
                onClick={() => setSelectedUser(null)}
                className="text-red-600"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Gesamt: <strong>{total}</strong>
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
                    value={draftCounts[d.id] ?? 0}
                    onChange={(e) =>
                      changeDraft(
                        d.id,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 text-center border rounded p-1"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={cancelChanges}
                className="border px-4 py-2 rounded"
              >
                Abbrechen
              </button>

              <button
                onClick={saveChanges}
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