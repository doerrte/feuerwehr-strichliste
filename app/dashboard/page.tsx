"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  amount: number;
  stock: number;
  minStock: number;
  unitsPerCase: number;
};

type User = {
  name: string;
};

export default function DashboardPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [confirmDrink, setConfirmDrink] = useState<Drink | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    load();
    loadUser();
  }, []);

  async function load() {
    const res = await fetch("/api/drinks/me", {
      credentials: "include",
    });
    const data = await res.json();
    setDrinks(data);
  }

  async function loadUser() {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
    }
  }

  const totalStriche = drinks.reduce(
    (sum, drink) => sum + drink.amount,
    0
  );

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

  return (
    <div className="space-y-8">

      {/* Header Bereich */}
      <div className="flex justify-between items-center">

        <div>
          <p className="text-sm text-gray-500">
            Hallo {user?.name}
          </p>

          <h2 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h2>
        </div>

        {/* 🔵 Gesamt Badge */}
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg">
            🍺
          </div>

          <span className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 text-red-600 text-xs font-bold px-2 py-1 rounded-full shadow">
            {totalStriche}
          </span>
        </div>

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
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-lg p-6 space-y-4 border"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {drink.name}
                </h3>

                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  Deine Striche: {drink.amount}
                </span>
              </div>

              <div className="text-sm text-gray-500">
                Bestand:{" "}
                <strong>
                  {cases} Kisten + {bottles} Flaschen
                </strong>
              </div>

              {drink.stock <= drink.minStock && (
                <div className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full inline-block">
                  ⚠ Niedriger Bestand
                </div>
              )}

              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  onClick={() => changeValue(drink.id, -1)}
                  className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-xl font-semibold select-none active:scale-90 transition"
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
                  className="w-16 text-center text-lg font-medium bg-transparent outline-none"
                />

                <button
                  onClick={() => changeValue(drink.id, 1)}
                  className="w-12 h-12 rounded-full bg-green-600 text-white text-xl font-semibold select-none active:scale-90 transition shadow-md"
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

      {/* Confirm Modal bleibt wie gehabt */}
      {confirmDrink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-semibold">
              Buchung bestätigen
            </h3>

            <p className="text-sm text-gray-600">
              {inputs[confirmDrink.id]}x {confirmDrink.name} buchen?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDrink(null)}
                className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700"
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