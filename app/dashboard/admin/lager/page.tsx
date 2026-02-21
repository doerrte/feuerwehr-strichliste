"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Drink = {
  id: number;
  name: string;
  stock: number;
  active: boolean;
};

export default function LagerPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/drinks");
    const data = await res.json();
    setDrinks(data);
  }

  async function createDrink() {
    if (!name) return;

    await fetch("/api/drinks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    setName("");
    load();
  }

  async function toggleActive(id: number, active: boolean) {
    await fetch(`/api/drinks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: !active }),
    });

    load();
  }

  async function generateQRCode(id: number) {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      window.location.origin;

    const url = `${baseUrl}/scan/${id}`;

    return await QRCode.toDataURL(url);
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">📦 Lagerverwaltung</h1>

      {/* Neues Getränk */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={createDrink}
          className="px-4 py-1 bg-green-600 text-white rounded"
        >
          Erstellen
        </button>
      </div>

      {/* Getränke Liste */}
      <div className="space-y-4">
        {drinks.map((drink) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            toggleActive={toggleActive}
            generateQRCode={generateQRCode}
          />
        ))}
      </div>
    </main>
  );
}

function DrinkCard({
  drink,
  toggleActive,
  generateQRCode,
}: {
  drink: Drink;
  toggleActive: (id: number, active: boolean) => void;
  generateQRCode: (id: number) => Promise<string>;
}) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    async function createQR() {
      const code = await generateQRCode(drink.id);
      setQr(code);
    }

    createQR();
  }, [drink.id]);

  return (
    <div className="border rounded p-4 bg-white shadow space-y-2">
      <div className="font-medium">{drink.name}</div>

      <div className="text-sm text-gray-600">
        Bestand: {drink.stock}
      </div>

      {qr && (
        <img
          src={qr}
          alt="QR Code"
          className="w-28 h-28"
        />
      )}

      <button
        onClick={() =>
          toggleActive(drink.id, drink.active)
        }
        className="text-sm text-red-600"
      >
        {drink.active ? "Deaktivieren" : "Aktivieren"}
      </button>
    </div>
  );
}