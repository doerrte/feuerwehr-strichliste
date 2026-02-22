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
  const [userTotals, setUserTotals] = useState<Record<number, number>>({});
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [total, setTotal] = useState(0);

  // 🔥 Bestätigungs-State
  const [pendingChange, setPendingChange] = useState<{
    drinkId: number;
    oldValue: number;
    newValue: number;
  } | null>(null);

  useEffect(() => {
    loadUsers();
    loadDrinks();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;

    const data = await res.json();
    const activeUsers = data.filter((u: User) => u.active);
    setUsers(activeUsers);

    const totals: Record<number, number> = {};

    for (const user of activeUsers) {
      const countRes = await fetch(
        `/api/admin/counts?userId=${user.id}`
      );

      if (!countRes.ok) continue;

      const counts: Count[] = await countRes.json();

      totals[user.id] = counts.reduce(
        (sum, c) => sum + c.amount,
        0
      );
    }

    setUserTotals(totals);
  }

  async function loadDrinks() {
    const res = await fetch("/api/admin/counts/drinks");
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

    setCounts(map);
    setTotal(sum);
  }

  function requestUpdate(
    drinkId: number,
    newAmount: number
  ) {
    if (!selectedUser) return;

    const oldValue = counts[drinkId] ?? 0;

    if (newAmount === oldValue) return;

    setPendingChange({
      drinkId,
      oldValue,
      newValue: newAmount,
    });
  }

  async function confirmUpdate() {
    if (!pendingChange || !selectedUser) return;

    const { drinkId, newValue } = pendingChange;

    await fetch("/api/admin/counts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selectedUser.id,
        drinkId,
        amount: newValue,
      }),
    });

    const newCounts = {
      ...counts,
      [drinkId]: newValue,
    };

    setCounts(newCounts);

    const newTotal = Object.values(newCounts).reduce(
      (a, b) => a + b,
      0
    );

    setTotal(newTotal);

    setUserTotals((prev) => ({
      ...prev,
      [selectedUser.id]: newTotal,
    }));

    setPendingChange(null);
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
            className="border p-3 rounded bg-white shadow cursor-pointer hover:bg-gray-50 flex justify-between"
          >
            <span>{u.name}</span>
            <span className="text-gray-600 text-sm">
              Gesamt:{" "}
              <strong>
                {userTotals[u.id] ?? 0}
              </strong>
            </span>
          </div>
        ))}
      </section>

      {/* User Modal */}
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
              Gesamt getrunken:{" "}
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
                    value={counts[d.id] ?? 0}
                    onChange={(e) =>
                      requestUpdate(
                        d.id,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 text-center border rounded p-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🔥 Bestätigungs-Modal */}
      {pendingChange && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow w-80 space-y-4">
            <h2 className="font-bold text-lg">
              Änderung bestätigen
            </h2>

            <p>
              Wirklich von{" "}
              <strong>
                {pendingChange.oldValue}
              </strong>{" "}
              auf{" "}
              <strong>
                {pendingChange.newValue}
              </strong>{" "}
              ändern?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setPendingChange(null)
                }
                className="px-3 py-1 border rounded"
              >
                Abbrechen
              </button>

              <button
                onClick={confirmUpdate}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}