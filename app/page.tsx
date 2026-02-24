"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();

        if (data?.id) {
          router.replace("/dashboard");
        }
      }
    }

    checkAuth();
  }, [router]);

  return null; // Kein Redirect hier!
}