"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
};

export default function LagerPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selected, setSelected] = useState<Drink | null>(null);

  const [cases, setCases] = useState("");
  const [bottles, setBottles] = useState("");

  const [name, setName] = useState("");
  const [unitsPerCase, setUnitsPerCase] = useState("");
  const [newCases, setNewCases] = useState("");
  const [newBottles, setNewBottles] = useState("");

  useEffect(() => {
    loadDrinks();
  }, []);

  async function loadDrinks() {
    const res = await fetch("/api/admin/drinks");
    if (!res.ok) return;

    const data = await res.json();
    setDrinks(data);
  }

  /* ----------------------------- */
  /*  NEUES GETRÄNK ERSTELLEN     */
  /* ----------------------------- */

  async function createDrink() {
    if (!name.trim() || !unitsPerCase) {
      alert("Name und Flaschen pro Kiste erforderlich");
      return;
    }

    const total =
      (Number(newCases) || 0) * Number(unitsPerCase) +
      (Number(newBottles) || 0);

    const res = await fetch("/api/admin/drinks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        unitsPerCase: Number(unitsPerCase),
        stock: total,
      }),
    });

    if (!res.ok) {
      alert("Fehler beim Anlegen");
      return;
    }

    setName("");
    setUnitsPerCase("");
    setNewCases("");
    setNewBottles("");

    loadDrinks();
  }

  /* ----------------------------- */
  /*  MODAL ÖFFNEN                */
  /* ----------------------------- */

  function openModal(drink: Drink) {
    setSelected(drink);

    const calcCases = Math.floor(drink.stock / drink.unitsPerCase);
    const calcBottles = drink.stock % drink.unitsPerCase;

    setCases(String(calcCases));
    setBottles(String(calcBottles));
  }

  function closeModal() {
    setSelected(null);
  }

  /* ----------------------------- */
  /*  BESTAND AKTUALISIEREN       */
  /* ----------------------------- */

  async function updateStock() {
    if (!selected) return;

    const total =
      (Number(cases) || 0) * selected.unitsPerCase +
      (Number(bottles) || 0);

    const res = await fetch("/api/admin/drinks/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        drinkId: selected.id,
        stock: total,
      }),
    });

    if (!res.ok) {
      alert("Fehler beim Aktualisieren");
      return;
    }

    closeModal();
    loadDrinks();
  }

  /* ----------------------------- */
  /*  GETRÄNK LÖSCHEN             */
  /* ----------------------------- */

  async function deleteDrink(id: number) {
    if (!confirm("Getränk wirklich löschen?")) return;

    const res = await fetch("/api/admin/drinks/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ drinkId: id }),
    });

    if (!res.ok) {
      alert("Fehler beim Löschen");
      return;
    }

    loadDrinks();
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        📦 Lagerverwaltung
      </h1>

      {/* Neues Getränk */}
      <section className="bg-white p-4 rounded-xl shadow space-y-3">
        <h2 className="font-medium">
          Neues Getränk
        </h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Flaschen pro Kiste"
          type="number"
          value={unitsPerCase}
          onChange={(e) => setUnitsPerCase(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Kisten"
          type="number"
          value={newCases}
          onChange={(e) => setNewCases(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Flaschen"
          type="number"
          value={newBottles}
          onChange={(e) => setNewBottles(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={createDrink}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Anlegen
        </button>
      </section>

      {/* Lagerübersicht */}
      <section className="space-y-3">
        {drinks.map((d) => {
          const cases = Math.floor(d.stock / d.unitsPerCase);
          const bottles = d.stock % d.unitsPerCase;

          return (
            <div
              key={d.id}
              className="bg-white p-3 rounded shadow flex justify-between items-center"
            >
              <div
                className="cursor-pointer"
                onClick={() => openModal(d)}
              >
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-gray-600">
                  {cases} Kisten + {bottles} Flaschen
                </div>
              </div>

              <button
                onClick={() => deleteDrink(d.id)}
                className="text-red-600"
              >
                Löschen
              </button>
            </div>
          );
        })}
      </section>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80 space-y-4">
            <h2 className="font-bold">
              Bestand ändern
            </h2>

            <input
              type="number"
              value={cases}
              onChange={(e) => setCases(e.target.value)}
              placeholder="Kisten"
              className="w-full border p-2 rounded"
            />

            <input
              type="number"
              value={bottles}
              onChange={(e) => setBottles(e.target.value)}
              placeholder="Flaschen"
              className="w-full border p-2 rounded"
            />

            <div className="flex justify-between">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded"
              >
                Abbrechen
              </button>

              <button
                onClick={updateStock}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
