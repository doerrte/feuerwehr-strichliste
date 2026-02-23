import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

import InstallPrompt from "@/components/InstallPrompt";
import AppHeader from "@/components/AppHeader";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Feuerwehr Strichliste",
  description: "Digitale Getränkestrichliste",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const userIdRaw = cookieStore.get("userId")?.value;
  const userId = userIdRaw ? Number(userIdRaw) : null;

  let userRole: "USER" | "ADMIN" | null = null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    userRole = user?.role ?? null;
  }

  return (
    <html lang="de">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#dc2626" />
        <link
          rel="apple-touch-icon"
          href="/icons/feuerwehr.png"
        />
      </head>

      <body className="h-screen overflow-hidden bg-gray-100 dark:bg-gray-950 flex justify-center antialiased transition-colors">

        <InstallPrompt />

        {/* 📱 App Container */}
        <div className="relative w-full max-w-md h-screen flex flex-col bg-white dark:bg-gray-900 shadow-2xl overflow-hidden transition-colors">

          {/* Modal Root */}
          <div
            id="modal-root"
            className="absolute inset-0 z-50 pointer-events-none"
          />

          {/* Header nur wenn eingeloggt */}
          {userId && userRole && (
            <AppHeader role={userRole} />
          )}

          {/* Scrollbarer Content */}
          <main className="flex-1 overflow-y-auto px-6 pb-28 pt-2 bg-gray-50 dark:bg-gray-950">
            {children}
          </main>

          {/* Bottom Navigation nur wenn eingeloggt */}
          {userId && userRole && (
            <Navbar role={userRole} />
          )}

        </div>

      </body>
    </html>
  );
}