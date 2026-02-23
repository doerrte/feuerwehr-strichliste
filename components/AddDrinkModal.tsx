"use client";

import { useState } from "react";

export default function AddDrinkModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [unitsPerCase, setUnitsPerCase] = useState("");
  const [cases, setCases] = useState("");
  const [bottles, setBottles] = useState("");
  const [minStock, setMinStock] = useState("");
  const [error, setError] = useState("");

  function getNumber(value: string) {
    return value ? Number(value) : 0;
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError("Name fehlt");
      return;
    }

    const units = getNumber(unitsPerCase);
    const caseCount = getNumber(cases);
    const bottleCount = getNumber(bottles);
    const min = getNumber(minStock);

    const total = caseCount * units + bottleCount;

    const res = await fetch("/api/drinks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        unitsPerCase: units,
        stock: total,
        minStock: min,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Fehler");
      return;
    }

    onCreated();
  }

  const previewTotal =
    getNumber(cases) * getNumber(unitsPerCase) +
    getNumber(bottles);

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">

        <h2 className="text-xl font-semibold">
          Neues Getränk
        </h2>

        <input
          placeholder="Getränkename"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          placeholder="Flaschen pro Kiste"
          value={unitsPerCase}
          onChange={(e) => setUnitsPerCase(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          placeholder="Anzahl Kisten"
          value={cases}
          onChange={(e) => setCases(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          placeholder="Einzelflaschen"
          value={bottles}
          onChange={(e) => setBottles(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          placeholder="Mindestbestand"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <div className="text-sm text-gray-500">
          Gesamt: <strong>{previewTotal}</strong> Flaschen
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-gray-700"
          >
            Abbrechen
          </button>

          <button
            onClick={handleCreate}
            className="flex-1 py-2 rounded-xl bg-green-600 text-white"
          >
            Erstellen
          </button>
        </div>

      </div>
    </div>
  );
}