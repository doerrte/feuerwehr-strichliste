"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  active: boolean;
  total: number;
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
  const [draftCounts, setDraftCounts] = useState<Record<number, number>>({});
  const [originalCounts, setOriginalCounts] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
    loadDrinks();
  }, []);

  async function loadUsers() {
    const res = await fetch("/api/admin/users/with-totals");
    const data = await res.json();
    setUsers(data);
  }

  async function loadDrinks() {
    const res = await fetch("/api/drinks");
    const data = await res.json();
    setDrinks(data);
  }

  async function openUser(user: User) {
    setSelectedUser(user);

    const res = await fetch(`/api/admin/counts?userId=${user.id}`);
    const data: Count[] = await res.json();

    const map: Record<number, number> = {};

    drinks.forEach((d) => (map[d.id] = 0));

    data.forEach((c) => {
      map[c.drinkId] = c.amount;
    });

    setDraftCounts(map);
    setOriginalCounts(map);
  }

  function changeDraft(drinkId: number, value: number) {
    setDraftCounts((prev) => ({
      ...prev,
      [drinkId]: value,
    }));
  }

  async function saveChanges() {
    if (!selectedUser) return;
    if (!confirm("Änderungen speichern?")) return;

    for (const drinkId of Object.keys(draftCounts)) {
      const id = Number(drinkId);

      if (draftCounts[id] !== originalCounts[id]) {
        await fetch("/api/admin/counts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUser.id,
            drinkId: id,
            amount: draftCounts[id],
          }),
        });
      }
    }

    setSelectedUser(null);
    loadUsers();
  }

  function resetAll() {
    if (!confirm("Alle Getränke auf 0 setzen?")) return;

    const reset: Record<number, number> = {};
    drinks.forEach((d) => (reset[d.id] = 0));
    setDraftCounts(reset);
  }

  const total = Object.values(draftCounts).reduce((a, b) => a + b, 0);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-semibold">📊 Strichliste</h1>

      <input
        type="text"
        placeholder="Benutzer suchen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-2xl border bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl outline-none"
      />

      <div className="space-y-4">
        {filtered.map((user) => (
          <div
            key={user.id}
            onClick={() => openUser(user)}
            className="flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg border hover:scale-[1.01] transition cursor-pointer"
          >
            <div>
              <h3 className="text-lg font-medium">
                {user.name}
              </h3>
              <span className="text-xs text-gray-500">
                {user.active ? "Aktiv" : "Inaktiv"}
              </span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg">
              {user.total}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">

          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6">

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedUser.name}
              </h2>
              <button onClick={() => setSelectedUser(null)}>
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Gesamt: <strong>{total}</strong>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto">
              {drinks.map((drink) => (
                <div
                  key={drink.id}
                  className="flex justify-between items-center border rounded-xl p-3"
                >
                  <span>{drink.name}</span>

                  <input
                    type="number"
                    value={draftCounts[drink.id] ?? 0}
                    onChange={(e) =>
                      changeDraft(
                        drink.id,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 text-center border rounded-lg p-1"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={resetAll}
                className="bg-red-600 text-white px-4 py-2 rounded-xl"
              >
                Reset
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Abbrechen
                </button>

                <button
                  onClick={saveChanges}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl"
                >
                  Speichern
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}