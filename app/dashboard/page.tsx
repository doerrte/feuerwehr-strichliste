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
  const [confirmDrink, setConfirmDrink] =
    useState<Drink | null>(null);
  const [confirmAmount, setConfirmAmount] =
    useState<number>(0);

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

    const drinksRes = await fetch(
      "/api/drinks/me",
      {
        credentials: "include",
        cache: "no-store",
      }
    );

    const data = await drinksRes.json();
    setDrinks(data);

    const nextDraft: Record<number, number> =
      {};
    data.forEach((d: Drink) => {
      nextDraft[d.id] = 0;
    });

    setDraft(nextDraft);
    setLoading(false);
  }

  function change(
    drinkId: number,
    value: number
  ) {
    setDraft((prev) => ({
      ...prev,
      [drinkId]: value < 0 ? 0 : value,
    }));
  }

  function openConfirm(drink: Drink) {
    const amount = draft[drink.id];
    if (!amount || amount <= 0) return;

    setConfirmDrink(drink);
    setConfirmAmount(amount);
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
    await init();
  }

  if (loading) {
    return <main className="p-6">Lade...</main>;
  }

  const total = drinks.reduce(
    (sum, d) => sum + d.amount,
    0
  );

  return (
    <main className="p-6 space-y-6 pb-24">
      <h1 className="text-xl font-bold">
        Hallo {name} 👋
      </h1>

      <div className="text-sm text-gray-600">
        Gesamt getrunken: {total}
      </div>

      <section className="bg-white p-4 rounded-xl shadow space-y-4">
        {drinks.map((d) => {
          const stockCases =
            d.unitsPerCase > 0
              ? Math.floor(
                  d.stock / d.unitsPerCase
                )
              : 0;

          const stockBottles =
            d.unitsPerCase > 0
              ? d.stock % d.unitsPerCase
              : d.stock;

          return (
            <div
              key={d.id}
              className="border rounded p-4 space-y-2"
            >
              <div className="font-medium">
                {d.name}
              </div>

              <div className="text-sm text-gray-600">
                Bereits getrunken: {d.amount}
              </div>

              <div className="text-xs text-gray-500">
                Lager: {stockCases} Kisten +{" "}
                {stockBottles} Flaschen
              </div>

              <div className="flex gap-2 items-center pt-2">
                <button
                  onClick={() =>
                    change(
                      d.id,
                      (draft[d.id] ?? 0) - 1
                    )
                  }
                  className="px-2 border rounded"
                >
                  −
                </button>

                <input
                  type="number"
                  min={0}
                  value={
                    draft[d.id] && draft[d.id] > 0
                      ? draft[d.id]
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;

                    change(
                      d.id,
                      value === ""
                        ? 0
                        : Number(value)
                    );
                  }}
                  className="w-16 text-center border rounded p-1"
                />

                <button
                  onClick={() =>
                    change(
                      d.id,
                      (draft[d.id] ?? 0) + 1
                    )
                  }
                  className="px-2 border rounded"
                >
                  +
                </button>

                <button
                  onClick={() =>
                    openConfirm(d)
                  }
                  disabled={
                    !draft[d.id] ||
                    draft[d.id] <= 0
                  }
                  className="ml-auto px-3 py-1 bg-green-600 text-white rounded disabled:bg-gray-300"
                >
                  Buchen
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* 🔥 Modal */}
      {confirmDrink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow w-80 space-y-4">
            <h2 className="text-lg font-bold">
              Buchung bestätigen
            </h2>

            <p>
              Möchtest du wirklich{" "}
              <strong>
                {confirmAmount}x{" "}
                {confirmDrink.name}
              </strong>{" "}
              buchen?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmDrink(null)
                }
                className="px-3 py-1 border rounded"
              >
                Abbrechen
              </button>

              <button
                onClick={
                  confirmBooking
                }
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