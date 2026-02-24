import "./globals.css";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feuerwehr Getränkeliste",
  description: "Strichliste",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/feuerwehr.png",
  },
};

export default async function RootLayout({
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
        role: true,
      },
    });
  }

  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

        <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col bg-white dark:bg-gray-900 shadow-xl">

          {user && (
            <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <h1 className="text-sm font-semibold tracking-wide">
                Einheit 5 Strichliste
              </h1>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LogoutButton />
              </div>
            </header>
          )}

          <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
            {children}
          </main>

          {user && <Navbar role={user.role} />}

        </div>

      </body>
    </html>
  );
}