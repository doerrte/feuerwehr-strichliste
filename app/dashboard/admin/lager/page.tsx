"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
};

export default function LagerPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [editing, setEditing] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/drinks");
    const data = await res.json();
    setDrinks(data);
  }

  async function save(drink: Drink) {
    await fetch(`/api/drinks/${drink.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(drink),
    });

    setEditing(null);
    load();
  }

  async function deleteDrink(id: number) {
    if (!confirm("Wirklich löschen?")) return;

    await fetch(`/api/drinks/${id}`, {
      method: "DELETE",
    });

    load();
  }

  async function refill(id: number) {
    const amount = Number(
      prompt("Wie viele Flaschen hinzufügen?")
    );

    if (!amount) return;

    const drink = drinks.find(d => d.id === id);
    if (!drink) return;

    await fetch(`/api/drinks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...drink,
        stock: drink.stock + amount,
      }),
    });

    load();
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        📦 Lagerverwaltung
      </h1>

      {drinks.map((drink) => (
        <div
          key={drink.id}
          className="border p-4 rounded bg-white shadow space-y-2"
        >
          {editing === drink.id ? (
            <>
              <input
                value={drink.name}
                onChange={(e) =>
                  setDrinks((prev) =>
                    prev.map((d) =>
                      d.id === drink.id
                        ? { ...d, name: e.target.value }
                        : d
                    )
                  )
                }
                className="border p-1 rounded w-full"
              />

              <input
                type="number"
                value={drink.stock}
                onChange={(e) =>
                  setDrinks((prev) =>
                    prev.map((d) =>
                      d.id === drink.id
                        ? {
                            ...d,
                            stock: Number(e.target.value),
                          }
                        : d
                    )
                  )
                }
                className="border p-1 rounded w-full"
              />

              <button
                onClick={() => save(drink)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Speichern
              </button>
            </>
          ) : (
            <>
              <div className="font-bold">
                {drink.name}
              </div>

              <div>
                Bestand: {drink.stock} Flaschen
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => refill(drink.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Auffüllen
                </button>

                <button
                  onClick={() =>
                    setEditing(drink.id)
                  }
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Bearbeiten
                </button>

                <button
                  onClick={() =>
                    deleteDrink(drink.id)
                  }
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Löschen
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </main>
  );
}