"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();

          if (data?.id) {
            router.replace("/dashboard");
            return;
          }
        }

        // Nicht eingeloggt
        router.replace("/login");

      } catch {
        router.replace("/login");
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      Lade App...
    </div>
  );
}