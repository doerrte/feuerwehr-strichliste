import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySignature } from "@/lib/qr";

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: {
    sig?: string;
  };
}

export default async function ScanPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const drinkId = Number(params.id);

  if (!drinkId || isNaN(drinkId)) {
    return <main className="p-6">❌ Ungültige Getränk-ID</main>;
  }

  const signature = searchParams.sig;

  const cookieStore = cookies();
  const userIdRaw = cookieStore.get("userId")?.value;

  if (!userIdRaw) {
    const currentUrl = `/scan/${drinkId}?sig=${signature}`;
    redirect(`/login?redirect=${encodeURIComponent(currentUrl)}`);
  }

  const userId = Number(userIdRaw);

  if (!signature) {
    return <main className="p-6">❌ Ungültiger QR-Code</main>;
  }

  const valid = verifySignature(drinkId, signature);

  if (!valid) {
    return <main className="p-6">❌ Ungültige QR-Signatur</main>;
  }

  const drink = await prisma.drink.findUnique({
    where: { id: drinkId },
  });

  if (!drink) {
    return <main className="p-6">❌ Getränk nicht gefunden</main>;
  }

  if (drink.stock <= 0) {
    return <main className="p-6">⚠️ Kein Lagerbestand mehr</main>;
  }

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
      <div className="bg-white rounded-xl shadow p-6 text-center max-w-sm w-full">
        <h1 className="text-xl font-bold">
          ✅ Buchung erfolgreich
        </h1>

        <div className="text-lg mt-2">
          1x <strong>{drink.name}</strong> wurde gebucht.
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