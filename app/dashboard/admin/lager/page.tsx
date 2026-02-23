"use client";

import { useEffect, useState } from "react";
import AddDrinkModal from "@/components/AddDrinkModal";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  minStock: number;
};

export default function LagerPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [refillCases, setRefillCases] = useState(0);
  const [refillBottles, setRefillBottles] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/drinks");
    const data = await res.json();
    setDrinks(data);
  }

  function openRefill(drink: Drink) {
    setSelectedDrink(drink);
    setRefillCases(0);
    setRefillBottles(0);
  }

  async function confirmRefill() {
    if (!selectedDrink) return;

    const total =
      refillCases * selectedDrink.unitsPerCase + refillBottles;

    await fetch(`/api/drinks/${selectedDrink.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stock: selectedDrink.stock + total,
      }),
    });

    setSelectedDrink(null);
    load();
  }

  async function deleteDrink(drink: Drink) {
    if (!confirm("Getränk löschen?")) return;

    await fetch(`/api/drinks/${drink.id}`, {
      method: "DELETE",
    });

    load();
  }

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-semibold">
        📦 Lagerverwaltung
      </h1>

      <div className="space-y-5">
        {drinks.map((drink) => {
          const cases = Math.floor(
            drink.stock / drink.unitsPerCase
          );
          const bottles =
            drink.stock % drink.unitsPerCase;

          return (
            <div
              key={drink.id}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 space-y-4 border"
            >
              <div className="flex justify-between items-center">

                <div>
                  <h3 className="text-lg font-semibold">
                    {drink.name}
                  </h3>

                  {drink.stock <= drink.minStock && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                      ⚠ Niedriger Bestand
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold">
                    {drink.stock}
                  </div>
                  <div className="text-xs text-gray-500">
                    Flaschen
                  </div>
                </div>

              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <div>
                  🧃 {cases} Kisten
                </div>
                <div>
                  🍾 {bottles} Flaschen
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => openRefill(drink)}
                  className="flex-1 py-2 rounded-2xl bg-blue-600 text-white shadow-md active:scale-95 transition"
                >
                  Auffüllen
                </button>

                <button
                  onClick={() => deleteDrink(drink)}
                  className="flex-1 py-2 rounded-2xl bg-red-600 text-white shadow-md active:scale-95 transition"
                >
                  Löschen
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Refill Modal */}
      {selectedDrink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">

            <h2 className="text-lg font-semibold">
              Auffüllen: {selectedDrink.name}
            </h2>

            <div className="space-y-3">

              <input
                type="number"
                placeholder="Kisten"
                value={refillCases}
                onChange={(e) =>
                  setRefillCases(Number(e.target.value))
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                type="number"
                placeholder="Flaschen"
                value={refillBottles}
                onChange={(e) =>
                  setRefillBottles(Number(e.target.value))
                }
                className="w-full border p-3 rounded-xl"
              />

            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setSelectedDrink(null)}
                className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-gray-700"
              >
                Abbrechen
              </button>

              <button
                onClick={confirmRefill}
                className="flex-1 py-2 rounded-xl bg-green-600 text-white"
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