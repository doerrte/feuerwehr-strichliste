"use client";

import { useEffect, useState } from "react";
import  EditStockModal  from "@/components/EditStockModal";

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

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/drinks");
    const data = await res.json();
    setDrinks(data);
  }

  async function updateStock(newStock: number) {
    if (!selectedDrink) return;

    await fetch(`/api/drinks/${selectedDrink.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stock: newStock,
      }),
    });

    setSelectedDrink(null);
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
              onClick={() => setSelectedDrink(drink)}
              className="cursor-pointer bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 space-y-4 border hover:scale-[1.02] transition"
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
                <div>🧃 {cases} Kisten</div>
                <div>🍾 {bottles} Flaschen</div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDrink && (
        <EditStockModal
          drink={selectedDrink}
          onClose={() => setSelectedDrink(null)}
          onSave={updateStock}
        />
      )}

    </div>
  );
}