"use client";

import { useEffect, useState } from "react";
import EditStockModal from "@/components/EditStockModal";

type Drink = {
  id: number;
  name: string;
  stock: number;        // Gesamtflaschen
  unitsPerCase: number; // Flaschen pro Kiste
  minStock: number;
};

export default function LagerPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrink, setSelectedDrink] =
    useState<Drink | null>(null);

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

      <h1 className="text-2xl font-bold">
        📦 Lagerverwaltung
      </h1>

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
            className={`rounded-2xl shadow p-5 space-y-3 ${
              lowStock
                ? "bg-red-50 border border-red-300"
                : "bg-white dark:bg-gray-900"
            }`}
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

      {selectedDrink && (
        <EditStockModal
          drink={selectedDrink}
          onClose={() =>
            setSelectedDrink(null)
          }
          onSave={handleSave}
        />
      )}
    </div>
  );
}