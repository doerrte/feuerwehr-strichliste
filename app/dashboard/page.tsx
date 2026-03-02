"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  minStock: number;
  amount: number;
};

export default function DashboardPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrinks();
  }, []);

  async function fetchDrinks() {
    const res = await fetch("/api/drinks/me");
    const data = await res.json();
    setDrinks(data);
    setLoading(false);
  }

  const totalStriche = drinks.reduce(
    (sum, drink) => sum + drink.amount,
    0
  );

  function getStockBreakdown(stock: number, unitsPerCase: number) {
    const cases = Math.floor(stock / unitsPerCase);
    const bottles = stock % unitsPerCase;
    return { cases, bottles };
  }

  if (loading) {
    return <div className="p-6 text-center">Lade...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 animate-fadeIn">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Hallo Admin
        </h1>

        <div className="
          mt-2
          inline-block
          bg-gradient-to-r
          from-feuerwehr-red
          to-feuerwehr-redDark
          text-white
          px-4
          py-1
          rounded-full
          text-sm
          shadow-glow
        ">
          Gesamt-Striche: {totalStriche}
        </div>
      </div>

      {drinks.map((drink) => {
        const breakdown = getStockBreakdown(
          drink.stock,
          drink.unitsPerCase
        );

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
              space-y-4
            "
          >
            <div>
              <h2 className="font-semibold text-lg">
                {drink.name}
              </h2>

              <p className="text-sm text-gray-500">
                Deine Striche:{" "}
                <span className="text-feuerwehr-red font-semibold">
                  {drink.amount}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Bestand:
                <span className="font-semibold ml-1">
                  {breakdown.cases} Kisten
                </span>{" "}
                +{" "}
                <span className="font-semibold">
                  {breakdown.bottles} Flaschen
                </span>
              </p>
            </div>

            <button
              className="
                w-full
                py-3
                rounded-xl
                bg-feuerwehr-red
                hover:bg-feuerwehr-redDark
                text-white
                font-medium
                shadow-md
                hover:shadow-glow
                active:scale-95
              "
            >
              Buchen
            </button>
          </div>
        );
      })}
    </div>
  );
}