"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function KioskAutoLogout() {
  const router = useRouter();

  const INACTIVITY_TIME = 5 * 60; // 5 Minuten in Sekunden

  const [secondsLeft, setSecondsLeft] = useState(INACTIVITY_TIME);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function resetTimer() {
    setSecondsLeft(INACTIVITY_TIME);
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/kiosk");
    router.refresh();
  }

  useEffect(() => {
    // Countdown läuft jede Sekunde
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const events = ["click", "touchstart", "keydown"];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div
      className="
        fixed top-4 right-4 z-[200]
        px-4 py-2 rounded-2xl
        backdrop-blur-xl
        shadow-lg
        border
        text-sm font-medium
        transition
        "
      style={{
        background:
          secondsLeft <= 10
            ? "rgba(220,38,38,0.9)"
            : "rgba(0,0,0,0.6)",
        color: "white",
      }}
    >
      ⏳ {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}