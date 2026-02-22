"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ScanPage() {
  const { drinkId } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        router.push(`/login?redirect=/scan/${drinkId}`);
        return;
      }

      // hier Buchung oder Anzeige
    }

    check();
  }, []);

  return <main>Scan wird verarbeitet...</main>;
}