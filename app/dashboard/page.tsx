"use client";

import { useEffect, useState } from "react";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  minStock: number;
  amount: number;
};

type User = {
  id: number;
  name: string;
  role: string;
};

export default function DashboardPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [bookingAmounts, setBookingAmounts] =
    useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchDrinks();
  }, []);

  async function fetchUser() {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return;

    const data = await res.json();
    setUser(data);
  }

  async function fetchDrinks() {
    const res = await fetch("/api/drinks/me");
    const data = await res.json();
    setDrinks(data);
    setLoading(false);
  }

  async function handleBook(drinkId: number) {
    const value = bookingAmounts[drinkId];
    const quantity = value ? Number(value) : 1;

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drinkId, quantity }),
    });

    if (!res.ok) {
      alert("Fehler beim Buchen");
      return;
    }

    setDrinks((prev) =>
      prev.map((d) =>
        d.id === drinkId
          ? {
              ...d,
              amount: d.amount + quantity,
              stock: d.stock - quantity,
            }
          : d
      )
    );

    setBookingAmounts((prev) => ({
      ...prev,
      [drinkId]: "",
    }));
  }

  function getStockBreakdown(stock: number, unitsPerCase: number) {
    const cases = Math.floor(stock / unitsPerCase);
    const bottles = stock % unitsPerCase;
    return { cases, bottles };
  }

  const totalStriche = drinks.reduce(
    (sum, drink) => sum + drink.amount,
    0
  );

  if (loading) {
    return <div className="p-6 text-center">Lade...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Hallo{" "}
          <span className="text-feuerwehr-red">
            {user?.name ?? "👋"}
          </span>
        </h1>

        <div className="
          mt-2
          inline-block
          bg-gradient-to-r
          from-feuerwehr-red
          to-feuerwehr-redDark
          text-white
          px-4
          py-1
          rounded-full
          text-sm
          shadow-glow
        ">
          Gesamt-Striche: {totalStriche}
        </div>
      </div>

      {drinks.map((drink) => {
        const breakdown = getStockBreakdown(
          drink.stock,
          drink.unitsPerCase
        );

        return (
          <div
            key={drink.id}
            className="
              bg-feuerwehr-lightCard
              dark:bg-feuerwehr-darkCard/80
              backdrop-blur-xl
              border
              border-feuerwehr-borderLight
              dark:border-feuerwehr-borderDark
              shadow-soft
              dark:shadow-premium
              rounded-premium
              p-5
              space-y-4
            "
          >
            <div>
              <h2 className="font-semibold text-lg">
                {drink.name}
              </h2>

              <p className="text-sm text-gray-500">
                Deine Striche:{" "}
                <span className="text-feuerwehr-red font-semibold">
                  {drink.amount}
                </span>
              </p>

              <p className="text-sm text-gray-500">
                Bestand:
                <span className="font-semibold ml-1">
                  {breakdown.cases} Kisten
                </span>{" "}
                +{" "}
                <span className="font-semibold">
                  {breakdown.bottles} Flaschen
                </span>
              </p>
            </div>

            {/* 🔥 Minus / Input / Plus */}
            <div className="flex items-center justify-center gap-4">

              <button
                onClick={() =>
                  setBookingAmounts((prev) => ({
                    ...prev,
                    [drink.id]: String(
                      Math.max(
                        1,
                        (Number(prev[drink.id]) || 1) - 1
                      )
                    ),
                  }))
                }
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"
              >
                −
              </button>

              <input
                type="number"
                min="1"
                value={bookingAmounts[drink.id] || ""}
                placeholder="1"
                onChange={(e) =>
                  setBookingAmounts((prev) => ({
                    ...prev,
                    [drink.id]: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className="
                  w-16
                  text-center
                  text-lg
                  font-semibold
                  border
                  border-feuerwehr-borderLight
                  dark:border-feuerwehr-borderDark
                  bg-white
                  dark:bg-feuerwehr-darkCard/70
                  rounded-lg
                  py-1
                "
              />

              <button
                onClick={() =>
                  setBookingAmounts((prev) => ({
                    ...prev,
                    [drink.id]: String(
                      (Number(prev[drink.id]) || 1) + 1
                    ),
                  }))
                }
                className="w-10 h-10 rounded-full bg-green-500 text-white"
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleBook(drink.id)}
              className="
                w-full
                py-3
                rounded-xl
                bg-feuerwehr-red
                hover:bg-feuerwehr-redDark
                text-white
                font-medium
                shadow-md
                hover:shadow-glow
                active:scale-95
                transition
              "
            >
              Buchen
            </button>
          </div>
        );
      })}
    </div>
  );
}