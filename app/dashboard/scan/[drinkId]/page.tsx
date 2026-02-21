"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ScanPage() {
  const { drinkId } = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("Buchung läuft...");

  useEffect(() => {
    async function run() {
      const me = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!me.ok) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/scan", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          drinkId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Fehler");
        return;
      }

      setMessage("✅ Getränk erfolgreich gebucht!");

      setTimeout(() => {
        router.replace("/dashboard");
      }, 1500);
    }

    run();
  }, [drinkId, router]);

  return (
    <main className="p-6 flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded-xl shadow text-center">
        {message}
      </div>
    </main>
  );
}