"use client";

import { UNSTABLE_REVALIDATE_RENAME_ERROR } from "next/dist/lib/constants";
import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  stock: number;        // Gesamtflaschen
  unitsPerCase: number; // Flaschen pro Kiste
  minStock: number;
  amount: number;       // Deine Striche
};

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [lastBooking, setLastBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingAmounts, setBookingAmounts] =
    useState<Record<number, number | undefined>>({});

  const [confirmBooking, setConfirmBooking] = useState<{
    drinkId: number;
    quantity: number;
  } | null>(null);

  const [confirmUndo, setConfirmUndo] = useState(false);

  useEffect(() => {
    fetchDrinks();
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return;

      const data = await res.json();
      setUsername(data.name);
    } catch (error) {
      console.error("User Fehler", error);
    }
}

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

  const totalStriche = drinks.reduce(
    (sum, drink) => sum + drink.amount,
    0
  );

  // 🟢 Bildlogik
  function getDrinkImage(name: string) {
    const lower = name.toLowerCase();

    if (lower.includes("wasser")) return "/drinks/gerolsteiner.png";
    if (lower.includes("gerolsteiner")) return "/drinks/gerolsteiner.png";
    if (lower.includes("cola")) return "/drinks/cola.png";
    if (lower.includes("bier")) return "/drinks/reissdorf.png";
    if (lower.includes("reissdorf")) return "/drinks/reissdorf.png";
    if (lower.includes("sprite")) return "/drinks/sprite.png";
    if (lower.includes("limo weiß")) return "/drinks/sprite.png";
    if (lower.includes("cola-light")) return "/drinks/cola-light.png";
    if (lower.includes("cola light")) return "/drinks/cola-light.png";
    if (lower.includes("cola zero")) return "/drinks/cola-zero.png";
    if (lower.includes("cola-zero")) return "/drinks/cola-zero.png";
    if (lower.includes("fanta")) return "/drinks/fanta.png";
    if (lower.includes("limo")) return "/drinks/fanta.png";
    if (lower.includes("fassbrause zitrone")) return "/drinks/fassbrause-zitrone.png";
    if (lower.includes("fassbrause-zitrone")) return "/drinks/fassbrause-zitrone.png";
    if (lower.includes("fassbrause-zitrone")) return "/drinks/fassbrause-zitrone.png";
    if (lower.includes("fassbrause")) return "/drinks/fassbrause-zitrone.png";
    if (lower.includes("apfelschorle")) return "/drinks/apfelschorle.png";
    if (lower.includes("apfelsaft")) return "/drinks/apfelschorle.png";




    return "/drinks/default.png";
  }

  // 🟢 Kisten + Restflaschen berechnen
  function getStockBreakdown(stock: number, unitsPerCase: number) {
    const cases = Math.floor(stock / unitsPerCase);
    const bottles = stock % unitsPerCase;
    return { cases, bottles };
  }

  function handleBook(drinkId: number) {
    const quantity = bookingAmounts[drinkId] ?? 1;
    setConfirmBooking({ drinkId, quantity });
  }

  async function executeBooking() {
    if (!confirmBooking) return;

    const { drinkId, quantity } = confirmBooking;

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drinkId, quantity }),
    });

    if (!res.ok) {
      alert("Fehler beim Buchen");
      setConfirmBooking(null);
      return;
    }

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

    setBookingAmounts((prev) => ({
      ...prev,
      [drinkId]: 1,
    }));

    setConfirmBooking(null);
  }

  async function handleUndo() {
    const res = await fetch("/api/scan/undo");

    if(!res.ok) {
      alert("Keine Buchung gefunden");
      return
    }

    const data = await res.json();
    setLastBooking(data);
    setConfirmUndo(true);
  }

  async function executeUndo() {
    const res = await fetch("/api/scan/undo", {
      method: "POST",
    });

    if (!res.ok) {
      alert("Keine Buchung gefunden");
      setConfirmUndo(false);
      return;
    }

    fetchDrinks();
    setConfirmUndo(false);
  }

  if (loading) {
    return <div className="p-6 text-center">Lade Dashboard...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">

      {/* Header */}
      <div>
       <h1 className="text-2xl font-bold">
          Hallo{" "}
          <span className="text-red-600">
            {username}
          </span>{" "}
        </h1>
        <div className="mt-2 inline-block bg-red-600 text-white px-4 py-1 rounded-full text-sm">
          Gesamt-Striche: {totalStriche}
        </div>
      </div>

      {/* Getränk Cards */}
      {drinks.map((drink) => {
        const breakdown = getStockBreakdown(
          drink.stock,
          drink.unitsPerCase
        );

        return (
          <div
            key={drink.id}
            className="rounded-2xl bg-white dark:bg-gray-900 shadow p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={getDrinkImage(drink.name)}
                alt={drink.name}
                className="w-14 h-14 object-contain"
              />

              <div>
                <h2 className="font-semibold text-lg">
                  {drink.name}
                </h2>

                <p className="text-sm text-gray-500">
                  Deine Striche:{" "}
                  <span className="font-semibold text-red-600">
                    {drink.amount}
                  </span>
                </p>

                {/* 🔥 Neuer Bestand */}
                <p className="text-sm text-gray-500">
                  Bestand:
                  <span className="font-semibold ml-1">
                    {breakdown.cases} Kisten
                  </span>
                  {" + "}
                  <span className="font-semibold">
                    {breakdown.bottles} Flaschen
                  </span>
                </p>
              </div>
            </div>

            {/* Mengenwahl */}
            <div className="flex items-center justify-center gap-4">

              <button
                onClick={() =>
                setBookingAmounts((prev) => {
                  const current = prev[drink.id] ?? 1;
                  return {
                    ...prev,
                    [drink.id]: current > 1 ? current - 1 : 1,
                  };
                })
              }
                className="w-10 h-10 rounded-full bg-gray-200"
              >
                −
              </button>

              <input
                type="number"
                min="1"
                placeholder=""
                value={bookingAmounts[drink.id] ?? ""}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setBookingAmounts((prev) => ({
                      ...prev,
                      [drink.id]: undefined,
                    }));
                    return;
                  }

                  const number = Math.max(1, Number(value));

                  setBookingAmounts((prev) => ({
                    ...prev,
                    [drink.id]: number,
                  }));
                }}
                className="w-16 text-center text-lg font-semibold border rounded-lg py-1"
              />

              <button
                onClick={() =>
                  setBookingAmounts((prev) => ({
                    ...prev,
                    [drink.id]:
                      (prev[drink.id] ?? 0) + 1,
                  }))
                }
                className="w-10 h-10 rounded-full bg-green-500 text-white"
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleBook(drink.id)}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-medium"
            >
              Buchen
            </button>
          </div>
        );
      })}

      <button
        onClick={handleUndo}
        className="w-full py-3 rounded-xl border border-red-500 text-red-600"
      >
        Letzte Buchung rückgängig
      </button>

      {/* 🟥 Buchungs Modal */}
      {confirmBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-80 space-y-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-center">
              Buchung bestätigen
            </h2>

            <p className="text-center">
              {confirmBooking.quantity}x{" "}
              {
                drinks.find(
                  (d) => d.id === confirmBooking.drinkId
                )?.name
              }{" "}
              buchen?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBooking(null)}
                className="flex-1 py-2 rounded-xl bg-gray-200"
              >
                Abbrechen
              </button>

              <button
                onClick={executeBooking}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white"
              >
                Buchen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟥 Undo Modal */}
      {confirmUndo && lastBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-80 space-y-4 shadow-2xl">

            <h2 className="text-lg font-semibold text-center">
              Letzte Buchung
            </h2>

            <div className="text-center space-y-1">
              <p className="font-semibold text-red-600">
                {lastBooking.quantity}x {lastBooking.drinkName}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(lastBooking.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirmUndo(false);
                  setLastBooking(null);
                }}
                className="flex-1 py-2 rounded-xl bg-gray-200"
              >
                Abbrechen
              </button>

              <button
                onClick={executeUndo}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white"
              >
                Rückgängig
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}