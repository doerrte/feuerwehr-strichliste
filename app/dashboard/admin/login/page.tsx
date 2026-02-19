"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <p>Lade Admin-Bereich…</p>;
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
    </main>
  );
}