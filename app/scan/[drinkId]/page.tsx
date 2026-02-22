import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySignature } from "@/lib/qrSignature";

type Props = {
  params: { id: string };
  searchParams: { sig?: string };
};

export default async function ScanPage({
  params,
  searchParams,
}: Props) {
  const drinkId = Number(params.id);
  const signature = searchParams.sig;

  const cookieStore = cookies();
  const userId = Number(cookieStore.get("userId")?.value);

  // 🔐 Wenn nicht eingeloggt → Login mit Redirect
  if (!userId) {
    const currentUrl = `/scan/${drinkId}?sig=${signature}`;
    redirect(`/login?redirect=${encodeURIComponent(currentUrl)}`);
  }

  // ❌ Keine Signatur → Fehler
  if (!signature) {
    return (
      <main className="p-6">
        ❌ Ungültiger QR-Code (keine Signatur)
      </main>
    );
  }

  // 🔐 Signatur prüfen
  const valid = verifySignature(drinkId, signature);

  if (!valid) {
    return (
      <main className="p-6">
        ❌ Ungültige QR-Signatur
      </main>
    );
  }

  // Getränk holen
  const drink = await prisma.drink.findUnique({
    where: { id: drinkId },
  });

  if (!drink) {
    return (
      <main className="p-6">
        ❌ Getränk nicht gefunden
      </main>
    );
  }

  if (drink.stock <= 0) {
    return (
      <main className="p-6">
        ⚠️ Kein Lagerbestand mehr vorhanden
      </main>
    );
  }

  // 🥤 Buchung durchführen
  await prisma.$transaction([
    prisma.count.upsert({
      where: {
        userId_drinkId: {
          userId,
          drinkId,
        },
      },
      update: {
        amount: { increment: 1 },
      },
      create: {
        userId,
        drinkId,
        amount: 1,
      },
    }),

    prisma.drink.update({
      where: { id: drinkId },
      data: {
        stock: { decrement: 1 },
      },
    }),
  ]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow p-6 space-y-4 text-center max-w-sm w-full">

        <h1 className="text-xl font-bold">
          ✅ Buchung erfolgreich
        </h1>

        <div className="text-lg">
          1x <strong>{drink.name}</strong> wurde gebucht.
        </div>

        <div className="text-sm text-gray-600">
          Neuer Lagerbestand: {drink.stock - 1} Flaschen
        </div>

        <a
          href="/dashboard"
          className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Zurück zum Dashboard
        </a>

      </div>
    </main>
  );
}