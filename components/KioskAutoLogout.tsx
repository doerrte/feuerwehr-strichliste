"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function KioskAutoLogout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const INACTIVITY_TIME = 5 * 60 * 1000; // 5 Minuten

  function resetTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.replace("/kiosk");
      router.refresh();
    }, INACTIVITY_TIME);
  }

  useEffect(() => {
    resetTimer();

    const events = ["click", "touchstart", "keydown"];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, []);

  return null;
}