"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  minStock: number;
  myAmount: number;
};

type Me = {
  id: number;
  name: string;
};

export default function DashboardPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [confirmDrink, setConfirmDrink] = useState<Drink | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
  try {
    const [drinksRes, meRes] = await Promise.all([
      fetch("/api/drinks/me", {
        credentials: "include",
        cache: "no-store",
      }),
      fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      }),
    ]);

    if (drinksRes.ok) {
      const drinksData = await drinksRes.json();
      setDrinks(drinksData);
    }

    if (meRes.ok) {
      const meData = await meRes.json();
      setMe(meData.user); // 🔥 HIER
    }
  } catch (err) {
    console.error("LOAD ERROR:", err);
  }
}

  function changeValue(id: number, delta: number) {
    setInputs((prev) => {
      const current = Number(prev[id] || 0);
      const next = current + delta;
      return { ...prev, [id]: next <= 0 ? "" : String(next) };
    });
  }

  function openConfirm(drink: Drink) {
    if (!inputs[drink.id]) return;
    setConfirmDrink(drink);
  }

  async function confirmBooking() {
    if (!confirmDrink) return;

    const amount = Number(inputs[confirmDrink.id]);

    await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drinkId: confirmDrink.id,
        amount,
      }),
    });

    setInputs((prev) => ({ ...prev, [confirmDrink.id]: "" }));
    setConfirmDrink(null);
    load();
  }

  const totalStriche = drinks.reduce(
    (sum, d) => sum + (d.myAmount || 0),
    0
  );

  return (
    <div className="space-y-8 pb-28">

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Hallo {me?.name}
            </p>
            <h1 className="text-2xl font-bold">
              Dashboard
            </h1>
          </div>

          <div className="bg-red-600 text-white px-4 py-2 rounded-2xl shadow-lg text-sm font-semibold">
            {totalStriche} Striche
          </div>
        </div>

        <p className="text-gray-500 text-sm">
          Getränke buchen & Überblick behalten
        </p>
      </div>

      {/* Drink Cards */}
      <div className="space-y-6">
        {drinks.map((drink) => {
          const cases = Math.floor(
            drink.stock / drink.unitsPerCase
          );
          const bottles =
            drink.stock % drink.unitsPerCase;

          return (
            <div
              key={drink.id}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 space-y-5 border border-gray-100 dark:border-gray-800 backdrop-blur-xl"
            >
              <div className="flex justify-between items-start">

                <div>
                  <h3 className="text-lg font-semibold">
                    {drink.name}
                  </h3>

                  {drink.myAmount > 0 && (
                    <div className="mt-2 inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                      Deine Striche: {drink.myAmount}
                    </div>
                  )}
                </div>

                {drink.stock <= drink.minStock && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                    ⚠ Niedriger Bestand
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <div>
                  Bestand:{" "}
                  <span className="font-medium">
                    {cases} Kisten + {bottles} Flaschen
                  </span>
                </div>
              </div>

              {/* Counter */}
              <div className="flex items-center justify-center gap-8">

                <button
                  onClick={() =>
                    changeValue(drink.id, -1)
                  }
                  className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 text-xl font-semibold active:scale-90 transition"
                >
                  −
                </button>

                <input
                  type="number"
                  value={inputs[drink.id] || ""}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      [drink.id]: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="w-16 text-center text-lg font-semibold bg-transparent outline-none"
                />

                <button
                  onClick={() =>
                    changeValue(drink.id, 1)
                  }
                  className="w-12 h-12 rounded-full bg-green-600 text-white text-xl font-semibold shadow-md active:scale-90 transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => openConfirm(drink)}
                className="w-full py-3 rounded-2xl bg-red-600 text-white font-medium active:scale-[0.98] transition shadow-md"
              >
                Buchen
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {confirmDrink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-semibold">
              Buchung bestätigen
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {inputs[confirmDrink.id]}x{" "}
              {confirmDrink.name} buchen?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDrink(null)}
                className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-gray-800"
              >
                Abbrechen
              </button>

              <button
                onClick={confirmBooking}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white"
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