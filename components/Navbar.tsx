"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<"ADMIN" | "USER" | null>(null);
  const [checked, setChecked] = useState(false);
  const [adminRoute, setAdminRoute] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center shadow">

        {/* 🔧 Admin Menü */}
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

        {/* 👤 User Menü */}
        {role === "USER" && (
          <select
            value={adminRoute}
            onChange={(e) => handleAdminChange(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="" disabled>Menü</option>
            <option value="/dashboard">Dashboard</option>
            <option value="/dashboard/profile">
              Profil
            </option>
          </select>
        )}

        {/* 🚪 Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="text-red-600 font-medium"
        >
          Logout
        </button>
      </nav>

      {/* 🔥 Logout Bestätigungs-Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow space-y-4 w-80">

            <h2 className="font-bold text-lg">
              Logout bestätigen
            </h2>

            <p className="text-sm text-gray-600">
              Möchtest du dich wirklich abmelden?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3 py-1 border rounded"
              >
                Abbrechen
              </button>

              <button
                onClick={logout}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Ja, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}