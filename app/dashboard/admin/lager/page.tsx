"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
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
  const [loading, setLoading] = useState(true);
  const [selectedDrink, setSelectedDrink] =
    useState<Drink | null>(null);
  const [showAddModal, setShowAddModal] =
    useState(false);

  useEffect(() => {
    loadDrinks();
  }, []);

  async function loadDrinks() {
    try {
      const res = await fetch("/api/drinks");
      const data = await res.json();
      setDrinks(data);
    } catch (error) {
      console.error("Lager Fehler:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStockBreakdown(
    stock: number,
    unitsPerCase: number
  ) {
    const cases = Math.floor(stock / unitsPerCase);
    const bottles = stock % unitsPerCase;
    return { cases, bottles };
  }

  async function handleSave(stock: number) {
    if (!selectedDrink) return;

    const res = await fetch(
      `/api/drinks/${selectedDrink.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stock }),
      }
    );

    if (!res.ok) {
      alert("Fehler beim Speichern");
      return;
    }

    setSelectedDrink(null);
    loadDrinks();
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        Lade Lager...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          📦 Lagerverwaltung
        </h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-green-700 transition"
        >
          <PlusIcon className="w-6 h-6" />
          
        </button>
      </div>

      {/* Drink Cards */}
      {drinks.map((drink) => {
        const breakdown = getStockBreakdown(
          drink.stock,
          drink.unitsPerCase
        );

        const lowStock =
          drink.stock <= drink.minStock;

        return (
          <div
            key={drink.id}
            className="
                        bg-feuerwehr-lightCard
                        dark:bg-feuerwehr-darkCard/80
                        backdrop-blur-xl
                        border
                        border-feuerwehr-borderLight
                        dark:border-feuerwehr-borderDark
                        shadow-soft
                        dark:shadow-premium
                        rounded-premium
                        p-5
                      "
            >
            <div>
              <h2 className="font-semibold text-lg">
                {drink.name}
              </h2>

              <p className="text-sm text-gray-600">
                Bestand:
                <span className="font-semibold ml-1">
                  {breakdown.cases} Kisten
                </span>
                {" + "}
                <span className="font-semibold">
                  {breakdown.bottles} Flaschen
                </span>
              </p>

              {lowStock && (
                <p className="text-red-600 text-sm font-medium">
                  ⚠ Mindestbestand erreicht
                </p>
              )}
            </div>

            <button
              onClick={() =>
                setSelectedDrink(drink)
              }
              className="w-full py-2 rounded-xl bg-green-600 text-white"
            >
              Bestand ändern
            </button>
          </div>
        );
      })}

      {/* Modals */}
      {selectedDrink && (
        <EditStockModal
          drink={selectedDrink}
          onClose={() =>
            setSelectedDrink(null)
          }
          onSave={handleSave}
        />
      )}

      {showAddModal && (
        <AddDrinkModal
          onClose={() =>
            setShowAddModal(false)
          }
          onCreated={loadDrinks}
        />
      )}
    </div>
  );
}