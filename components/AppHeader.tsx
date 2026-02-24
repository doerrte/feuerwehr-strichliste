"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";

type Props = {
  role: "USER" | "ADMIN";
};

export default function AppHeader({ role }: Props) {
  const pathname = usePathname();

  function getTitle() {
    // 🔥 Wichtig: Spezifischste Route zuerst!
    if (pathname.startsWith("/dashboard/admin/strichliste"))
      return "Strichliste";

    if (pathname.startsWith("/dashboard/admin/lager"))
      return "Lager";

    if (pathname.startsWith("/dashboard/admin/logs"))
      return "Logs";

    if (pathname === "/dashboard/admin")
      return "Benutzer";

    if (pathname.startsWith("/dashboard/profile"))
      return "Profil";

    if (pathname.startsWith("/dashboard"))
      return "Dashboard";

    return "";
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">

        {/* Titel */}
        <h1 className="text-lg font-semibold tracking-tight">
          {getTitle()}
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profil nur für USER anzeigen (Admin hat Profil über Navbar) */}
          {role === "USER" && (
            <Link
              href="/dashboard/profile"
              className="
                p-2 rounded-xl
                bg-gray-100 dark:bg-gray-800
                text-gray-600 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition
              "
            >
              <UserIcon className="w-5 h-5" />
            </Link>
          )}

          {/* Logout */}
          <LogoutButton />

        </div>
      </div>
    </header>
  );
}