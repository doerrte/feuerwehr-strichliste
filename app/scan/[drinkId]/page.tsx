import { verifySignature } from "@/lib/qrSignature";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ScanPage({
  params,
  searchParams,
}: {
  params: { drinkId: string };
  searchParams: { sig?: string };
}) {
  const drinkId = Number(params.drinkId);
  const signature = searchParams.sig;

  // 🔐 Signatur prüfen
  if (!signature || !verifySignature(drinkId, signature)) {
    return (
      <main className="p-6">
        ❌ Ungültiger QR-Code
      </main>
    );
  }

  // 👤 Login prüfen
  const userId = Number(
    cookies().get("userId")?.value
  );

  if (!userId) {
    redirect(
      `/login?redirect=/scan/${drinkId}?sig=${signature}`
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.active) {
    redirect("/login");
  }

  const drink = await prisma.drink.findUnique({
    where: { id: drinkId },
  });

  if (!drink || drink.stock <= 0) {
    return (
      <main className="p-6">
        ❌ Getränk nicht verfügbar
      </main>
    );
  }

  // 🧾 Buchung
  await prisma.count.upsert({
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
  });

  await prisma.drink.update({
    where: { id: drinkId },
    data: {
      stock: { decrement: 1 },
    },
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">
        ✅ 1x {drink.name} gebucht
      </h1>

      <p>
        Neuer Bestand: {drink.stock - 1}
      </p>

      <a
        href="/dashboard"
        className="text-blue-600 underline"
      >
        Zurück zum Dashboard
      </a>
    </main>
  );
}