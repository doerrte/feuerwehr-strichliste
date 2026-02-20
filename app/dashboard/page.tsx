"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Drink = {
  id: number;
  name: string;
  amount: number;
  stock: number;
  unitsPerCase: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [draft, setDraft] = useState<Record<number, number>>({});

  // 🔥 Modal State
  const [confirmDrink, setConfirmDrink] = useState<Drink | null>(null);
  const [confirmAmount, setConfirmAmount] = useState<number>(0);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);

    const meRes = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!meRes.ok) {
      router.replace("/login");
      return;
    }

    const me = await meRes.json();
    setName(me.name);

    const drinksRes = await fetch("/api/drinks/me", {
      credentials: "include",
    });

    const data = await drinksRes.json();
    setDrinks(data);

    const nextDraft: Record<number, number> = {};
    data.forEach((d: Drink) => {
      nextDraft[d.id] = 0;
    });

    setDraft(nextDraft);
    setLoading(false);
  }

  function change(drinkId: number, delta: number) {
    setDraft((d) => ({
      ...d,
      [drinkId]: Math.max(0, (d[drinkId] ?? 0) + delta),
    }));
  }

  // 🔥 Klick auf "Bestätigen" öffnet nur Modal
  function openConfirm(drink: Drink) {
    const value = draft[drink.id];
    if (!value) return;

    setConfirmDrink(drink);
    setConfirmAmount(value);
  }

  async function confirmBooking() {
    if (!confirmDrink) return;

    await fetch("/api/drinks/increment", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        drinkId: confirmDrink.id,
        amount: confirmAmount,
      }),
    });

    setConfirmDrink(null);
    setConfirmAmount(0);

    init();
  }

  if (loading) {
    return <main className="p-6">Lade...</main>;
  }

  const total = drinks.reduce((s, d) => s + d.amount, 0);

  return (
    <main className="p-6 space-y-6">

      <h1 className="text-xl font-bold">
        Hallo {name} 👋
      </h1>

      <div className="text-sm text-gray-600">
        Gesamt getrunken: {total} Flaschen
      </div>

      <section className="bg-white p-4 rounded-xl shadow space-y-4">
        {drinks.map((d) => {
          const stock = d.stock ?? 0;
          const units = d.unitsPerCase || 1;

          const stockCases = Math.floor(d.stock / d.unitsPerCase);
          const stockBottles = d.stock % d.unitsPerCase;

          return (
            <div key={d.id} className="border rounded p-4 space-y-2">
              <div className="font-medium">{d.name}</div>

              <div className="text-sm text-gray-600">
                Bereits getrunken: {d.amount} Flaschen
              </div>

              <div className="text-xs text-gray-500">
                Lagerbestand: {d.stock} Flaschen
              </div>

              <div className="text-xs text-gray-400">
                = {stockCases} Kisten + {stockBottles} Flaschen
              </div>

              <div className="flex gap-2 items-center pt-2">
                <button
                  onClick={() => change(d.id, 1)}
                  className="px-2 border rounded"
                >
                  +
                </button>

                <input
                  type="number"
                  readOnly
                  value={draft[d.id] ?? 0}
                  className="w-14 text-center border rounded"
                />

                <button
                  onClick={() => openConfirm(d)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Bestätigen
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* 🔥 Bestätigungs-Modal */}
      {confirmDrink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow space-y-4 w-80">
            <h2 className="font-bold text-lg">
              Buchung bestätigen
            </h2>

            <p className="text-sm">
              Möchtest du wirklich{" "}
              <strong>{confirmAmount}x {confirmDrink.name}</strong>{" "}
              buchen?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDrink(null)}
                className="px-3 py-1 border rounded"
              >
                Abbrechen
              </button>

              <button
                onClick={confirmBooking}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Ja, buchen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
