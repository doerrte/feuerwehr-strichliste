"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  qr?: string;
};

export default function LagerPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);

  const [newDrink, setNewDrink] = useState({
    name: "",
    unitsPerCase: 12,
    cases: 0,
    singleBottles: 0,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
  const res = await fetch("/api/drinks");
  const data = await res.json();

  const drinksWithQR = await Promise.all(
    data.map(async (drink: Drink) => {
      try {
        const qrRes = await fetch(
        `/api/drinks/${drink.id}/qr`,
        { cache: "no-store" }
        );

        if (!qrRes.ok) return drink;

        const qrData = await qrRes.json();

        return {
          ...drink,
          qr: qrData.qr,
        };
      } catch {
        return drink;
      }
    })
  );

  setDrinks(drinksWithQR);
}
  async function addDrink() {
    if (!newDrink.name) return;

    await fetch("/api/drinks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDrink),
    });

    setNewDrink({
      name: "",
      unitsPerCase: 12,
      cases: 0,
      singleBottles: 0,
    });

    load();
  }

  async function refill(id: number) {
    const amount = Number(
      prompt("Wie viele Flaschen hinzufügen?")
    );

    if (!amount) return;

    const drink = drinks.find(d => d.id === id);
    if (!drink) return;

    await fetch(`/api/drinks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stock: drink.stock + amount,
      }),
    });

    load();
  }

  async function deleteDrink(id: number) {
    if (!confirm("Wirklich löschen?")) return;

    await fetch(`/api/drinks/${id}`, {
      method: "DELETE",
    });

    load();
  }

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-xl font-bold">
        📦 Lagerverwaltung
      </h1>

      {/* Neues Getränk */}
      <section className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold">
          Neues Getränk hinzufügen
        </h2>

        <div className="space-y-3">

          <div>
            <label className="block text-sm font-medium">
              Getränkename
            </label>
            <input
              value={newDrink.name}
              onChange={(e) =>
                setNewDrink({
                  ...newDrink,
                  name: e.target.value,
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Flaschen pro Kasten
            </label>
            <input
              type="number"
              value={newDrink.unitsPerCase}
              onChange={(e) =>
                setNewDrink({
                  ...newDrink,
                  unitsPerCase: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Anzahl Kästen
            </label>
            <input
              type="number"
              value={newDrink.cases}
              onChange={(e) =>
                setNewDrink({
                  ...newDrink,
                  cases: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Zusätzliche Einzelflaschen
            </label>
            <input
              type="number"
              value={newDrink.singleBottles}
              onChange={(e) =>
                setNewDrink({
                  ...newDrink,
                  singleBottles: Number(e.target.value),
                })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="text-sm text-gray-600">
            Gesamtbestand:{" "}
            {newDrink.unitsPerCase *
              newDrink.cases +
              newDrink.singleBottles}{" "}
            Flaschen
          </div>

          <button
            onClick={addDrink}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Getränk erstellen
          </button>

        </div>
      </section>

      {/* Bestehende Getränke */}
      <section className="space-y-4">
        {drinks.map((drink) => {
          const cases =
            drink.unitsPerCase > 0
              ? Math.floor(
                  drink.stock / drink.unitsPerCase
                )
              : 0;

          const bottles =
            drink.unitsPerCase > 0
              ? drink.stock % drink.unitsPerCase
              : drink.stock;

            {drink.qr && (
              <img
                src={drink.qr}
                alt="QR Code"
                className="w-32 mt-2"
              />
            )}

          return (
            <div
              key={drink.id}
              className="bg-white p-4 rounded shadow space-y-2"
            >
              <div className="font-bold">
                {drink.name}
              </div>

              <div className="text-sm">
                Bestand: {drink.stock} Flaschen
              </div>

              <div className="text-xs text-gray-500">
                = {cases} Kisten + {bottles} Flaschen
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() =>
                    refill(drink.id)
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Auffüllen
                </button>

                <button
                  onClick={() =>
                    deleteDrink(drink.id)
                  }
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Löschen
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}