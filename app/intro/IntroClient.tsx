"use client";

import { useRouter } from "next/navigation";

export default function IntroClient({ name }: { name: string }) {
  const router = useRouter();

  async function finishIntro() {
    await fetch("/api/auth/intro-complete", {
      method: "POST",
    });

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-6">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 max-w-md w-full space-y-6 text-center">

        <h1 className="text-2xl font-bold">
          Willkommen {name} 👋
        </h1>

        <p className="text-gray-600 dark:text-gray-400">
          Hier kannst du Getränke buchen, deinen Verbrauch sehen
          und deinen Stand jederzeit kontrollieren.
        </p>

        <button
          onClick={finishIntro}
          className="w-full py-3 rounded-2xl bg-red-600 text-white font-medium"
        >
          Los geht's 🚀
        </button>

      </div>
    </main>
  );
}