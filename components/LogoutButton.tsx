"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setOpen(false);
    router.replace("/login");
  }

  const modal = open && mounted && createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 w-[90%] max-w-sm space-y-4 animate-scale-in">

        <h2 className="text-lg font-semibold text-center">
          Wirklich ausloggen?
        </h2>

        <p className="text-sm text-gray-500 text-center">
          Du musst dich danach erneut anmelden.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-2 rounded-xl bg-gray-200 dark:bg-gray-700"
          >
            Abbrechen
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 py-2 rounded-xl bg-red-600 text-white"
          >
            Logout
          </button>
        </div>

      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition"
      >
        ⎋
      </button>

      {modal}
    </>
  );
}