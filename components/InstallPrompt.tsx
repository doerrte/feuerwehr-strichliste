"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(
      "installPromptSeen"
    );
    if (seen) return;

    const ua = navigator.userAgent;

    const ios =
      /iPhone|iPad|iPod/.test(ua);
    const android =
      /Android/.test(ua);

    const isStandalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      // @ts-ignore
      window.navigator.standalone === true;

    if (isStandalone) return;

    if (ios) {
      setIsIOS(true);
      setShow(true);
    }

    window.addEventListener(
      "beforeinstallprompt",
      (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      }
    );
  }, []);

  async function installApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const choice =
      await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      localStorage.setItem(
        "installPromptSeen",
        "true"
      );
      setShow(false);
    }
  }

  function close() {
    localStorage.setItem(
      "installPromptSeen",
      "true"
    );
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white shadow-xl rounded-xl p-4 z-50">
      <div className="flex justify-between items-center">

        <div className="text-sm">
          <div className="font-semibold">
            📲 App installieren
          </div>

          {isIOS ? (
            <div>
              Öffne in Safari → Teilen →
              „Zum Home-Bildschirm“
            </div>
          ) : (
            <div>
              Installiere die App für
              schnelleren Zugriff.
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isIOS && deferredPrompt && (
            <button
              onClick={installApp}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Installieren
            </button>
          )}

          <button
            onClick={close}
            className="text-gray-500 text-sm"
          >
            ✕
          </button>
        </div>

      </div>
    </div>
  );
}