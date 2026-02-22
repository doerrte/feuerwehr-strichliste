"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  minStock: number;
};

export default function LagerPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [refillDrink, setRefillDrink] =
    useState<Drink | null>(null);

  const [refillData, setRefillData] =
    useState({
      cases: "",
      singleBottles: "",
    });

  const [newDrink, setNewDrink] =
    useState({
      name: "",
      unitsPerCase: "",
      cases: "",
      singleBottles: "",
      minStock: "",
    });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/drinks");
    const data = await res.json();
    setDrinks(data);
  }

  async function addDrink() {
    if (!newDrink.name || !newDrink.unitsPerCase)
      return;

    await fetch("/api/drinks", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        name: newDrink.name,
        unitsPerCase: Number(
          newDrink.unitsPerCase
        ),
        cases: Number(
          newDrink.cases || 0
        ),
        singleBottles: Number(
          newDrink.singleBottles || 0
        ),
        minStock: Number(
          newDrink.minStock || 10
        ),
      }),
    });

    setNewDrink({
      name: "",
      unitsPerCase: "",
      cases: "",
      singleBottles: "",
      minStock: "",
    });

    load();
  }

  function openRefill(drink: Drink) {
    setRefillDrink(drink);
    setRefillData({
      cases: "",
      singleBottles: "",
    });
  }

  async function confirmRefill() {
    if (!refillDrink) return;

    const added =
      Number(refillData.cases || 0) *
        refillDrink.unitsPerCase +
      Number(refillData.singleBottles || 0);

    if (added <= 0) return;

    await fetch(
      `/api/drinks/${refillDrink.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          stock:
            refillDrink.stock +
            added,
        }),
      }
    );

    setRefillDrink(null);
    load();
  }

  async function deleteDrink(id: number) {
    if (!confirm("Wirklich löschen?"))
      return;

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

          <input
            placeholder="Getränkename"
            value={newDrink.name}
            onChange={(e) =>
              setNewDrink({
                ...newDrink,
                name: e.target.value,
              })
            }
            className="border p-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Flaschen pro Kasten"
            value={newDrink.unitsPerCase}
            onChange={(e) =>
              setNewDrink({
                ...newDrink,
                unitsPerCase:
                  e.target.value,
              })
            }
            className="border p-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Anzahl Kästen"
            value={newDrink.cases}
            onChange={(e) =>
              setNewDrink({
                ...newDrink,
                cases:
                  e.target.value,
              })
            }
            className="border p-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Einzelflaschen"
            value={newDrink.singleBottles}
            onChange={(e) =>
              setNewDrink({
                ...newDrink,
                singleBottles:
                  e.target.value,
              })
            }
            className="border p-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Mindestbestand Flaschen (Warnung)"
            value={newDrink.minStock}
            onChange={(e) =>
              setNewDrink({
                ...newDrink,
                minStock:
                  e.target.value,
              })
            }
            className="border p-2 rounded w-full"
          />

          <div className="text-sm text-gray-600">
            Gesamtbestand:{" "}
            {newDrink.unitsPerCase &&
            newDrink.cases
              ? Number(
                  newDrink.unitsPerCase
                ) *
                  Number(newDrink.cases) +
                Number(
                  newDrink.singleBottles ||
                    0
                )
              : 0}{" "}
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
            Math.floor(
              drink.stock /
                drink.unitsPerCase
            );

          const bottles =
            drink.stock %
            drink.unitsPerCase;

          const isLow =
            drink.stock <=
            drink.minStock;

          const isEmpty =
            drink.stock === 0;

          return (
            <div
              key={drink.id}
              className="bg-white p-4 rounded shadow space-y-2"
            >
              <div className="flex justify-between">
                <div className="font-bold">
                  {drink.name}
                </div>

                {isEmpty && (
                  <span className="text-red-600 font-bold">
                    🔴 Leer
                  </span>
                )}

                {!isEmpty &&
                  isLow && (
                    <span className="text-yellow-600 font-bold">
                      🟡 Niedrig
                    </span>
                  )}
              </div>

              <div
                className={`text-sm font-medium ${
                  isLow
                    ? "text-red-600"
                    : ""
                }`}
              >
                Bestand: {drink.stock}{" "}
                Flaschen
              </div>

              <div className="text-xs text-gray-500">
                = {cases} Kisten +{" "}
                {bottles} Flaschen
              </div>

              {isLow && (
                <div className="text-xs text-red-600 font-semibold">
                  ⚠️ Mindestbestand unterschritten!
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() =>
                    openRefill(drink)
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

      {/* Refill Modal */}
      {refillDrink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow space-y-4 w-96">

            <h2 className="font-bold">
              Auffüllen –{" "}
              {refillDrink.name}
            </h2>

            <input
              type="number"
              placeholder="Kästen"
              value={refillData.cases}
              onChange={(e) =>
                setRefillData({
                  ...refillData,
                  cases:
                    e.target.value,
                })
              }
              className="border p-2 rounded w-full"
            />

            <input
              type="number"
              placeholder="Einzelflaschen"
              value={
                refillData.singleBottles
              }
              onChange={(e) =>
                setRefillData({
                  ...refillData,
                  singleBottles:
                    e.target.value,
                })
              }
              className="border p-2 rounded w-full"
            />

            <div className="text-sm">
              Zuwachs:{" "}
              {Number(
                refillData.cases || 0
              ) *
                refillDrink.unitsPerCase +
                Number(
                  refillData.singleBottles ||
                    0
                )}{" "}
              Flaschen
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setRefillDrink(null)
                }
                className="border px-3 py-1 rounded"
              >
                Abbrechen
              </button>

              <button
                onClick={confirmRefill}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Bestätigen
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}