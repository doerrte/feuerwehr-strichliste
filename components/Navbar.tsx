"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  HomeIcon as HomeOutline,
  ArchiveBoxIcon as ArchiveOutline,
  UsersIcon as UsersOutline,
  UserIcon as UserOutline,
  ChartBarIcon as ChartOutline,
  DocumentTextIcon as DocumentOutline,
} from "@heroicons/react/24/outline";

import {
  HomeIcon as HomeSolid,
  ArchiveBoxIcon as ArchiveSolid,
  UsersIcon as UsersSolid,
  UserIcon as UserSolid,
  ChartBarIcon as ChartSolid,
  DocumentTextIcon as DocumentSolid,
} from "@heroicons/react/24/solid";

type Props = {
  role: "USER" | "ADMIN";
};

export default function Navbar({ role }: Props) {
  const pathname = usePathname();
  const [hasLowStock, setHasLowStock] = useState(false);

  // 🔥 Low Stock prüfen (nur Admin)
  useEffect(() => {
    if (role !== "ADMIN") return;

    async function checkLowStock() {
      const res = await fetch("/api/admin/low-stock");
      const data = await res.json();
      setHasLowStock(data.low);
    }

    checkLowStock();
    const interval = setInterval(checkLowStock, 30000);

    return () => clearInterval(interval);
  }, [role]);

  const navItems =
    role === "ADMIN"
      ? [
          {
            href: "/dashboard",
            label: "Dashboard",
            icon: HomeOutline,
            activeIcon: HomeSolid,
          },
          {
            href: "/dashboard/admin/strichliste",
            label: "Striche",
            icon: ChartOutline,
            activeIcon: ChartSolid,
          },
          {
            href: "/dashboard/admin/lager",
            label: "Lager",
            icon: ArchiveOutline,
            activeIcon: ArchiveSolid,
            badge: hasLowStock,
          },
          {
            href: "/dashboard/admin",
            label: "Benutzer",
            icon: UsersOutline,
            activeIcon: UsersSolid,
          },
          {
            href: "/dashboard/profile",
            label: "Profil",
            icon: UserOutline,
            activeIcon: UserSolid,
          },
          {
            href: "/dashboard/admin/logs",
            label: "Logs",
            icon: DocumentOutline,
            activeIcon: DocumentSolid,
          },
        ]
      : [
          {
            href: "/dashboard",
            label: "Dashboard",
            icon: HomeOutline,
            activeIcon: HomeSolid,
          },
          {
            href: "/dashboard/profile",
            label: "Profil",
            icon: UserOutline,
            activeIcon: UserSolid,
          },
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
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800 px-3 py-2">

        <div className="flex items-center justify-between">

          {navItems.map((item) => {
            const active = activeHref === item.href;
            const Icon = active ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex-1 text-center"
              >
                <div
                  className={`flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${
                    active
                      ? "text-red-600"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-6 h-6" />

                    {/* 🔥 Low Stock Badge */}
                    {"badge" in item && item.badge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
                    )}
                  </div>

                  <span className="text-[11px] font-medium">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}

        </div>
      </div>
    </div>
  );
}