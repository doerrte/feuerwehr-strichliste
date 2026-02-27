"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  amount: number;
  stock: number;
  unitsPerCase: number;
  minStock: number;
  image?: string;
};

type Me = {
  id: number;
  name: string;
  role: "USER" | "ADMIN";
};

export default function DashboardPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [confirmDrink, setConfirmDrink] = useState<Drink | null>(null);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    load();
    loadMe();
  }, []);

  async function load() {
  const res = await fetch("/api/drinks/me", {
    credentials: "include",
  });

  if (!res.ok) {
    console.error("Drinks API Fehler");
    setDrinks([]);
    return;
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    setDrinks([]);
    return;
  }

  setDrinks(data);
}

  async function loadMe() {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });
    const data = await res.json();
    setMe(data.user);
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

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drinkId: confirmDrink.id,
        amount,
      }),
    });

    if (!res.ok) {
      alert("Fehler beim Buchen");
      return;
    }

    setInputs((prev) => ({ ...prev, [confirmDrink.id]: "" }));
    setConfirmDrink(null);
    load();
  }

  async function undoLastBooking() {
    const res = await fetch("/api/scan/undo", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Keine Buchung gefunden");
      return;
    }

    load();
  }

  const totalStriche = drinks.reduce(
    (sum, d) => sum + d.amount,
    0
  );

  function getDrinkImage(name: string) {
    const lower = name.toLowerCase();

    if (lower.includes("wasser")) return "/drinks/gerolsteiner.png";
    if (lower.includes("gerolsteiner")) return "/drinks/gerolsteiner.png";
    if (lower.includes("cola")) return "/drinks/cola.png";
    if (lower.includes("bier")) return "/drinks/reissdorf.png";
    if (lower.includes("reissdorf")) return "/drinks/reissdorf.png";
    if (lower.includes("sprite")) return "/drinks/sprite.png";
    if (lower.includes("cola-light")) return "/drinks/cola-light.png";
    if (lower.includes("cola light")) return "/drinks/cola-light.png";
    if (lower.includes("cola zero")) return "/drinks/cola-zero.png";
    if (lower.includes("cola-zero")) return "/drinks/cola-zero.png";
    if (lower.includes("fanta")) return "/drinks/fanta.png";
    if (lower.includes("limo")) return "/drinks/reissdorf.png";



    return "/drinks/default.png";
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Hallo {me?.name}
        </h1>

        <div className="mt-2 inline-flex items-center gap-2 bg-red-600 text-white px-4 py-1 rounded-full text-sm shadow">
          Gesamt-Striche: {totalStriche}
        </div>
      </div>

      {/* Drinks */}
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
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-5 border space-y-4"
            >

              <div className="flex items-center gap-4">
                <img
                  src={drink.image || getDrinkImage(drink.name)}
                  alt={drink.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {drink.name}
                  </h3>

                  <div className="text-sm text-gray-500">
                    🧃 {cases} Kisten · 🍾 {bottles} Flaschen
                  </div>

                  {drink.stock <= drink.minStock && (
                    <div className="text-xs text-yellow-600 mt-1">
                      ⚠ Niedriger Bestand
                    </div>
                  )}
                </div>
              </div>

              {/* Counter */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => changeValue(drink.id, -1)}
                  className="w-12 h-12 rounded-full bg-gray-100 text-xl font-semibold active:scale-90 transition"
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
                  className="w-12 h-12 rounded-full bg-green-600 text-white text-xl font-semibold active:scale-90 transition shadow"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => openConfirm(drink)}
                className="w-full py-3 rounded-2xl bg-red-600 text-white font-medium shadow active:scale-95 transition"
              >
                Buchen
              </button>
            </div>
          );
        })}
      </div>

      {/* Undo Button */}
      <div>
        <button
          onClick={undoLastBooking}
          className="w-full py-3 rounded-2xl border border-red-600 text-red-600 font-medium hover:bg-red-600 hover:text-white transition"
        >
          Letzte Buchung rückgängig
        </button>
      </div>

      {/* Confirm Modal */}
      {confirmDrink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-semibold">
              Buchung bestätigen
            </h3>

            <p className="text-sm text-gray-600">
              {inputs[confirmDrink.id]}x{" "}
              {confirmDrink.name} buchen?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDrink(null)}
                className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800"
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