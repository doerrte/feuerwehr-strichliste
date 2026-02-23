"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  role: "USER" | "ADMIN";
};

export default function Navbar({ role }: Props) {
  const pathname = usePathname();

  function item(href: string, label: string, icon: string) {
    const active = pathname.startsWith(href);

    return (
      <Link
        href={href}
        className="flex flex-col items-center flex-1"
      >
        <div
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            active
              ? "text-red-600 scale-110"
              : "text-gray-500"
          }`}
        >
          <span className="text-xl">{icon}</span>
          <span className="text-xs font-medium">
            {label}
          </span>

          {active && (
            <div className="w-1 h-1 bg-red-600 rounded-full mt-1" />
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">

      <div className="flex justify-between items-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl px-6 py-3 border border-white/20">

        {item("/dashboard", "Dashboard", "🏠")}

        {role === "USER" &&
          item("/dashboard/profile", "Profil", "👤")}

        {role === "ADMIN" && (
          <>
            {item("/dashboard/admin/strichliste", "Striche", "📊")}
            {item("/dashboard/admin/lager", "Lager", "📦")}
            {item("/dashboard/admin", "Admin", "👥")}
            {item("/dashboard/admin/logs", "Logs", "📜")}


          </>
        )}

      </div>

    </div>
  );
}