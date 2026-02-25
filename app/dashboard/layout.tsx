"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";

type User = {
  id: number;
  name: string;
  role: "USER" | "ADMIN";
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        const data = await res.json();

        // 🔥 Nur redirecten wenn wir wirklich im Dashboard sind
        if (!data.user && pathname.startsWith("/dashboard")) {
          router.replace("/login");
          return;
        }

        setUser(data.user);
        setLoading(false);
      } catch {
        if (pathname.startsWith("/dashboard")) {
          router.replace("/login");
        }
      }
    }

    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-500 animate-pulse">
          Lade...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="
        relative
        w-full
        max-w-md
        sm:max-w-lg
        md:max-w-3xl
        lg:max-w-5xl
        mx-auto
        min-h-screen
        flex
        flex-col
        bg-white
        dark:bg-gray-900
        shadow-xl
      "
    >
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <h1 className="text-sm sm:text-base font-semibold tracking-wide">
          Feuerwehr Bedburg <br />
          Einheit 5 Strichliste
        </h1>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {children}
      </main>

      {/* Bottom Navbar */}
      <Navbar role={user.role} />
    </div>
  );
}