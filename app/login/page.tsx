export const dynamic = "force-dynamic";

import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6">Lade...</div>}>
      <LoginForm />
    </Suspense>
  );
}