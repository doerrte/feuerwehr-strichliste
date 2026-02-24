"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { UserIcon,
          ArrowRightStartOnRectangleIcon
        } from "@heroicons/react/24/outline";

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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
  <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">

    <h1 className="text-lg font-semibold tracking-tight">
      {getTitle()}
    </h1>

    <div className="flex items-center gap-4">
      <ThemeToggle />
      <Link href="/dashboard/profile">
        <UserIcon />
      </Link>
      <ArrowRightStartOnRectangleIcon />
    </div>

  </div>
</header>
  );
}