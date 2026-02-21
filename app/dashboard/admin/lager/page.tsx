"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  active: boolean;
};

export default function LagerPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [name, setName] = useState("");
  const [cases, setCases] = useState(0);
  const [unitsPerCase, setUnitsPerCase] = useState(0);
  const [extraBottles, setExtraBottles] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/drinks");
    const data = await res.json();
    setDrinks(data);
  }

  async function createDrink() {
    await fetch("/api/drinks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        cases,
        unitsPerCase,
        extraBottles,
      }),
    });

    setName("");
    setCases(0);
    setUnitsPerCase(0);
    setExtraBottles(0);

    load();
  }

  async function generateQRCode(id: number) {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      window.location.origin;

    return QRCode.toDataURL(`${base}/scan/${id}`);
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        📦 Lagerverwaltung
      </h1>

      {/* Neues Getränk */}
      <div className="grid gap-2 bg-white p-4 rounded shadow">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Kisten"
          value={cases}
          onChange={(e) => setCases(Number(e.target.value))}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Flaschen pro Kiste"
          value={unitsPerCase}
          onChange={(e) =>
            setUnitsPerCase(Number(e.target.value))
          }
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Einzelflaschen"
          value={extraBottles}
          onChange={(e) =>
            setExtraBottles(Number(e.target.value))
          }
          className="border p-2 rounded"
        />

        <button
          onClick={createDrink}
          className="bg-green-600 text-white py-2 rounded"
        >
          Erstellen
        </button>
      </div>

      {/* Bestehende Getränke */}
      <div className="space-y-4">
        {drinks.map((drink) => {
          const stockCases = Math.floor(
            drink.stock / drink.unitsPerCase
          );
          const stockBottles =
            drink.stock % drink.unitsPerCase;

          return (
            <DrinkCard
              key={drink.id}
              drink={drink}
              stockCases={stockCases}
              stockBottles={stockBottles}
              generateQRCode={generateQRCode}
            />
          );
        })}
      </div>
    </main>
  );
}

function DrinkCard({
  drink,
  stockCases,
  stockBottles,
  generateQRCode,
}: any) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    generateQRCode(drink.id).then(setQr);
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <div className="font-bold">{drink.name}</div>

      <div className="text-sm">
        Bestand: {drink.stock} Flaschen
      </div>

      <div className="text-xs text-gray-500">
        = {stockCases} Kisten + {stockBottles} Flaschen
      </div>

      {qr && (
        <img src={qr} className="w-28 h-28" />
      )}
    </div>
  );
}