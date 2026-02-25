"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Navbar from "@/components/Navbar";

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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
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
      } catch {
        router.replace("/login");
      }
    }

    checkAuth();
  }, [router]);

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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* App Header */}
      <AppHeader role={user.role} />

      {/* Content */}
      <main className="
        flex-1
        w-full
        max-w-sm
        sm:max-w-md
        md:max-w-lg
        lg:max-w-xl
        mx-auto
        px-6
        py-6
        pb-28
      ">
        {children}
      </main>

      {/* Bottom Navbar */}
      <Navbar role={user.role} />

    </div>
  );
}