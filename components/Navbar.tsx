"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  UsersIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

type Props = {
  role: "USER" | "ADMIN";
};

export default function Navbar({ role }: Props) {
  const pathname = usePathname();

  const navItems =
    role === "ADMIN"
      ? [
          { href: "/dashboard", label: "Home", icon: HomeIcon },
          { href: "/dashboard/admin/strichliste", label: "Striche", icon: ChartBarIcon },
          { href: "/dashboard/admin/lager", label: "Lager", icon: ArchiveBoxIcon },
          { href: "/dashboard/admin", label: "Admin", icon: UsersIcon },
          { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
        ]
      : [
          { href: "/dashboard", label: "Home", icon: HomeIcon },
          { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
        ];

  function getActiveHref() {
    const matches = navItems
      .map((item) => {
        if (
          pathname === item.href ||
          pathname.startsWith(item.href + "/")
        ) {
          return item.href;
        }
        return null;
      })
      .filter(Boolean) as string[];

    if (matches.length === 0) return null;

    return matches.sort((a, b) => b.length - a.length)[0];
  }

  const activeHref = getActiveHref();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 py-3 px-4">

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1"
            >
              <Icon
                className={`w-6 h-6 transition-all ${
                  active
                    ? "text-red-600 scale-110"
                    : "text-gray-400"
                }`}
              />

              <span
                className={`text-xs mt-1 ${
                  active
                    ? "text-red-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

      </div>
    </div>
  );
}