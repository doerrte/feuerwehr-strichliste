"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function KioskAutoLogout() {
  const router = useRouter();

  const INACTIVITY_SECONDS = 5 * 60; // 5 Minuten
  const [secondsLeft, setSecondsLeft] = useState(INACTIVITY_SECONDS);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggingOut = useRef(false);

  function resetTimer() {
    setSecondsLeft(INACTIVITY_SECONDS);
  }

  async function logout() {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.replace("/kiosk");
      router.refresh();
    } catch (error) {
      console.error("Auto logout failed:", error);
    }
  }

  useEffect(() => {
    // Countdown
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Interaktionen resetten Timer
    const events = ["click", "touchstart", "keydown"];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
        shadow-lg border
        text-sm font-semibold
        transition-all
      "
      style={{
        background:
          secondsLeft <= 10
            ? "rgba(220,38,38,0.95)"
            : "rgba(0,0,0,0.7)",
        color: "white",
      }}
    >
      ⏳ {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}