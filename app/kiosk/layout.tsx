import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import KioskAutoLogout from "@/components/KioskAutoLogout"

export default async function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  let user = null;

  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {user && <KioskAutoLogout />}

      {/* Header */}
      <header className="bg-feuerwehr-red text-white px-10 py-6 flex items-center justify-between shadow-xl">

          <div className="flex items-center gap-4">
            <img
              src="/icons/feuerwehr.png"
              alt="Feuerwehr"
              className="w-12 h-12"
            />

            <div>
              <h1 className="text-2xl font-bold tracking-wide">
                Feuerwehr Bedburg
              </h1>
              <p className="text-sm opacity-90">
                Einheit 5 – Strichliste
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold">
                {user.name}
              </span>

              <LogoutButton redirectTo="/kiosk" />
            </div>
          )}
      </header>

      {/* Content */}
      <main className="flex-1 p-10">
        {children}
      </main>

    </div>
  );
}