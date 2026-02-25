"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

type Props = {
  redirectTo?: string;
};

export default function LogoutButton({ redirectTo }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();

  window.location.href = data.redirect;
}

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          p-2 rounded-xl
          bg-gray-100 dark:bg-gray-800
          text-gray-600 dark:text-gray-300
          hover:bg-red-100 dark:hover:bg-red-900/40
          hover:text-red-600
          transition
        "
      >
        <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">

              <h3 className="text-lg font-semibold text-center">
                Wirklich ausloggen?
              </h3>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800"
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