"use client";

import { useState } from "react";

export default function EditStockModal({
  drink,
  onClose,
  onSave,
}: {
  drink: any;
  onClose: () => void;
  onSave: (stock: number) => void;
}) {
  const [cases, setCases] = useState(
    Math.floor(drink.stock / drink.unitsPerCase)
  );
  const [bottles, setBottles] = useState(
    drink.stock % drink.unitsPerCase
  );

  const total =
    cases * drink.unitsPerCase + bottles;

  async function handleDelete() {
  if (!drink) return;

  const confirmed = confirm(
    `Willst du ${drink.name} wirklich löschen?`
  );

  if (!confirmed) return;

  const res = await fetch(`/api/drinks/${drink.id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    alert("Fehler beim Löschen");
    return;
  }

  onClose();
  window.location.reload(); // oder load() wenn vorhanden
}  

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-6 animate-in fade-in zoom-in-95">

        <h2 className="text-xl font-semibold">
          Bestand ändern
        </h2>

        <div className="space-y-4">

          <input
            type="number"
            value={cases}
            onChange={(e) =>
              setCases(Number(e.target.value))
            }
            placeholder="Kisten"
            className="w-full border p-3 rounded-xl"
          />

          <input
            type="number"
            value={bottles}
            onChange={(e) =>
              setBottles(Number(e.target.value))
            }
            placeholder="Flaschen"
            className="w-full border p-3 rounded-xl"
          />

          <div className="text-sm text-gray-500">
            Gesamt: <strong>{cases}</strong> Kästen <strong>{bottles}</strong>  Flaschen
          </div>

        </div>

        <div className="flex gap-3 pt-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-gray-700"
          >
            Abbrechen
          </button>

          <button
            onClick={() => onSave(total)}
            className="flex-1 py-2 rounded-xl bg-green-600 text-white"
          >
            Speichern
          </button>

          <button
            onClick={handleDelete}
            className="w-full py-3 rounded-2xl bg-red-600 text-white font-medium mt-4"
          >
            Getränk löschen
          </button>
        </div>

      </div>

    </div>
  );
}