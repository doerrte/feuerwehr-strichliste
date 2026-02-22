import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function IntroPage() {
  const cookieStore = cookies();
  const userId = Number(
    cookieStore.get("userId")?.value
  );

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/login");
  }

  async function finishIntro() {
    "use server";

    await prisma.user.update({
      where: { id: userId },
      data: { hasSeenIntro: true },
    });

    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white max-w-md w-full rounded-xl shadow p-6 space-y-6">

        {/* 👇 Hier ist der Benutzername */}
        <h1 className="text-xl font-bold">
          Willkommen, {user.name} 👋
        </h1>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold">
            Für Benutzer
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Getränk auswählen</li>
            <li>Anzahl mit + / – festlegen</li>
            <li>Buchung bestätigen</li>
            <li>QR-Code für Schnellbuchung nutzen</li>
          </ul>
        </section>

        {user.role === "ADMIN" && (
          <section className="space-y-2 text-sm">
            <h2 className="font-semibold">
              Für Admins
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Lager verwalten</li>
              <li>Mindestbestand setzen</li>
              <li>Strichliste korrigieren</li>
              <li>QR-Codes generieren</li>
              <li>Reset durchführen</li>
            </ul>
          </section>
        )}

        <form action={finishIntro}>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Verstanden
          </button>
        </form>

      </div>
    </main>
  );
}