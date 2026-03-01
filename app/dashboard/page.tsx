"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  minStock: number;
  amount: number; // 🔥 deine Striche
};

export default function DashboardPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingAmounts, setBookingAmounts] = useState<
    Record<number, number>
  >({});

  // 🔥 Getränke laden
  useEffect(() => {
    fetchDrinks();
  }, []);

  async function fetchDrinks() {
    try {
      const res = await fetch("/api/drinks/me");
      const data = await res.json();

      setDrinks(data);
    } catch (error) {
      console.error("Drinks API Fehler", error);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 Gesamt-Striche berechnen
  const totalStriche = drinks.reduce(
    (sum, drink) => sum + drink.amount,
    0
  );

  // 🔥 Buchung durchführen
    async function handleBook(drinkId: number) {
    const quantity = bookingAmounts[drinkId] || 1;

    const drink = drinks.find((d) => d.id === drinkId);
    if (!drink) return;

    const confirmed = confirm(
      `Möchtest du wirklich ${quantity}x ${drink.name} buchen?`
    );

    if (!confirmed) return;

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drinkId,
        quantity,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      alert(err?.error || "Fehler beim Buchen");
      return;
    }

    // UI sofort aktualisieren
    setDrinks((prev) =>
      prev.map((d) =>
        d.id === drinkId
          ? {
              ...d,
              amount: d.amount + quantity,
              stock: d.stock - quantity,
            }
          : d
      )
    );

    // Menge zurücksetzen
    setBookingAmounts((prev) => ({
      ...prev,
      [drinkId]: 1,
    }));
  }

  // 🔥 Undo letzte Buchung
  async function handleUndo() {
    const res = await fetch("/api/scan/undo", {
      method: "POST",
    });

    if (!res.ok) {
      alert("Keine Buchung gefunden");
      return;
    }

    // Einfach neu laden (sauberste Lösung)
    fetchDrinks();
  }

  

  if (loading) {
    return (
      <div className="p-6 text-center">
        Lade Dashboard...
      </div>
    );
  }

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
    if (lower.includes("limo")) return "/drinks/fanta.png";
    if (lower.includes("limo weiß")) return "/drinks/sprite.png";
    if (lower.includes("fassbrause zitrone")) return "/drinks/fassbrause-zitrone.png";
    if (lower.includes("fassbrause-zitrone")) return "/drinks/fassbrause-zitrone.png";
    if (lower.includes("fassbrause")) return "/drinks/fassbrause-zitrone.png";
    if (lower.includes("apfelschorle")) return "/drinks/apfelschorle.png";
    if (lower.includes("apfelsaft")) return "/drinks/apfelschorle.png";




    return "/drinks/default.png";
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Hallo 👋
        </h1>

        <div className="mt-2 inline-block bg-red-600 text-white px-4 py-1 rounded-full text-sm">
          Gesamt-Striche: {totalStriche}
        </div>
      </div>

      {/* Getränk Cards */}
      {drinks.map((drink) => (
        <div
          key={drink.id}
          className="rounded-2xl bg-white dark:bg-gray-900 shadow p-5 space-y-4"
        >
          <div className="flex items-center gap-3">

            <img
              src={getDrinkImage(drink.name)}
              alt={drink.name}
              className="w-12 h-12 object-contain"
            />

            <div>
              <h2 className="font-semibold text-lg">
                {drink.name}
              </h2>

              {/* 🔥 Deine Striche */}
              <p className="text-sm text-gray-500">
                Deine Striche:{" "}
                <span className="font-semibold text-red-600">
                  {drink.amount}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Bestand: {drink.stock}
              </p>
            </div>
          </div>

          {/* Menge wählen */}
          <div className="flex items-center justify-center gap-4">

            {/* Minus */}
            <button
              onClick={() =>
                setBookingAmounts((prev) => ({
                  ...prev,
                  [drink.id]:
                    (prev[drink.id] || 1) > 1
                      ? (prev[drink.id] || 1) - 1
                      : 1,
                }))
              }
              className="w-10 h-10 rounded-full bg-gray-200"
            >
              −
            </button>

            {/* 🔥 Direkt editierbares Feld */}
            <input
              type="number"
              min="1"
              value={bookingAmounts[drink.id] || ""}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value));
                setBookingAmounts((prev) => ({
                  ...prev,
                  [drink.id]: value,
                }));
              }}
              className="w-16 text-center text-lg font-semibold border rounded-lg py-1"
            />

            {/* Plus */}
            <button
              onClick={() =>
                setBookingAmounts((prev) => ({
                  ...prev,
                  [drink.id]: (prev[drink.id] || 1) + 1,
                }))
              }
              className="w-10 h-10 rounded-full bg-green-500 text-white"
            >
              +
            </button>

          </div>

          {/* Buchen */}
          <button
            onClick={() => handleBook(drink.id)}
            className="w-full py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Buchen
          </button>
        </div>
      ))}

      {/* Undo Button */}
      <button
        onClick={handleUndo}
        className="w-full py-3 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 transition"
      >
        Letzte Buchung rückgängig
      </button>

    </div>
  );
}