"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Drink = {
  id: number;
  name: string;
  amount: number;
  stock: number;
  unitsPerCase: number;
  minStock: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const [confirmDrink, setConfirmDrink] =
    useState<Drink | null>(null);
  const [confirmAmount, setConfirmAmount] =
    useState<number>(0);

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);

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

    const nextDraft: Record<number, string> = {};
    data.forEach((d: Drink) => {
      nextDraft[d.id] = "";
    });

    setDraft(nextDraft);
    setLoading(false);
  }

  /* ------------------- Normal Buttons ------------------- */

  function increment(id: number) {
    const current = Number(draft[id] || 0);
    setDraft((d) => ({
      ...d,
      [id]: String(current + 1),
    }));
  }

  function decrement(id: number) {
    const current = Number(draft[id] || 0);

    if (current <= 1) {
      setDraft((d) => ({
        ...d,
        [id]: "",
      }));
      return;
    }

    setDraft((d) => ({
      ...d,
      [id]: String(current - 1),
    }));
  }

  function changeValue(id: number, value: string) {
    setDraft((d) => ({
      ...d,
      [id]: value,
    }));
  }

  /* ------------------- Schnellbuchung ------------------- */

  function handlePressStart(drink: Drink) {
    longPressTriggered.current = false;

    pressTimer.current = setTimeout(async () => {
      longPressTriggered.current = true;
      await quickBook(drink);
    }, 700);
  }

  function handlePressEnd() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  }

  async function quickBook(drink: Drink) {
    if (drink.stock <= 0) return;

    await fetch("/api/drinks/increment", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        drinkId: drink.id,
        amount: 1,
      }),
    });

    setFlashMessage(`+1 ${drink.name} gebucht`);
    setTimeout(() => setFlashMessage(null), 1500);

    init();
  }

  /* ------------------- Modal Buchung ------------------- */

  function openConfirm(drink: Drink) {
    const value = Number(draft[drink.id]);
    if (!value || value <= 0) return;

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
  const hasLowStock = drinks.some((d) => d.stock <= d.minStock);

  return (
    <main className="p-6 space-y-6">

      <h1 className="text-xl font-bold">
        Hallo {name} 👋
      </h1>

      {hasLowStock && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded">
          ⚠️ Einige Getränke haben niedrigen Lagerbestand!
        </div>
      )}

      {flashMessage && (
        <div className="bg-green-100 text-green-800 p-2 rounded text-center">
          {flashMessage}
        </div>
      )}

      <div className="text-sm text-gray-600">
        Gesamt getrunken: {total} Flaschen
      </div>

      <section className="bg-white p-4 rounded-xl shadow space-y-4">
        {drinks.map((d) => {
          const cases = Math.floor(d.stock / d.unitsPerCase);
          const bottles = d.stock % d.unitsPerCase;
          const isLow = d.stock <= d.minStock;
          const isEmpty = d.stock === 0;

          return (
            <div key={d.id} className="border rounded p-4 space-y-2">
              <div className="font-medium">{d.name}</div>

              <div className="text-sm text-gray-600">
                Bereits getrunken: {d.amount}
              </div>

              <div className={`text-xs font-medium ${isLow ? "text-red-600" : "text-gray-600"}`}>
                Lagerbestand: {d.stock}
              </div>

              {isEmpty && (
                <div className="text-red-600 text-xs font-semibold">
                  🔴 Leer
                </div>
              )}

              {!isEmpty && isLow && (
                <div className="text-yellow-600 text-xs font-semibold">
                  🟡 Niedrig
                </div>
              )}

              <div className="text-xs text-gray-400">
                = {cases} Kisten + {bottles} Flaschen
              </div>

              <div className="flex gap-2 items-center pt-2">
                <button
                  onClick={() => decrement(d.id)}
                  className="px-2 border rounded"
                >
                  –
                </button>

                <input
                  type="number"
                  min="1"
                  placeholder="Anzahl"
                  value={draft[d.id] ?? ""}
                  onChange={(e) => changeValue(d.id, e.target.value)}
                  className="w-20 text-center border rounded p-1"
                />

                <button
                  onClick={() => {
                    if (!longPressTriggered.current) increment(d.id);
                  }}
                  onMouseDown={() => handlePressStart(d)}
                  onMouseUp={handlePressEnd}
                  onTouchStart={() => handlePressStart(d)}
                  onTouchEnd={handlePressEnd}
                  className="px-2 border rounded"
                >
                  +
                </button>

                <button
                  onClick={() => openConfirm(d)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Buchen
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {confirmDrink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow space-y-4 w-80">
            <h2 className="font-bold text-lg">
              Buchung bestätigen
            </h2>

            <p className="text-sm">
              Möchtest du wirklich{" "}
              <strong>
                {confirmAmount}x {confirmDrink.name}
              </strong>{" "}
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