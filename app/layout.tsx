import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Feuerwehr Getränke",
  description: "Strichlisten App",
};

export const viewport = {
  themeColor: "#111827",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const userId = Number(cookieStore.get("userId")?.value);

  let user = null;

  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });
  }

  const isLoginPage = false; // Login wird separat gerendert

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>

      <body className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">

        <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col bg-white dark:bg-gray-900 shadow-xl">

          {/* ===== Header ===== */}
          {user && (
            <header className="flex items-center justify-between px-4 py-3 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-40">

              <h1 className="text-sm font-semibold tracking-wide">
                Feuerwehr Getränke
              </h1>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LogoutButton />
              </div>

            </header>
          )}

          {/* ===== Content ===== */}
          <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
            {children}
          </main>

          {/* ===== Bottom Navbar ===== */}
          {user && (
            <Navbar role={user.role} />
          )}

        </div>

      </body>
    </html>
  );
}