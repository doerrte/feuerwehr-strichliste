"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Drink = {
  id: number;
  name: string;
  amount: number; // bereits getrunken
  stock: number;
  unitsPerCase: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [draft, setDraft] = useState<Record<number, number>>({});

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
      cache: "no-store",
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

  function change(drinkId: number, value: number) {
    setDraft((prev) => ({
      ...prev,
      [drinkId]: value < 0 ? 0 : value,
    }));
  }

  async function confirmBooking(drink: Drink) {
    const amount = draft[drink.id];

    if (!amount || amount <= 0) return;

    await fetch("/api/drinks/increment", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        drinkId: drink.id,
        amount,
      }),
    });

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
        Gesamt getrunken: {total} Flaschen
      </div>

      <section className="bg-white p-4 rounded-xl shadow space-y-4">
        {drinks.map((d) => {
          const stockCases =
            d.unitsPerCase > 0
              ? Math.floor(d.stock / d.unitsPerCase)
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
                  value={draft[d.id] ?? 0}
                  onChange={(e) =>
                    change(
                      d.id,
                      Number(e.target.value)
                    )
                  }
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
                    confirmBooking(d)
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
    </main>
  );
}