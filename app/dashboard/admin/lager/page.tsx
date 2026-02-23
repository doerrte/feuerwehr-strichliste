"use client";

import { useEffect, useState } from "react";
import EditStockModal from "@/components/EditStockModal";
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
  const [showAddModal, setShowAddModal] = useState(false);

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
      body: JSON.stringify({ stock: newStock }),
    });

    setSelectedDrink(null);
    load();
  }

  return (
    <div className="space-y-8 pb-28">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          📦 Lagerverwaltung
        </h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="
            flex items-center gap-2
            bg-green-600 hover:bg-green-700
            text-white
            px-4 py-2
            rounded-2xl
            shadow-md
            active:scale-95
            transition
          "
        >
          <span className="text-lg">＋</span>
          <span className="text-sm font-medium hidden sm:inline">
            Getränk
          </span>
        </button>
      </div>

      {/* Drink Cards */}
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
              className="
                cursor-pointer
                bg-white dark:bg-gray-900
                rounded-3xl
                shadow-xl
                p-6
                space-y-4
                border
                hover:scale-[1.02]
                transition
              "
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

      {/* Edit Stock Modal */}
      {selectedDrink && (
        <EditStockModal
          drink={selectedDrink}
          onClose={() => setSelectedDrink(null)}
          onSave={updateStock}
        />
      )}

      {/* Add Drink Modal */}
      {showAddModal && (
        <AddDrinkModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}

    </div>
  );
}