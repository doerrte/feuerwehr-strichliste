"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await res.json();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Lade...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto min-h-screen flex flex-col bg-white dark:bg-gray-900 shadow-xl">

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

      <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {children}
      </main>

      <Navbar role={user.role} />
    </div>
  );
}