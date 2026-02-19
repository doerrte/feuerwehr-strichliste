"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
};

export default function AdminPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [newDrink, setNewDrink] = useState("");
  const [loading, setLoading] = useState(true);

  // 📥 Getränke laden
  async function loadDrinks() {
    const res = await fetch("/api/admin/drinks");

    if (!res.ok) {
      console.error("Getränke laden fehlgeschlagen");
      return;
    }

    const data = await res.json();
    setDrinks(data);
    setLoading(false);
  }

  useEffect(() => {
    loadDrinks();
  }, []);

  // ➕ Getränk hinzufügen
  async function addDrink() {
    if (!newDrink.trim()) return;

    await fetch("/api/admin/drinks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDrink }),
    });

    setNewDrink("");
    loadDrinks();
  }

  // ❌ Getränk löschen (mit Bestätigung)
  async function deleteDrink(id: number, name: string) {
    const ok = confirm(
      `Willst du das Getränk "${name}" wirklich löschen?\nAlle Striche werden ebenfalls entfernt!`
    );

    if (!ok) return;

    await fetch("/api/admin/drinks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drinkId: id }),
    });

    loadDrinks();
  }

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-gray-400">Lade Admin-Bereich…</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Admin-Bereich</h1>

      {/* ➕ Getränk anlegen */}
      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="font-semibold">Getränk hinzufügen</h2>

        <div className="flex gap-2">
          <input
            value={newDrink}
            onChange={(e) => setNewDrink(e.target.value)}
            placeholder="Getränkename"
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={addDrink}
            className="bg-black text-white px-4 rounded"
          >
            Hinzufügen
          </button>
        </div>
      </section>

      {/* 🧾 Getränke verwalten */}
      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="font-semibold">Getränke verwalten</h2>

        {drinks.length === 0 && (
          <p className="text-sm text-gray-400">
            Keine Getränke vorhanden
          </p>
        )}

        <div className="space-y-2">
          {drinks.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <span>{d.name}</span>

              <button
                onClick={() => deleteDrink(d.id, d.name)}
                className="text-red-600 text-sm"
              >
                Löschen
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
