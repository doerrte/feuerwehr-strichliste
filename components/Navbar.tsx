"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<"ADMIN" | "USER" | null>(null);
  const [checked, setChecked] = useState(false);
  const [adminRoute, setAdminRoute] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setChecked(true);
        return;
      }

      const data = await res.json();
      setRole(data.role);
      setChecked(true);
    }

    load();
  }, []);

  if (!checked) return null;
  if (pathname === "/login") return null;
  if (!role) return null;

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/login";
  }

  function handleAdminChange(value: string) {
    if (!value) return;
    router.push(value);
    setAdminRoute("");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center shadow margin-auto">

      {/* 🔧 Admin Dropdown */}
      {role === "ADMIN" && (
        <select
          value={adminRoute}
          onChange={(e) => handleAdminChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="" disabled>Menü</option>
          <option value="/dashboard">Dashboard</option>
          <option value="/dashboard/admin">
            Benutzerverwaltung
          </option>
          <option value="/dashboard/admin/strichliste">
            Strichliste
          </option>
          <option value="/dashboard/admin/lager">
            Lager
          </option>
           <option value="/dashboard/profile">
            Profil
          </option>
        </select>
      )}

       {role === "USER" && (
        <select
          value={adminRoute}
          onChange={(e) => handleAdminChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="" disabled>Menü</option>
          <option value="/dashboard/">Dashboard</option>
           <option value="/dashboard/profile">
            Profil
          </option>
        </select>
      )}

      {/* 🚪 Logout */}
      <button
        onClick={logout}
        className="text-red-600 font-medium"
      >
        Logout
      </button>
    </nav>
  );
}
