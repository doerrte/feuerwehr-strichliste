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
    });

    router.replace("/login");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:scale-105 transition"
      >
        ⎋
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">

            <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5">

              <h2 className="text-lg font-semibold text-center">
                Wirklich ausloggen?
              </h2>

              <p className="text-sm text-gray-500 text-center">
                Du musst dich danach erneut anmelden.
              </p>

              <div className="flex gap-3">
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
        )}
    </>
  );
}