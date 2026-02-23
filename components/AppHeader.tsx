"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

type Props = {
  role: "USER" | "ADMIN";
};

export default function AppHeader({ role }: Props) {
  const pathname = usePathname();

  function getTitle() {
    if (pathname.startsWith("/dashboard/admin"))
      return "Admin";
    if (pathname.startsWith("/dashboard/admin/strichliste"))
      return "Strichliste";
    if (pathname.startsWith("/dashboard/profile"))
      return "Profil";
    if (pathname.startsWith("/dashboard"))
      return "Dashboard";
    return "";
  }

  return (
    <header className="flex-shrink-0 px-6 py-4 border-b dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl flex items-center justify-between">

      <h1 className="text-lg font-semibold tracking-tight">
        {getTitle()}
      </h1>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/profile"
          className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:scale-105 transition"
        >
          👤
        </Link>
        
        <ThemeToggle />
        <LogoutButton />
      </div>

    </header>
  );
}