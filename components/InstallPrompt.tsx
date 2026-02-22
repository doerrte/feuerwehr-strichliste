"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [browser, setBrowser] = useState<
    "ios" | "android" | null
  >(null);

  useEffect(() => {
    // Schon gesehen?
    const seen = localStorage.getItem(
      "installPromptSeen"
    );
    if (seen) return;

    const ua = navigator.userAgent;

    const isIOS =
      /iPhone|iPad|iPod/.test(ua);
    const isAndroid =
      /Android/.test(ua);

    const isInStandalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      // @ts-ignore
      window.navigator.standalone === true;

    // Wenn bereits als App installiert → nichts anzeigen
    if (isInStandalone) return;

    if (isIOS) {
      setBrowser("ios");
      setShow(true);
    } else if (isAndroid) {
      setBrowser("android");
      setShow(true);
    }
  }, []);

  function close() {
    localStorage.setItem(
      "installPromptSeen",
      "true"
    );
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">

        <h2 className="text-lg font-bold text-center">
          📲 App installieren
        </h2>

        {browser === "ios" && (
          <div className="text-sm space-y-2">
            <p>
              Öffne diese Seite in{" "}
              <strong>Safari</strong>.
            </p>
            <p>
              Tippe unten auf das{" "}
              <strong>Teilen-Symbol</strong>.
            </p>
            <p>
              Wähle{" "}
              <strong>
                „Zum Home-Bildschirm“
              </strong>.
            </p>
          </div>
        )}

        {browser === "android" && (
          <div className="text-sm space-y-2">
            <p>
              Öffne diese Seite in{" "}
              <strong>Chrome</strong>.
            </p>
            <p>
              Tippe oben rechts auf die{" "}
              <strong>3 Punkte</strong>.
            </p>
            <p>
              Wähle{" "}
              <strong>
                „Zum Startbildschirm hinzufügen“
              </strong>.
            </p>
          </div>
        )}

        <button
          onClick={close}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}