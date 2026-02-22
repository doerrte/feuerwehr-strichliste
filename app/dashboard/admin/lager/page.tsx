import { prisma } from "@/lib/prisma";
import { createSignature } from "@/lib/qrSignature";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LagerPage() {
  const drinks = await prisma.drink.findMany({
    orderBy: { name: "asc" },
  });

  const base =
    process.env.NEXT_PUBLIC_BASE_URL!;

  const drinksWithQR = await Promise.all(
    drinks.map(async (drink) => {
      const sig = createSignature(drink.id);

      const url = `${base}/scan/${drink.id}?sig=${sig}`;

      const qr = await QRCode.toDataURL(url);

      return {
        ...drink,
        qr,
      };
    })
  );

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        📦 Lagerverwaltung
      </h1>

      <div className="space-y-6">
        {drinksWithQR.map((drink) => {
          const stockCases =
            drink.unitsPerCase > 0
              ? Math.floor(
                  drink.stock / drink.unitsPerCase
                )
              : 0;

          const stockBottles =
            drink.unitsPerCase > 0
              ? drink.stock % drink.unitsPerCase
              : drink.stock;

          return (
            <div
              key={drink.id}
              className="bg-white p-4 rounded shadow space-y-2"
            >
              <div className="font-bold">
                {drink.name}
              </div>

              <div className="text-sm">
                Bestand: {drink.stock} Flaschen
              </div>

              <div className="text-xs text-gray-500">
                = {stockCases} Kisten +{" "}
                {stockBottles} Flaschen
              </div>

              <img
                src={drink.qr}
                className="w-32 h-32"
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}