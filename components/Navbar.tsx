"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

type Props = {
  role: "USER" | "ADMIN";
};

export default function Navbar({ role }: Props) {
  const pathname = usePathname();

  const navItems =
    role === "ADMIN"
      ? [
          { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
          { href: "/dashboard/admin/strichliste", label: "Striche", icon: ChartBarIcon },
          { href: "/dashboard/admin/lager", label: "Lager", icon: ArchiveBoxIcon },
          { href: "/dashboard/admin", label: "Benutzer", icon: UsersIcon },
          { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
          { href: "/dashboard/admin/logs", label: "Logs", icon: ClipboardDocumentListIcon },
        ]
      : [
          { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
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
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
      <div
        className="
          bg-white/90 dark:bg-gray-900/90
          backdrop-blur-2xl
          rounded-3xl
          shadow-2xl
          border border-white/20 dark:border-gray-800
          px-2 py-2
          overflow-x-auto
          scrollbar-hide
        "
      >
        <div className="flex items-center gap-1 min-w-max">

          {navItems.map((item) => {
            const active = activeHref === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-shrink-0"
              >
                <div
                  className={`
                    relative flex flex-col items-center justify-center gap-1
                    px-4 py-2 rounded-2xl
                    transition-all duration-300
                    ${
                      active
                        ? "text-red-600"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                >
                  {active && (
                    <div className="absolute inset-0 bg-red-50 dark:bg-red-900/30 rounded-2xl -z-10" />
                  )}

                  <Icon
                    className={`w-6 h-6 transition-transform duration-300 ${
                      active ? "scale-110 stroke-2" : "stroke-1"
                    }`}
                  />

                  <span className="text-[11px] font-medium tracking-wide">
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