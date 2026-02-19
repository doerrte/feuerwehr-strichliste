"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  count: number;
};

export default function DashboardClient({
  userId,
}: {
  userId: number;
}) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/drinks");

    if (!res.ok) {
      console.error("Fehler beim Laden");
      return;
    }

    const data = await res.json();
    setDrinks(data.drinks);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function increment(drinkId: number) {
    const res = await fetch(
      `/api/drinks/${drinkId}/increment`,
      { method: "POST" }
    );

    if (!res.ok) {
      alert("Fehler beim Zählen");
      return;
    }

    load();
  }

  if (loading) {
    return (
      <main className="p-4">
        <p>Lade Getränke…</p>
      </main>
    );
  }

  return (
    <main className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-4">
        🍺 Meine Strichliste
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {drinks.map((drink) => (
          <button
            key={drink.id}
            onClick={() => increment(drink.id)}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center active:scale-95 transition"
          >
            <span className="text-lg font-semibold">
              {drink.name}
            </span>
            <span className="text-3xl font-bold text-red-600 mt-2">
              {drink.count}
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
