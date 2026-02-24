"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../login/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.user) {
        router.replace("/dashboard");
      }
    }

    checkAuth();
  }, [router]);

  return <LoginForm />;
}