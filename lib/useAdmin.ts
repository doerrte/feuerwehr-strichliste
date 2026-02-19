"use client";

import { useEffect, useState } from "react";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        setIsAdmin(!!data?.isAdmin);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { isAdmin, loading };
}
