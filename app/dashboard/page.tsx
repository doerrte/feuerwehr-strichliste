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
    const [drinksRes, meRes] = await Promise.all([
      fetch("/api/drinks/me", { credentials: "include" }),
      fetch("/api/auth/me", { credentials: "include" }),
    ]);

    const drinksData = await drinksRes.json();
    const meData = await meRes.json();

    setDrinks(drinksData);
    setMe(meData);
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
  <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
    <div
      className="
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-2xl
        rounded-3xl
        shadow-2xl
        border border-white/20 dark:border-gray-800
        px-2 py-2
        overflow-x-auto
        scrollbar-hide
      "
    >
      <div className="flex items-center gap-2 min-w-max">

        {navItems.map((item) => {
          const active = activeHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-shrink-0"
            >
              <div
                className={`
                  relative flex flex-col items-center justify-center gap-1
                  px-4 py-2 rounded-2xl
                  transition-all duration-300
                  ${
                    active
                      ? "text-red-600"
                      : "text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {active && (
                  <div className="absolute inset-0 bg-red-50 dark:bg-red-900/30 rounded-2xl -z-10" />
                )}

                <span
                  className={`text-xl transition-transform duration-300 ${
                    active ? "scale-110" : ""
                  }`}
                >
                  {item.icon}
                </span>

                <span className="text-[11px] font-medium tracking-wide">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}

      </div>
    </div>
  </div>
);

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