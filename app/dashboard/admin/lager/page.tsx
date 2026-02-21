"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  active: boolean;
};

export default function LagerPage() {
  const router = useRouter();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState(0);
  const [unitsPerCase, setUnitsPerCase] = useState(12);
  const [qrMap, setQrMap] = useState<Record<number, string>>({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/drinks", {
      credentials: "include",
    });

    const data = await res.json();
    setDrinks(data);

    const map: Record<number, string> = {};
    for (const drink of data) {
      const url = `${window.location.origin}/scan/${drink.id}`;
      map[drink.id] = await QRCode.toDataURL(url);
    }
    setQrMap(map);
  }

  async function createDrink() {
    await fetch("/api/admin/drinks", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        stock,
        unitsPerCase,
      }),
    });

    setName("");
    setStock(0);
    load();
  }

  async function toggle(id: number, active: boolean) {
    await fetch("/api/admin/drinks/toggle", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });

    load();
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">📦 Lagerverwaltung</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />

      <button
        onClick={createDrink}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Erstellen
      </button>

      {drinks.map((drink) => (
        <div key={drink.id} className="bg-white p-4 rounded shadow">
          <div className="font-semibold">{drink.name}</div>
          <div>Bestand: {drink.stock}</div>

          {qrMap[drink.id] && (
            <img src={qrMap[drink.id]} className="w-32 mt-2" />
          )}

          <button
            onClick={() => toggle(drink.id, drink.active)}
            className="text-red-600 text-sm mt-2"
          >
            {drink.active ? "Deaktivieren" : "Reaktivieren"}
          </button>
        </div>
      ))}
    </main>
  );
}