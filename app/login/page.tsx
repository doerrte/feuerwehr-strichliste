export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const userId = cookies().get("userId")?.value;

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div className="p-6">Lade...</div>}>
      <LoginForm />
    </Suspense>
  );
}