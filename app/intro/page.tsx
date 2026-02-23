"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function IntroPage() {
  const router = useRouter();

  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();

    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));

    // Prüfen ob App bereits installiert ist
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standalone);
  }, []);

  async function finishIntro() {
    await fetch("/api/auth/intro-complete", {
      method: "POST",
    });

    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-600 to-red-800 text-white">

      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">

        <h1 className="text-2xl font-bold text-center">
          Willkommen 👋
        </h1>

        {!isStandalone && (
          <div className="space-y-4 text-sm leading-relaxed">

            <p>
              Installiere die App auf deinem Startbildschirm,
              um sie wie eine echte App zu nutzen.
            </p>

            {isIOS && (
              <div className="bg-white/10 p-4 rounded-xl">
                <p className="font-semibold mb-2">
                  📱 iPhone / iPad:
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Unten auf das Teilen-Symbol tippen</li>
                  <li>"Zum Home-Bildschirm" auswählen</li>
                  <li>Hinzufügen bestätigen</li>
                </ol>
              </div>
            )}

            {isAndroid && (
              <div className="bg-white/10 p-4 rounded-xl">
                <p className="font-semibold mb-2">
                  🤖 Android:
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Oben rechts auf ⋮ tippen</li>
                  <li>"App installieren" auswählen</li>
                  <li>Installieren bestätigen</li>
                </ol>
              </div>
            )}

          </div>
        )}

        {isStandalone && (
          <p className="text-center text-sm">
            🎉 App ist bereits installiert!
          </p>
        )}

        <button
          onClick={finishIntro}
          className="w-full bg-white text-red-700 font-semibold py-3 rounded-2xl shadow-md active:scale-95 transition"
        >
          Verstanden
        </button>

      </div>
    </div>
  );
}