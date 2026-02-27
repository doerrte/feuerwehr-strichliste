"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function AddDrinkModal({
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [cases, setCases] = useState("");
  const [unitsPerCase, setUnitsPerCase] = useState("");
  const [bottles, setBottles] = useState("");
  const [minStock, setMinStock] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onlyNumbers(value: string) {
    return value.replace(/\D/g, "");
  }

  function getImageForDrink(name: string) {
    const lower = name.toLowerCase();

    if (lower.includes("wasser")) return "/drinks/gerolsteiner.png";
    if (lower.includes("gerolsteiner")) return "/drinks/gerolsteiner.png";
    if (lower.includes("cola")) return "/drinks/cola.png";
    if (lower.includes("coca-cola")) return "/drinks/cola.png";
    if (lower.includes("coca cola")) return "/drinks/cola.png";
    if (lower.includes("bier")) return "/drinks/reissdorf.png";
    if (lower.includes("reissdorf")) return "/drinks/reissdorf.png";
    if (lower.includes("sprite")) return "/drinks/sprite.png";
    if (lower.includes("cola-light")) return "/drinks/cola-light.png";
    if (lower.includes("coca-cola-light")) return "/drinks/cola-light.png";
    if (lower.includes("coca cola-light")) return "/drinks/cola-light.png";
    if (lower.includes("coca cola light")) return "/drinks/cola-light.png";
    if (lower.includes("cola light")) return "/drinks/cola-light.png";
    if (lower.includes("cola zero")) return "/drinks/cola-zero.png";
    if (lower.includes("cola-zero")) return "/drinks/cola-zero.png";
    if (lower.includes("coca-cola zero")) return "/drinks/cola-zero.png";
    if (lower.includes("coca-cola-zero")) return "/drinks/cola-zero.png";
    if (lower.includes("coca cola zero")) return "/drinks/cola-zero.png";
    if (lower.includes("fanta")) return "/drinks/fanta.png";
    if (lower.includes("limo")) return "/drinks/fanta.png";
    if (lower.includes("limo weiß")) return "/drinks/sprite.png";

    return "/drinks/default.png";
  }

  async function handleCreate() {
    setError("");

    const parsedCases = Number(cases) || 0;
    const parsedUnitsPerCase = Number(unitsPerCase);
    const parsedBottles = Number(bottles) || 0;
    const parsedMinStock = Number(minStock) || 0;

    if (!name || !parsedUnitsPerCase) {
      setError("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    const totalStock =
      parsedCases * parsedUnitsPerCase + parsedBottles;

    setLoading(true);

    const res = await fetch("/api/drinks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        stock,
        unitsPerCase,
        minStock,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      alert(errorData?.error || "Fehler beim Erstellen");
      return;
    }

    onClose();
    window.location.reload();

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Fehler beim Erstellen");
      setLoading(false);
      return;
    }

    setLoading(false);
    onCreated();
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 space-y-6 animate-fadeIn">

        <h2 className="text-xl font-semibold text-center">
          Neues Getränk anlegen
        </h2>

        {/* Getränkename */}
        <div>
          <label className="text-sm font-medium">
            Getränkename
          </label>
          <input
            type="text"
            placeholder="z.B. Gerolsteiner Wasser"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-3 rounded-xl border bg-transparent"
          />
        </div>

        {/* Kisten */}
        <div>
          <label className="text-sm font-medium">
            Anzahl Kisten
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="z.B. 5"
            value={cases}
            onChange={(e) =>
              setCases(onlyNumbers(e.target.value))
            }
            className="w-full mt-1 p-3 rounded-xl border bg-transparent"
          />
        </div>

        {/* Einheiten pro Kiste */}
        <div>
          <label className="text-sm font-medium">
            Flaschen pro Kiste *
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="z.B. 12"
            value={unitsPerCase}
            onChange={(e) =>
              setUnitsPerCase(onlyNumbers(e.target.value))
            }
            className="w-full mt-1 p-3 rounded-xl border bg-transparent"
          />
        </div>

        {/* Einzel-Flaschen */}
        <div>
          <label className="text-sm font-medium">
            Einzelne Flaschen
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="z.B. 3"
            value={bottles}
            onChange={(e) =>
              setBottles(onlyNumbers(e.target.value))
            }
            className="w-full mt-1 p-3 rounded-xl border bg-transparent"
          />
        </div>

        {/* Mindestbestand */}
        <div>
          <label className="text-sm font-medium">
            Mindestbestand
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="z.B. 10"
            value={minStock}
            onChange={(e) =>
              setMinStock(onlyNumbers(e.target.value))
            }
            className="w-full mt-1 p-3 rounded-xl border bg-transparent"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800"
          >
            Abbrechen
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            {loading ? "Speichert..." : "Erstellen"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}