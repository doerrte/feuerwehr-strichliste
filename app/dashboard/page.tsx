"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Drink = {
  id: number;
  name: string;
  stock: number;
  unitsPerCase: number;
  minStock: number;
  userStrikes: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);

      const drinksRes = await fetch("/api/drinks/me");
      const drinksData = await drinksRes.json();

      setDrinks(drinksData);
      setLoading(false);
    }

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Lade Dashboard...
      </div>
    );
  }

  const totalStrikes = drinks.reduce(
    (sum, d) => sum + (d.userStrikes || 0),
    0
  );

  return (
    <div className="space-y-8 pb-28">

      {/* Greeting */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Hallo {user.name}
            </p>

            <h1 className="text-2xl font-semibold">
              Dashboard
            </h1>
          </div>

          <div className="bg-red-600 text-white text-sm px-4 py-2 rounded-full shadow">
            {totalStrikes} Striche
          </div>
        </div>

        <p className="text-gray-500 text-sm">
          Getränke buchen & Überblick behalten
        </p>
      </div>

      {/* Drink Cards */}
      <div className="space-y-5">
        {drinks.map((drink) => {
          const cases = Math.floor(
            drink.stock / drink.unitsPerCase
          );
          const bottles =
            drink.stock % drink.unitsPerCase;

          return (
            <div
              key={drink.id}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border space-y-3"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">
                  {drink.name}
                </h3>

                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  Deine Striche: {drink.userStrikes}
                </span>
              </div>

              <div className="text-sm text-gray-500">
                Bestand: {cases} Kisten + {bottles} Flaschen
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}